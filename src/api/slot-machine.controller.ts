import "reflect-metadata";
import {
  Body,
  Post,
  InternalServerError,
  JsonController,
  Get,
  NotFoundError,
  QueryParams,
  MethodNotAllowedError,
} from "routing-controllers";
import { Service } from "typedi";
import {
  SpinCommandHandler,
  SpinCommandResult,
} from "../application/spin-command.handler";
import { SlotMachineSpinRequest } from "./request/slot-machine-spin.request";
import { SlotMachineStateResponse } from "./response/slot-machine-state.response";
import { SlotMachineStateRequest } from "./request/slot-machine-state.request";
import {
  errored,
  notAllowed,
  notFound,
} from "../application/interfaces/errors";
import { CreateStateCommandHandler } from "../application/create-state-command.handler";
import { GetStateQueryHandler } from "../application/get-state-query.handler";

@JsonController("/slot-machine")
@Service()
export class SlotMachineController {
  constructor(
    private readonly spinCommandHandler: SpinCommandHandler,
    private readonly getStateQueryHandler: GetStateQueryHandler,
    private readonly createStateCommandHandler: CreateStateCommandHandler
  ) {}

  @Get()
  async get(
    @QueryParams() request: SlotMachineStateRequest
  ): Promise<SlotMachineStateResponse> {
    return this.tryInterceptResult(
      await this.getStateQueryHandler.handle(request)
    );
  }

  @Post()
  async create(): Promise<SlotMachineStateResponse> {
    return this.tryInterceptResult(
      await this.createStateCommandHandler.handle({})
    );
  }

  @Post("/spin")
  async spin(
    @Body() request: SlotMachineSpinRequest
  ): Promise<SlotMachineStateResponse> {
    return this.tryInterceptResult(
      await this.spinCommandHandler.handle(request)
    );
  }

  private tryInterceptResult(result: SpinCommandResult) {
    switch (result) {
      case notAllowed:
        throw new MethodNotAllowedError("method not allowed");
      case notFound:
        throw new NotFoundError("game not found");
      case errored:
        throw new InternalServerError("unknown error");
      default:
        return SlotMachineStateResponse.fromSnapshot(result);
    }
  }
}
