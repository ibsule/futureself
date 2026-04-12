import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compareStringAndHash, hashString } from 'src/utils/string.utils';
import { AuthSessionService } from './auth-session.service';
import { User } from 'src/user/entities/user.entity';
import { createJwtToken, decodeJwtToken } from 'src/utils/jwt.utils';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { EMAIL_TEMPLATES } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly authSessionService: AuthSessionService,
    private readonly configService: ConfigService<IENV, true>,
    private readonly emailService: EmailService,
  ) {}

  async login({ email, password }) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('user with this email not found.');

    const isMatch = await compareStringAndHash(password, user.password_hash);

    if (!isMatch) throw new BadRequestException('invalid password.');

    const sessionId = await this.authSessionService.create({
      userId: user.id,
      authTokenVersion: user.auth_token_version,
    });

    if (!sessionId) {
      throw new UnprocessableEntityException('login failed. please try again.');
    }

    const payload = {
      sessionId,
      authTokenVersion: user.auth_token_version,
    };

    // Create JWT Token
    const token = createJwtToken(
      payload,
      this.configService.get('APP_KEY', { infer: true }),
    );

    return {
      message: 'success',
      data: {
        token,
      },
    };
  }

  async logout({ userId, sessionId }) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('user not found. please login again.');
    }

    await this.authSessionService.delete(sessionId, userId);

    // Increment auth token version
    user.auth_token_version += 1;
    await this.userRepository.save(user);

    return {
      message: 'success',
    };
  }

  async logoutAllSessions({ userId }) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('user not found. please login again.');
    }

    await this.authSessionService.deleteAll(userId);

    // Increment auth token version
    user.auth_token_version += 1;
    await this.userRepository.save(user);

    return {
      message: 'success',
    };
  }

  async forgetPassword({ email }: { email: string }) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new BadRequestException('user not found');
    }

    const tokenPayload = { userId: user.id };

    const token = createJwtToken(
      tokenPayload,
      this.configService.get('APP_KEY'),
      '15m',
    ); // Reset password token expires in 15 minutes

    const sentEmail = await this.emailService.send({
      emailData: {
        name: user.first_name,
        token,
      },
      emailTemplate: EMAIL_TEMPLATES.FORGET_PASSWORD,
      recipientEmail: user.email,
      recipientName: user.first_name || 'User',
      emailSubject: 'RESET PASSWORD',
    });

    if (!sentEmail.messageId) {
      throw new UnprocessableEntityException(
        'request failed. please try again',
      );
    }

    return {
      message: 'reset password link sent to email',
    };
  }

  async resetPassword({
    email,
    new_password: newPassword,
    reset_password_token: resetPasswordToken,
  }) {
    // find user by email
    const user = await this.userRepository.findOneBy({ email });

    // if user is not found, throw error
    if (!user) {
      throw new BadRequestException('user not found. please register again.');
    }

    const decodedData = decodeJwtToken(
      resetPasswordToken,
      this.configService.get('APP_KEY'),
    ) as any;

    if (!decodedData || decodedData.userId !== user.id) {
      throw new BadRequestException('invalid or expired reset password token.');
    }

    // hash new password
    const newPasswordHash = await hashString(newPassword);

    user.password_hash = newPasswordHash;
    await this.userRepository.save(user);

    return {
      message: 'password reset successful',
    };
  }
}
