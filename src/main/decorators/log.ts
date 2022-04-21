import { LogErrorRepository } from "../../data/protocols/log-error-repository";
import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";

export class LogControllerDecorator implements Controller {
  constructor(
    private controller: Controller,
    private logErrorRepository: LogErrorRepository
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const httpResponse = await this.controller.handle(httpRequest);
    if (httpResponse.statusCode)
      await this.logErrorRepository.logError(httpResponse.body.stack);
    return httpResponse;
  }
}
