import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthSessionService } from '../auth-session.service';
import { decodeJwtToken } from 'src/utils/jwt.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly configService: ConfigService<IENV, true>,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: Request): Promise<any> {
    const bearerToken = request.headers.authorization as string;

    if (!bearerToken)
      throw new UnauthorizedException(
        'please provide Bearer token in Authorization header.',
      );

    const token = bearerToken.split(' ')[1];

    if (!token)
      throw new UnauthorizedException(
        'auth token not found in Authorization header.',
      );

    const decodedToken = decodeJwtToken(
      token,
      this.configService.get('APP_KEY', { infer: true }),
    ) as any;

    if (!decodedToken)
      throw new UnauthorizedException(
        'invalid auth token or token has expired, please login to get new token.',
      );

    const userId = decodedToken?.id;
    const authTokenVersion = decodedToken?.auth_token_version;

    
    const authSession = await this.authSessionService.get(userId);
    
    if (!authSession || authSession.auth_token_version !== authTokenVersion) {
      throw new UnauthorizedException('please login again.');
    }

    request['user'] = {
      id: authSession.user_id,
      email: authSession.user_email,
      account_type: authSession.account_type,
    };

    return true;
  }
}
