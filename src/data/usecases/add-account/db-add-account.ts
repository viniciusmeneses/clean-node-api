import {
  AccountModel,
  AddAccount,
  AddAccountModel,
  AddAccountRepository,
  Encrypter,
} from "./db-add-account-protocols";

export class DbAddAccount implements AddAccount {
  constructor(
    private encrypter: Encrypter,
    private addAccountRepository: AddAccountRepository
  ) {}

  async add(accountData: AddAccountModel): Promise<AccountModel> {
    const hashedPassword = await this.encrypter.encrypt(accountData.password);
    await this.addAccountRepository.add({
      ...accountData,
      password: hashedPassword,
    });
    return Promise.resolve(null);
  }
}
