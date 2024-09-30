import { Service } from "typedi";
import { SpinGenerator } from "../../domain/spin/generator/spin-generator";
import { SpinRandomGenerator } from "../../domain/spin/generator/spin-random-generator";

@Service()
export class SpinGeneratorSource {
  get(): SpinGenerator {
    return new SpinRandomGenerator();
  }
}
