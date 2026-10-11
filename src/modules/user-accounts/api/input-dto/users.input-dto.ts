import { IsEmail, Matches } from "class-validator";
import { Trim } from "src/core/decorators/transform/trim";
import { IsStringWithTrim } from "src/core/decorators/validation/is-string-with-trim";


export class CreateUserInputDto {
  @IsStringWithTrim(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;
  @IsStringWithTrim(6, 20)
  password: string;
  @Trim()
  @IsEmail()
  email: string;
}