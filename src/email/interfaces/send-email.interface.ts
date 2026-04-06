import { EMAIL_TEMPLATES } from "src/constants";

export interface ISendEmail {
  emailData: object;
  template: EMAIL_TEMPLATES;
  email: string;
  name: string;
  subject: string;
}