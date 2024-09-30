import { MissionReward } from "./mission-reward";

export class Mission {
  constructor(readonly pointsGoal: number, readonly rewards: MissionReward[]) {}
}
