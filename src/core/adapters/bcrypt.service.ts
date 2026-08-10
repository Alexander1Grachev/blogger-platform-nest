import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService {
  async generateHash(passord: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(passord, salt);
  }

  async checkPassword(passord: string, hash: string) {
    return bcrypt.compare(passord, hash)
  }
}