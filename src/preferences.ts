'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { loadFileToString, writeStringToFile } from './utilities';
import * as jsonc from 'jsonc-parser';
import { IPreferences, ILanguageSpecific } from './externalapi';

interface PreferencesJson {
  teamNumber: number;
  currentLanguage: string;
  autoStartRioLog: boolean;
  languageSpecific : ILanguageSpecific[];
}

const defaultPreferences: PreferencesJson = {
  teamNumber: -1,
  currentLanguage: 'none',
  autoStartRioLog: false,
  languageSpecific: []
}

export class Preferences implements IPreferences {
  private preferencesFile?: vscode.Uri;
  private readonly configFolder: string;
  private readonly preferenceFileName: string = 'wpilib_preferences.json';
  private preferencesJson: PreferencesJson;
  private configFileWatcher: vscode.FileSystemWatcher;
  private readonly preferencesGlob: string = '**/' + this.preferenceFileName;
  private disposables: vscode.Disposable[] = [];

  constructor(workspace: vscode.WorkspaceFolder) {
    this.configFolder = path.join(workspace.uri.fsPath, '.wpilib');

    let configFilePath = path.join(this.configFolder, this.preferenceFileName);

    if (fs.existsSync(configFilePath)) {
      this.preferencesFile = vscode.Uri.file(configFilePath);
      this.preferencesJson = defaultPreferences;
      this.updatePreferences();
    } else {
      // Set up defaults, and create
      this.preferencesJson = defaultPreferences;
    }

    let rp = new vscode.RelativePattern(workspace, this.preferencesGlob);

    this.configFileWatcher = vscode.workspace.createFileSystemWatcher(rp);
    this.disposables.push(this.configFileWatcher);

    this.configFileWatcher.onDidCreate((uri) => {
      this.preferencesFile = uri;
      this.updatePreferences();
    });

    this.configFileWatcher.onDidDelete(() => {
      this.preferencesFile = undefined;
      this.updatePreferences();
    });

    this.configFileWatcher.onDidChange(() => {
      this.updatePreferences();
    });

  }

  private updatePreferences() {
    if (this.preferencesFile === undefined) {
      this.preferencesJson = defaultPreferences;
      return;
    }

    let results = fs.readFileSync(this.preferencesFile.fsPath, 'utf8');
    this.preferencesJson = jsonc.parse(results);
  }

  private writePreferences() {
    if (this.preferencesFile === undefined) {
      return;
    }
    fs.writeFileSync(this.preferencesFile.fsPath, JSON.stringify(this.preferencesJson, null, 4));
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
    if (teamNumber !== -1 && teamRequest === 'Yes and Save') {
      await this.setTeamNumber(teamNumber);
    }
    return teamNumber;
  }

  public async getTeamNumber(): Promise<number> {
    if (this.settingFile === undefined) {
      return await this.noTeamNumberLogic();
    }

    try {
      let jsonString = await loadFileToString(this.settingFile.fsPath);
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
      let jsonString = await loadFileToString(this.settingFile.fsPath);
      let parsed = jsonc.parse(jsonString);
      parsed.teamNumber = teamNumber;
      let unparsed = JSON.stringify(parsed, null, 4);
      await writeStringToFile(this.settingFile.fsPath, unparsed);
    } catch (error) {
      // On any error, write file
      let jsn = { teamNumber: teamNumber};
      let unparsed = JSON.stringify(jsn, null, 4);
      await writeStringToFile(this.settingFile.fsPath, unparsed);
    }
  }

  dispose() {

  }
}
