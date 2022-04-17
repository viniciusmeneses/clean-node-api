import validator from "validator";

import { EmailValidatorAdapter } from "./email-validator-adapter";

jest.mock("validator", () => ({
  isEmail: (): boolean => true,
}));

describe("EmailValidator Adapter", () => {
  test("Should return false if validator returns false", () => {
    const sut = new EmailValidatorAdapter();
    jest.spyOn(validator, "isEmail").mockReturnValueOnce(false);
    const isValid = sut.isValid("invalidEmail@email.com");
    expect(isValid).toBe(false);
  });

  test("Should return true if validator returns true", () => {
    const sut = new EmailValidatorAdapter();
    const isValid = sut.isValid("validEmail@email.com");
    expect(isValid).toBe(true);
  });
});
