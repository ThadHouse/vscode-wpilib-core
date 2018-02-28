'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import { loadFileToString, writeStringToFile } from './utilities';
import * as jsonc from 'jsonc-parser';

export class Properties {
  private settingFile : vscode.Uri | undefined;

  constructor() {
    let workspace = vscode.workspace.rootPath;
    console.assert(workspace !== undefined);
    if (workspace === undefined) {
      return;
    }

    let configFolder = path.join(workspace, '.vscode');
    let configFilePath: string = path.join(configFolder, 'wpilib_properties.json');
    this.settingFile = vscode.Uri.file(configFilePath);
  }

  public async requestTeamNumber(): Promise<number> {
    let teamNumber = await vscode.window.showInputBox( { prompt: 'Enter your team number'});
    if (teamNumber === undefined) {
      return -1;
    }
    return parseInt(teamNumber);
  }

  private async noTeamNumberLogic(): Promise<number> {
    // Ask if user wants to set team number.
    let teamRequest = await vscode.window.showInformationMessage('No team number, would you like to input one?', 'Yes', 'Yes and Save', 'No');
    if (teamRequest === undefined) {
      return -1;
    }
    if (teamRequest === 'No') {
      return -1;
    }
    let teamNumber = await this.requestTeamNumber();
    if (teamNumber !== -1) {
      await this.setTeamNumber(teamNumber);
    }
    return teamNumber;
  }

  public async getTeamNumber(): Promise<number> {
    if (this.settingFile === undefined) {
      return await this.noTeamNumberLogic();
    }

    try {
      let jsonString = await loadFileToString(this.settingFile.toString());
      let parsed = jsonc.parse(jsonString);

      if ('teamNumber' in parsed) {
        return parsed.teamNumber;
      } else {
        return await this.noTeamNumberLogic();
      }
    } catch (error) {
      return await this.noTeamNumberLogic();
    }
  }

  public async setTeamNumber(teamNumber: number): Promise<void> {
    if (this.settingFile === undefined) {
      return;
    }

    try {
      let jsonString = await loadFileToString(this.settingFile.toString());
      let parsed = jsonc.parse(jsonString);
      parsed.teamNumber = teamNumber;
      let unparsed = JSON.stringify(parsed, null, 4);
      await writeStringToFile(this.settingFile.toString(), unparsed);
    } catch (error) {
      // On any error, write file
      let jsn = { teamNumber: teamNumber};
      let unparsed = JSON.stringify(jsn, null, 4);
      await writeStringToFile(this.settingFile.toString(), unparsed);
    }
  }

  dispose() {

  }
}
