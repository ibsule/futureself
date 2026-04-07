import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export function createJwtToken(data: object, appKey: string, expiresIn = '1d') {
  const token = jwt.sign(data, appKey, {
    expiresIn,
  });

  return token;
}

export function decodeJwtToken(token: string, appKey: string) {
  try {
    const data = jwt.verify(token, appKey);
    return data;
  } catch (error) {
    return false;
  }
}
