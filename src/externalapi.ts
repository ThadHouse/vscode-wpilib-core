'use strict';

// This file is designed to be copied into an
// external project to support the extension API

/**
 * The external interface supported by the core plugin
 */
export interface IExternalAPI {
  startRioLog(teamNumber: number) : Promise<void>;
  startTool(): Promise<void>;
  addTool(tool: IToolRunner): void;
  deployCode(): Promise<boolean>;
  registerCodeDeploy(deployer: ICodeDeployer): void;
  debugCode(): Promise<boolean>;
  registerCodeDebug(deployer: ICodeDeployer): void;
  getApiVersion(): number;


  getPreferences(): IPreferences;
  addLanguageChoice(language: string): void;
  requestLanguageChoice(): Promise<string>;
}

export interface ILanguageSpecific {
  languageName: string;
  languageData: any;
}

export interface IPreferences {
  getTeamNumber(): number;
  setTeamNumber(teamNumber: number): void;
  getCurrentLanguage(): string;
  setCurrentLanguage(language: string): void;
  getLanguageSpecific(language: string): any;
  setLanguageSpecific(language:string, data: any): void;
}

export interface IToolRunner {
  runTool(): Promise<void>;
  getDisplayName(): string;
}


/**
 * Interface to providing a code deployer or debugger
 * to the core plugin.
 */
export interface ICodeDeployer {
  /**
   * Returns if this deployer is currently valid to be used
   * in the current workspace
   */
  getIsCurrentlyValid(): Promise<boolean>;
  /**
   * Run the command with the specified team number
   *
   * @param teamNumber The team number to deploy to
   */
  runDeployer(teamNumber: number): Promise<boolean>;

  /**
   * Get the display name to be used for selection
   */
  getDisplayName(): string;
}
