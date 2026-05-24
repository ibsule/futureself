import { plainToInstance } from 'class-transformer';
import {
    IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Local = 'local',
  Staging = 'staging',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENVIRONMENT: Environment;

  @IsNotEmpty()
  APP_PORT: string;

  @IsString()
  APP_KEY: string;

  @IsString()
  ENABLE_RATE_LIMITING: string;

  @IsString()
  DONT_SEND_EMAIL: string;

  @IsString()
  FRONTEND_PRODUCTION_URL: string;

  @IsString()
  FRONTEND_LOCAL_URL: string;

  
  // Redis

  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PORT: string;

  @IsString()
  REDIS_USER: string;

  @IsString()
  REDIS_PASSWORD: string;

  
  // Database

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  @IsOptional()
  POSTGRES_HOST_DOCKER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DB: string;

  @IsString()
  POSTGRES_HOST: string;

  @IsString()
  POSTGRES_PORT: string;

  @IsString()
  ENABLE_DATABASE_SSL: string;

  
  // Email

  @IsString()
  EMAIL_SENDER_NAME: string;

  @IsString()
  @IsOptional()
  EMAIL_SENDER_EMAIL: string;

  @IsString()
  BREVO_API_ENDPOINT: string;

  @IsString()
  @IsOptional()
  BREVO_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
