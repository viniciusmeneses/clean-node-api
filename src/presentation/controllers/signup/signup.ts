import { MissingParamError, InvalidParamError } from "../../errors";
import { badRequest, serverError } from "../../helpers/http-helper";
import {
  Controller,
  EmailValidator,
  HttpRequest,
  HttpResponse,
  AddAccount,
} from "./signup-protocols";

export class SignUpController implements Controller {
  constructor(
    private emailValidator: EmailValidator,
    private addAccount: AddAccount
  ) {}

  handle(httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = [
        "name",
        "email",
        "password",
        "passwordConfirmation",
      ];

      for (const field of requiredFields) {
        if (!httpRequest.body[field])
          return badRequest(new MissingParamError(field));
      }

      const { name, email, password, passwordConfirmation } = httpRequest.body;

      if (password !== passwordConfirmation)
        return badRequest(new InvalidParamError("passwordConfirmation"));

      const isEmailValid = this.emailValidator.isValid(email);
      if (!isEmailValid) return badRequest(new InvalidParamError("email"));

      const account = this.addAccount.add({
        name,
        email,
        password,
      });

      return {
        statusCode: 201,
        body: account,
      };
    } catch (error) {
      return serverError();
    }
  }
}
