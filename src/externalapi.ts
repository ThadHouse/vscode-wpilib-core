'use strict';

// This file is designed to be copied into an
// external project to support the extension API

export interface ExternalAPI {
  startRioLog(teamNumber: number) : Promise<void>;
  getTeamNumber(): Promise<number>;
  setTeamNumber(teamNumber: number): Promise<void>;
  resolveRoboRioIp(teamNumber: number): Promise<string>;
  startTool(): Promise<void>;
  deployCode(teamNumber: number): Promise<boolean>;
  registerCodeDeploy(callback: (teamNumber: number) => Promise<boolean>, name: string): void;
  debugCode(teamNumber: number): Promise<boolean>;
  registerCodeDebug(callback: (teamNumber: number) => Promise<boolean>, name: string): void;
}
