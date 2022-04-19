import bcrypt from "bcrypt";

import { BcryptAdapter } from "./bcrypt-adapter";

jest.mock("bcrypt", () => ({
  hash: async (): Promise<string> => "hash",
}));

const salt = 12;

const makeSut = (): BcryptAdapter => new BcryptAdapter(salt);

describe("Bcrypt Adapter", () => {
  test("Should call Bcrypt with correct values", async () => {
    const sut = makeSut();
    const hashSpy = jest.spyOn(bcrypt, "hash");
    await sut.encrypt("anyValue");
    expect(hashSpy).toHaveBeenCalledWith("anyValue", salt);
  });

  test("Should return a hash on success", async () => {
    const sut = makeSut();
    const hash = await sut.encrypt("anyValue");
    expect(hash).toBe("hash");
  });

  test("Should throw if Bcrypt throws", async () => {
    const sut = makeSut();
    jest
      .spyOn(bcrypt, "hash")
      .mockImplementation(() => Promise.reject(new Error()));
    const promise = sut.encrypt("anyValue");
    await expect(promise).rejects.toThrow();
  });
});
