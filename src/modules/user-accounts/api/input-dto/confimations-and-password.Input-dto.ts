import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";
import { Trim } from "src/core/decorators/transform/trim";
import { IsStringWithTrim } from "src/core/decorators/validation/is-string-with-trim";

export class ConfCodeInputDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  code: string;
}

export class EmailInputDto {
  @Trim()
  @IsEmail()
  email: string;
}

export class NewPasswordRecoveryInputDto {
  @IsStringWithTrim(6, 20)
  newPassword: string;
  @IsString()
  @IsNotEmpty()
  @Trim()
  recoveryCode: string;
}
