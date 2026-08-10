// test/utils/clear-db.utils.ts
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { PATHS } from 'src/core/paths/paths';

export async function clearDb(app: INestApplication) {
  const response = await request(app.getHttpServer())
    .delete(`${PATHS.TESTING_CLEAR}/all-data`);

  if (response.status !== HttpStatus.NO_CONTENT) {
    console.error('❌ Unexpected response:', {
      status: response.status,
      body: response.body,
    });
  }
}