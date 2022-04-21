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

const makeFakeAccount = (): AccountModel => ({
  id: "validId",
  name: "validName",
  email: "validEmail",
  password: "hashedPassword",
});

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(_account: AddAccountModel): Promise<AccountModel> {
      return makeFakeAccount();
    }
  }

  return new AddAccountRepositoryStub();
};

const makeFakeAccountData = (): AddAccountModel => ({
  name: "validName",
  email: "validEmail",
  password: "validPassword",
});

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

    const accountData = makeFakeAccountData();
    await sut.add(accountData);
    expect(encryptSpy).toHaveBeenCalledWith("validPassword");
  });

  test("Should throw if encrypter throws", async () => {
    const { sut, encrypterStub } = makeSut();
    jest
      .spyOn(encrypterStub, "encrypt")
      .mockReturnValueOnce(Promise.reject(new Error()));

    const accountData = makeFakeAccountData();
    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });

  test("Should call AddAccountRepository with correct values", async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, "add");

    const accountData = makeFakeAccountData();
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

    const accountData = makeFakeAccountData();
    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });

  test("Should return an account on success", async () => {
    const { sut } = makeSut();
    const accountData = makeFakeAccountData();
    const account = await sut.add(accountData);
    expect(account).toEqual(makeFakeAccount());
  });
});
