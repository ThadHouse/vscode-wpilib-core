'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ExternalAPI } from './externalapi';
import { RioLog } from './riolog';
import { Properties} from './properties';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let riolog = new RioLog();
    context.subscriptions.push(riolog);

    let properties = new Properties();
    context.subscriptions.push(properties);

    let extension = vscode.extensions.getExtension('wpifirst.vscode-wpilib-core');

    if (extension === undefined) {
        vscode.window.showErrorMessage('Unable to find extension');
        return;
    }

    let extensionResourceLocation = path.join(extension.extensionPath, 'resources');

    let api : ExternalAPI = {
        async startRioLog(teamNumber: number) : Promise<void> {
            riolog.connect(teamNumber, path.join(extensionResourceLocation, 'riolog'));
        },
        async getTeamNumber(): Promise<number> {
            return await properties.getTeamNumber();
        },
        async setTeamNumber(teamNumber: number): Promise<void> {
            await properties.setTeamNumber(teamNumber);
        },
        async resolveRoboRioIp(teamNumber: number): Promise<string> {
            return 'Hello';
        },
        async startTool(): Promise<void> {

        },
        async deployCode(teamNumber: number): Promise<boolean> {
            return false;
        },
        registerCodeDeploy(callback: (teamNumber: number) => Promise<boolean>, name: string): void {

        },
        async debugCode(teamNumber: number): Promise<boolean> {
            return false;
        },
        registerCodeDebug(callback: (teamNumber: number) => Promise<boolean>, name: string): void {

        }
    }

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-wpilib-core" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push();

    return api;
}

// this method is called when your extension is deactivated
export function deactivate() {
}
