export interface MissionSpinsReward {
  name: "spins";
  value: number;
}

export interface MissionCoinsReward {
  name: "coins";
  value: number;
}

export type MissionReward = MissionSpinsReward | MissionCoinsReward;
