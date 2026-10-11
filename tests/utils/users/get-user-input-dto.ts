import { CreateUserInputDto } from "src/modules/user-accounts/api/input-dto/users.input-dto";

export function getUserInputDto(overrides?: Partial<CreateUserInputDto>): CreateUserInputDto {
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0'); 

  return {
    login: `Log${randomNum}`,       // всегда 7 символов
    password: `pass${randomNum}`,   // всегда 8 символов
    email: `ex${randomNum}@email.dev`,
    ...overrides,
  };
}