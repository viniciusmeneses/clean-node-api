import { LogErrorRepository } from "../../data/protocols/log-error-repository";
import { AccountModel } from "../../domain/models/account";
import { created, serverError } from "../../presentation/helpers/http-helper";
import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

const makeFakeAccount = (): AccountModel => ({
  id: "validId",
  name: "validName",
  email: "validEmail@email.com",
  password: "validPassword",
});

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle(_httpRequest: HttpRequest): Promise<HttpResponse> {
      return created(makeFakeAccount());
    }
  }
  return new ControllerStub();
};

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async log(_stack: string): Promise<void> {
      return null;
    }
  }
  return new LogErrorRepositoryStub();
};

const makeFakeServerError = (): HttpResponse => {
  const fakeError = new Error();
  fakeError.stack = "anyStack";
  return serverError(fakeError);
};

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: "anyName",
    email: "anyEmail@email.com",
    password: "anyPassword",
    passwordConfirmation: "anyPassword",
  },
});

interface SutTypes {
  sut: LogControllerDecorator;
  controllerStub: Controller;
  logErrorRepositoryStub: LogErrorRepository;
}

const makeSut = (): SutTypes => {
  const controllerStub = makeController();
  const logErrorRepositoryStub = makeLogErrorRepository();
  const sut = new LogControllerDecorator(
    controllerStub,
    logErrorRepositoryStub
  );
  return { sut, controllerStub, logErrorRepositoryStub };
};

describe("LogController Decorator", () => {
  test("Should call controller handle", async () => {
    const { sut, controllerStub } = makeSut();
    const handleSpy = jest.spyOn(controllerStub, "handle");
    const httpRequest = makeFakeRequest();

    await sut.handle(httpRequest);
    expect(handleSpy).toHaveBeenCalledWith(httpRequest);
  });

  test("Should return the same result of the controller", async () => {
    const { sut } = makeSut();
    const httpRequest = makeFakeRequest();

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(created(makeFakeAccount()));
  });

  test("Should call LogErrorRepository with correct error if controller returns a server error", async () => {
    const { sut, controllerStub, logErrorRepositoryStub } = makeSut();

    const logSpy = jest.spyOn(logErrorRepositoryStub, "log");
    jest
      .spyOn(controllerStub, "handle")
      .mockReturnValueOnce(Promise.resolve(makeFakeServerError()));

    const httpRequest = makeFakeRequest();

    await sut.handle(httpRequest);
    expect(logSpy).toHaveBeenCalledWith("anyStack");
  });
});
