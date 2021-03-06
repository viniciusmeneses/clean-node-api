import bcrypt from "bcrypt";

import { Encrypter } from "../../data/protocols/encrypter";

export class BcryptAdapter implements Encrypter {
  constructor(private salt: number) {}

  async encrypt(value: string): Promise<string> {
    return bcrypt.hash(value, this.salt);
  }
}
