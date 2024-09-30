import "reflect-metadata";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
import { MissionReward } from "../../domain/mission/mission-reward";
import { Type } from "class-transformer";

export class FileMissionsSchema {
  @IsNumber()
  @IsPositive()
  repeatedIndex: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMissionSchema)
  missions: FileMissionSchema[];
}

export class FileMissionSchema {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMissionRewardSchema)
  rewards: FileMissionRewardSchema[];

  @IsNumber()
  @IsPositive()
  pointsGoal: number;
}

export class FileMissionRewardSchema {
  @IsString()
  @IsIn(["spins", "coins"])
  name: MissionReward["name"];

  @IsNumber()
  @IsPositive()
  value: number;
}
