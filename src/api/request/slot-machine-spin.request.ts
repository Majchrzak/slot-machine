import { IsNotEmpty, IsString } from "class-validator";

export class SlotMachineSpinRequest {
  @IsString()
  @IsNotEmpty()
  gameId: string;
}
