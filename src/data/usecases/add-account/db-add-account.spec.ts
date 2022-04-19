import { DbAddAccount } from "./db-add-account";
import {
  AccountModel,
  AddAccountModel,
  AddAccountRepository,
  Encrypter,
} from "./db-add-account-protocols";

interface SutTypes {
  sut: DbAddAccount;
  encrypterStub: Encrypter;
  addAccountRepositoryStub: AddAccountRepository;
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(_account: AddAccountModel): Promise<AccountModel> {
      return {
        id: "validId",
        name: "validName",
        email: "validEmail",
        password: "hashedPassword",
      };
    }
  }

  return new AddAccountRepositoryStub();
};

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(_value: string): Promise<string> {
      return "hashedPassword";
    }
  }

  return new EncrypterStub();
};

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);
  return { sut, encrypterStub, addAccountRepositoryStub };
};

describe("DbAddAccount Usecase", () => {
  test("Should call encrypter with correct password", async () => {
    const { sut, encrypterStub } = makeSut();
    const encryptSpy = jest.spyOn(encrypterStub, "encrypt");

    const accountData = {
      name: "validName",
      email: "validEmail",
      password: "validPassword",
    };
    await sut.add(accountData);
    expect(encryptSpy).toHaveBeenCalledWith("validPassword");
  });

  test("Should throw if encrypter throws", async () => {
    const { sut, encrypterStub } = makeSut();
    jest
      .spyOn(encrypterStub, "encrypt")
      .mockReturnValueOnce(Promise.reject(new Error()));

    const accountData = {
      name: "validName",
      email: "validEmail",
      password: "validPassword",
    };
    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });

  test("Should call AddAccountRepository with correct values", async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, "add");

    const accountData = {
      name: "validName",
      email: "validEmail",
      password: "validPassword",
    };
    await sut.add(accountData);
    expect(addSpy).toHaveBeenCalledWith({
      name: "validName",
      email: "validEmail",
      password: "hashedPassword",
    });
  });

  test("Should throw if AddAccountRepository throws", async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    jest
      .spyOn(addAccountRepositoryStub, "add")
      .mockReturnValueOnce(Promise.reject(new Error()));

    const accountData = {
      name: "validName",
      email: "validEmail",
      password: "validPassword",
    };
    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });

  test("Should return an account on success", async () => {
    const { sut } = makeSut();

    const accountData = {
      name: "validName",
      email: "validEmail",
      password: "validPassword",
    };
    const account = await sut.add(accountData);
    expect(account).toEqual({
      id: "validId",
      name: "validName",
      email: "validEmail",
      password: "hashedPassword",
    });
  });
});
