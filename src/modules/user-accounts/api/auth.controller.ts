import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ConfCodeInputDto, EmailInputDto, NewPasswordRecoveryInputDto } from './input-dto/confimations-and-password.Input-dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../application/auth-service';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { ThrottlerGuard } from '@nestjs/throttler';


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository
  ) { }

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() body: CreateUserInputDto
  ): Promise<void> {
    return this.authService.registerUser(body);
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() body: ConfCodeInputDto
  ): Promise<void> {
    return this.authService.confirmEmail(body.code);
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() body: EmailInputDto
  ): Promise<void> {
    return this.authService.resendConfirmationCode(body.email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id);
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() body: NewPasswordRecoveryInputDto
  ): Promise<void> {
    return await this.authService.setNewPassword(body);
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: EmailInputDto): Promise<void> {
    await this.authService.passwordRecovery(body.email);
  }

  @ApiBearerAuth()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async me(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<MeViewDto> {
    return await this.authQueryRepository.me(user.id)
  }
}
