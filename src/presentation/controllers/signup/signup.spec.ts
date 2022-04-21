import {
  MissingParamError,
  InvalidParamError,
  ServerError,
} from "../../errors";
import { SignUpController } from "./signup";
import {
  EmailValidator,
  AddAccount,
  AddAccountModel,
  AccountModel,
} from "./signup-protocols";

interface SutTypes {
  sut: SignUpController;
  emailValidatorStub: EmailValidator;
  addAccountStub: AddAccount;
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(_email: string): boolean {
      return true;
    }
  }
  return new EmailValidatorStub();
};

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add(_account: AddAccountModel): Promise<AccountModel> {
      return new Promise((resolve) => {
        resolve({
          id: "validId",
          name: "validName",
          email: "validEmail@email.com",
          password: "validPassword",
        });
      });
    }
  }
  return new AddAccountStub();
};

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator();
  const addAccountStub = makeAddAccount();
  const sut = new SignUpController(emailValidatorStub, addAccountStub);
  return {
    sut,
    emailValidatorStub,
    addAccountStub,
  };
};

describe("SignUp Controller", () => {
  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: "anyEmail@email.com",
        password: "anyPassword",
        passwordConfirmation: "anyPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no email is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "anyName",
        password: "anyPassword",
        passwordConfirmation: "anyPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if no password is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "anyName",
        email: "anyEmail@email.com",
        passwordConfirmation: "anyPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 400 if no password confirmation is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "anyName",
        email: "anyEmail@email.com",
        password: "anyPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(
      new MissingParamError("passwordConfirmation")
    );
  });

  test("Should return 400 if password confirmation fails", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "anyName",
        email: "anyEmail@email.com",
        password: "anyPassword",
        passwordConfirmation: "invalidPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(
      new InvalidParamError("passwordConfirmation")
    );
  });

  test("Should return 400 if an invalid email is provided", async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        name: "anyName",
        email: "invalidEmail@email.com",
        password: "anyPassword",
        passwordConfirmation: "anyPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("email"));
  });

  test("Should call EmailValidator with correct email", async () => {
    const { sut, emailValidatorStub } = makeSut();
    const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");

    const httpRequest = {
      body: {
        name: "anyName",
        email: "anyEmail@email.com",
        password: "anyPassword",
        passwordConfirmation: "anyPassword",
      },
    };
    await sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith("anyEmail@email.com");
  });

  test("Should return 500 if EmailValidator throws", async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, "isValid").mockImplementationOnce(() => {
      throw new Error();
    });

    const httpRequest = {
      body: {
        name: "anyName",
        email: "anyEmail@email.com",
        password: "anyPassword",
        passwordConfirmation: "anyPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should call AddAccount with correct values", async () => {
    const { sut, addAccountStub } = makeSut();
    const addSpy = jest.spyOn(addAccountStub, "add");

    const httpRequest = {
      body: {
        name: "anyName",
        email: "anyEmail@email.com",
        password: "anyPassword",
        passwordConfirmation: "anyPassword",
      },
    };
    await sut.handle(httpRequest);
    expect(addSpy).toHaveBeenCalledWith({
      name: "anyName",
      email: "anyEmail@email.com",
      password: "anyPassword",
    });
  });

  test("Should return 500 if AddAccount throws", async () => {
    const { sut, addAccountStub } = makeSut();
    jest.spyOn(addAccountStub, "add").mockImplementationOnce(() => {
      return new Promise((_, reject) => {
        reject(new Error());
      });
    });

    const httpRequest = {
      body: {
        name: "anyName",
        email: "anyEmail@email.com",
        password: "anyPassword",
        passwordConfirmation: "anyPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toBeInstanceOf(ServerError);
  });

  test("Should return 201 if valid data is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        name: "validName",
        email: "validEmail@email.com",
        password: "validPassword",
        passwordConfirmation: "validPassword",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "validId",
      name: "validName",
      email: "validEmail@email.com",
      password: "validPassword",
    });
  });
});
