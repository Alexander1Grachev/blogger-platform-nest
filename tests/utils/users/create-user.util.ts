import { HttpStatus, INestApplication } from "@nestjs/common";
import { PATHS } from "src/core/paths/paths";
import { CreateUserInputDto } from "src/modules/user-accounts/api/input-dto/users.input-dto";
import { UserViewDto } from "src/modules/user-accounts/api/view-dto/users.view-dto";
import { App } from "supertest/types";
import { getUserInputDto } from "./get-user-input-dto";
import request from 'supertest';
import { generateBasicAuthToken } from "../generate-admin-auth-token";



export async function createUserUtil(
  app: INestApplication<App>,
  userDto?: Partial<CreateUserInputDto>,
): Promise<UserViewDto> {
  const adminToken = generateBasicAuthToken();

  const testUserData: CreateUserInputDto = { ...getUserInputDto(), ...userDto };

  const res = await request(app.getHttpServer())
    .post(PATHS.USERS)
    .set('Authorization', adminToken)
    .send(testUserData)
    .expect(HttpStatus.CREATED)
    
  return res.body;
}


export async function createManyUsersUtil(
  app: INestApplication<App>,
  count: number,
): Promise<UserViewDto[]> {

  const users: UserViewDto[] = [];

  for (let i = 0; i < count; i++) {
    const user = await createUserUtil(app);
    users.push(user);
  };
  return users;

}