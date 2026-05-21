export const AUTH_SESSION_PREFIX = 'auth:session:';
export const USER_SESSIONS_PREFIX = 'user:sessions:';
export const MESSAGE_FROM_PAST_DEFAULT_EMAIL_SUBJECT = 'Message from your past';

export const AUTH_SESSION_TTL = 60 * 60 * 24; // 1 day

export enum ENVIRONMENT {
  LOCAL = 'local',
  DOCKER = 'docker',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum EMAIL_TEMPLATES {
  SIGNIN_MAGIC_LINK = 'signin_magic_link',
  MESSAGE_TO_FUTURE = 'message_to_future',
  MESSAGE_TO_FUTURE_RELAXED = 'message_to_future_relaxed',
  FORGET_PASSWORD = 'forget_password',
  TEST = 'test',
}

export enum QUEUE_NAME {
  MESSAGE_TO_FUTURE = 'message_to_future',
}
