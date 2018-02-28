'use strict';

import * as vscode from 'vscode';
import { IExternalAPI, ICodeDeployer, IToolRunner } from './externalapi';
import { RioLog } from './riolog';
import { Properties} from './properties';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log(context.extensionPath)

    let riolog = new RioLog();
    context.subscriptions.push(riolog);

    let properties = new Properties();
    context.subscriptions.push(properties);

    let extensionResourceLocation = path.join(context.extensionPath, 'resources');

    let tools = new Array<IToolRunner>();
    let codeDeployers = new Array<ICodeDeployer>();
    let codeDebuggers = new Array<ICodeDeployer>();

    let api : IExternalAPI = {
        async startRioLog(teamNumber: number) : Promise<void> {
            riolog.connect(teamNumber, path.join(extensionResourceLocation, 'riolog'));
        },
        async getTeamNumber(): Promise<number> {
            return await properties.getTeamNumber();
        },
        async setTeamNumber(teamNumber: number): Promise<void> {
            await properties.setTeamNumber(teamNumber);
        },
        async startTool(): Promise<void> {
            if (tools.length <= 0) {
                vscode.window.showErrorMessage('No tools found. Please install some');
                return;
            }

            let toolNames = new Array<string>();
            for (let t of tools) {
                toolNames.push(t.getDisplayName());
            }

            let result = await vscode.window.showQuickPick(toolNames);

            if (result === undefined) {
                vscode.window.showInformationMessage('Tool run canceled');
                return;
            }

            for (let t of tools) {
                if (t.getDisplayName() === result) {
                    await t.runTool();
                    return;
                }
            }

            vscode.window.showErrorMessage('Invalid tool entered');
            return;
        },
        addTool(tool: IToolRunner): void {
            tools.push(tool);
        },
        async deployCode(): Promise<boolean> {
            if (codeDeployers.length <= 0) {
                vscode.window.showErrorMessage('No registered deployers');
                return false;
            }

            let availableDeployers = new Array<ICodeDeployer>();
            for (let d of codeDeployers) {
                if (await d.getIsCurrentlyValid()) {
                    availableDeployers.push(d);
                }
            }

            if (availableDeployers.length <= 0) {
                vscode.window.showErrorMessage('No registered deployers');
                return false;
            } else if (availableDeployers.length === 1) {
                await availableDeployers[0].runDeployer(await this.getTeamNumber());
            } else {
                let names = new Array<string>();
                for (let d of availableDeployers) {
                    names.push(d.getDisplayName());
                }
                let result = await vscode.window.showQuickPick(names);
                if (result === undefined) {
                    await vscode.window.showInformationMessage('Deploy exited');
                    return false;
                }

                for (let d of availableDeployers) {
                    if (d.getDisplayName() === result) {
                        return await d.runDeployer(await this.getTeamNumber());
                    }
                }

                await vscode.window.showInformationMessage('Deploy exited');
                return false;
            }
            return false;
        },
        registerCodeDeploy(deployer: ICodeDeployer): void {
            codeDeployers.push(deployer);
        },
        async debugCode(): Promise<boolean> {
            if (codeDebuggers.length <= 0) {
                vscode.window.showErrorMessage('No registered debuggers');
                return false;
            }

            let availableDebuggers = new Array<ICodeDeployer>();
            for (let d of codeDebuggers) {
                if (await d.getIsCurrentlyValid()) {
                    availableDebuggers.push(d);
                }
            }

            if (availableDebuggers.length <= 0) {
                vscode.window.showErrorMessage('No registered debuggers');
                return false;
            } else if (availableDebuggers.length === 1) {
                await availableDebuggers[0].runDeployer(await this.getTeamNumber());
            } else {
                let names = new Array<string>();
                for (let d of availableDebuggers) {
                    names.push(d.getDisplayName());
                }
                let result = await vscode.window.showQuickPick(names);
                if (result === undefined) {
                    await vscode.window.showInformationMessage('Debug exited');
                    return false;
                }

                for (let d of availableDebuggers) {
                    if (d.getDisplayName() === result) {
                        return await d.runDeployer(await this.getTeamNumber());
                    }
                }

                await vscode.window.showInformationMessage('Debug exited');
                return false;
            }
            return false;
        },
        registerCodeDebug(deployer: ICodeDeployer): void {
            codeDebuggers.push(deployer);
        },
        getApiVersion(): number {
            return 1;
        }
    };

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-wpilib-core" is now active!');

    context.subscriptions.push(vscode.commands.registerCommand('wpilibcore.startRioLog', async () =>{
        await api.startRioLog(await api.getTeamNumber());
    }));

    context.subscriptions.push(vscode.commands.registerCommand('wpilibcore.setTeamNumbers', async () =>{
        await api.setTeamNumber(await properties.requestTeamNumber());
    }));

    context.subscriptions.push(vscode.commands.registerCommand('wpilibcore.startTool', async () =>{
        await api.startTool();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('wpilibcore.deployCode', async () =>{
        await api.deployCode();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('wpilibcore.debugCode', async () =>{
        await api.debugCode();
    }));

    return api;
}

// this method is called when your extension is deactivated
export function deactivate() {
}
