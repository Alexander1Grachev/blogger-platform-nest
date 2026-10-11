import { INestApplication } from '@nestjs/common';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';

export function resetThrottler(app: INestApplication): void {
  const throttlerStorage = app.get(ThrottlerStorage) as ThrottlerStorageService;
  throttlerStorage.storage.clear();
}