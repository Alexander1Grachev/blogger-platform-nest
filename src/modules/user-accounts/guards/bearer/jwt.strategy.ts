import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserContextDto } from "../dto/user-context.dto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('AC_SECRET'), 
    });
  }
  async validate(payload: UserContextDto): Promise<UserContextDto> {
    return payload;
  }
}