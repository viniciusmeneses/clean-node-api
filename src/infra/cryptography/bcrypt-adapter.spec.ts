import bcrypt from "bcrypt";

import { BcryptAdapter } from "./bcrypt-adapter";

jest.mock("bcrypt", () => ({
  hash: async (): Promise<string> => "hash",
}));

describe("Bcrypt Adapter", () => {
  test("Should call Bcrypt with correct values", async () => {
    const salt = 12;
    const sut = new BcryptAdapter(salt);
    const hashSpy = jest.spyOn(bcrypt, "hash");

    await sut.encrypt("anyValue");
    expect(hashSpy).toHaveBeenCalledWith("anyValue", salt);
  });

  test("Should return a hash on success", async () => {
    const salt = 12;
    const sut = new BcryptAdapter(salt);

    const hash = await sut.encrypt("anyValue");
    expect(hash).toBe("hash");
  });
});
