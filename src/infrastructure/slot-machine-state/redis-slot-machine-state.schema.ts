import { IsNumber } from "class-validator";

/**
 * Used single characters to represent fields in schema
 * to reduce the length of json row in document db (redis)
 */
export class RedisSlotMachineStateSchema {
  /**
   * number of spins
   */
  @IsNumber()
  s: number;

  /**
   * number of coins
   */
  @IsNumber()
  c: number;

  /**
   * number of points
   */
  @IsNumber()
  p: number;

  /**
   * snapshot versions
   */
  @IsNumber()
  v: number;
}
