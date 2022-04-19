import { MongoHelper } from "../helpers/mongo-helper";
import { AccountMongoRepository } from "./account";

const makeSut = (): AccountMongoRepository => new AccountMongoRepository();

describe("Account Mongo Repository", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    const accountCollection = MongoHelper.getCollection("accounts");
    await accountCollection.deleteMany({});
  });

  test("Should return an account on success", async () => {
    const sut = makeSut();
    const account = await sut.add({
      name: "anyName",
      email: "anyEmail@email.com",
      password: "anyPassword",
    });

    expect(account).toBeTruthy();
    expect(account.id).toBeTruthy();
    expect(account.name).toBe("anyName");
    expect(account.email).toBe("anyEmail@email.com");
    expect(account.password).toBe("anyPassword");
  });
});
