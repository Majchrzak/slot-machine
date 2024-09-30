import { SlotMachineStateSnapshot } from "../slot-machine-state";
import { Mission } from "./mission";

export class Missions {
  constructor(
    private readonly missions: Mission[],
    private readonly repeatedIndex: number
  ) {}

  /**
   * The complexity of method probably can be reduced to O(1).
   */
  *forTransition(
    from: SlotMachineStateSnapshot,
    to: SlotMachineStateSnapshot
  ): Generator<Mission> {
    if (!this.missions.length) {
      return;
    }

    let index = 0;

    for (let points = 0; points < to.points; ) {
      points += this.missions[index].pointsGoal;

      if (to.points < points) {
        break;
      }

      if (points >= from.points && points <= to.points) {
        yield this.missions[index];
      }

      if (index == this.missions.length - 1) {
        index = this.repeatedIndex - 1;
      } else {
        index++;
      }
    }
  }
}
