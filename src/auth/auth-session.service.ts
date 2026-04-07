import { Injectable, Logger } from '@nestjs/common';
import { IAuthSession } from './interfaces/auth-session.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthSessionService {
  private readonly logger = new Logger(AuthSessionService.name);

  constructor(
    @InjectRepository(AuthSession)
    private authSessionRepository: Repository<AuthSession>,
  ) {}

  async create(data: IAuthSession) {
    try {
      let authSession = new AuthSession();
      authSession = {
        ...authSession,
        ...data,
      };

      const result = await this.authSessionRepository.save(authSession);
      return result;
    } catch (error) {
      return false;
    }
  }

  async get(user_id: string) {
    try {
      const result = await this.authSessionRepository.findOne({
        where: { user_id },
        order: {
          created_at: 'DESC',
        },
      });
      return result;
    } catch (error) {
      return false;
    }
  }

  async delete(user_id: string) {
    try {
      const result = await this.authSessionRepository.delete({ user_id });
      return result;
    } catch (error) {
      return false;
    }
  }
}
