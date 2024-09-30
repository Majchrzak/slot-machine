import { IsNotEmpty, IsString } from "class-validator";

export class SlotMachineStateRequest {
  @IsString()
  @IsNotEmpty()
  gameId: string;
}
