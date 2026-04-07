import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compareStringAndHash } from 'src/utils/string.utils';
import { AuthSessionService } from './auth-session.service';
import { User } from 'src/user/entities/user.entity';
import { createJwtToken } from 'src/utils/jwt.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly authSessionService: AuthSessionService,
    private readonly configService: ConfigService<IENV, true>,
  ) {}

  async login({ email, password }) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('user with this email not found.');

    const isMatch = await compareStringAndHash(password, user.password_hash);

    if (!isMatch) throw new BadRequestException('invalid password.');

    const payload = {
      user_id: user.id,
      auth_token_version: user.auth_token_version,
    };

    // Create JWT Token
    const token = createJwtToken(
      payload,
      this.configService.get('APP_KEY', { infer: true }),
    );

    const authSession = await this.authSessionService.create({
      user_id: user.id,
      user_email: user.email,
      auth_token_version: user.auth_token_version,
    });

    if (!authSession) {
      throw new UnprocessableEntityException('login failed. please try again.');
    }

    return {
      message: 'success',
      data: {
        token,
      },
    };
  }

  async logout({ user_id }) {
    const user = await this.userRepository.findOneBy({ id: user_id });

    if (!user) {
      throw new BadRequestException('user not found. please login again.');
    }

    await this.authSessionService.delete(user.id);

    // Increment auth token version
    user.auth_token_version += 1;
    await this.userRepository.save(user);

    return {
      message: 'success',
    };
  }
}
