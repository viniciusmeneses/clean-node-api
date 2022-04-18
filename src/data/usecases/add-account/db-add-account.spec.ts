import { Encrypter } from "../../protocols/encrypter";
import { DbAddAccount } from "./db-add-account";

interface SutTypes {
  sut: DbAddAccount;
  encrypterStub: Encrypter;
}

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
  const sut = new DbAddAccount(encrypterStub);
  return { sut, encrypterStub };
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
});
