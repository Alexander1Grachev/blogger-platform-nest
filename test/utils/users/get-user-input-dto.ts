import { CreateUserInputDto } from "src/modules/user-accounts/api/input-dto/users.input-dto";

export function getUserInputDto(overrides?: Partial<CreateUserInputDto>): CreateUserInputDto {
  const randomNum = Math.floor(Math.random() * 10000);
  return {
    login: `Log${randomNum}`,
    password:` pass${randomNum}`,
    email: `ex${randomNum}@email.dev`,
    ...overrides,
  };
}