import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateMessengerDto } from './dto/create-messenger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageToFuture } from './entities/message.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_TEMPLATES, QUEUE_NAME } from 'src/constants';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/user/entities/user.entity';
import { parseToTimestamp } from 'src/utils/time.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessengerService {
  constructor(
    @InjectRepository(MessageToFuture)
    private readonly messageToFutureRepository: Repository<MessageToFuture>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectQueue(QUEUE_NAME.MESSAGE_TO_FUTURE)
    private messageToFutureQueue: Queue,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<IENV, true>,
  ) {}

  private readonly logger = new Logger();

  async create(data: CreateMessengerDto, user_id: string) {
    // Validate that only one of 'sent_at' and 'send_after' can be provided
    const onlyOne = Number(!!data.send_at) ^ Number(!!data.send_after);

    if (!onlyOne) {
      throw new BadRequestException(
        "Only provide value for either 'send_at' or 'send_after', not both.",
      );
    }

    // Validate that 'send_at' is a future date
    const isDateFuture = new Date(data.send_at).getTime() > Date.now();

    if (data.send_at && !isDateFuture) {
      throw new BadRequestException('send_at must be a time in the future.');
    }

    let sendAfterTimestamp;

    if (data.send_after) {
      sendAfterTimestamp = parseToTimestamp(data.send_after);
    }

    const message = this.messageToFutureRepository.create({
      ...data,
      send_at: data.send_at ?? new Date(sendAfterTimestamp),
      created_by: user_id,
    });

    const savedMessage = await this.messageToFutureRepository.save(message);

    if (!savedMessage) {
      throw new UnprocessableEntityException(
        'Failed to create message. Please try again.',
      );
    }

    const delay =
      new Date(data.send_at ?? sendAfterTimestamp).getTime() - Date.now();

    // Add message to queue
    const job = await this.messageToFutureQueue.add(
      'default',
      {
        messageId: savedMessage.id,
      },
      { delay },
    );

    if (!job) {
      throw new UnprocessableEntityException(
        'Failed to add message. Please try again',
      );
    }

    return {
      message: 'success',
    };
  }

  async sendMessage(messageId: number) {
    try {
      const message = await this.messageToFutureRepository.findOne({
        where: { id: messageId },
      });

      if (!message) {
        throw new NotFoundException('Message with id not found.');
      }

      const user = await this.userRepository.findOneBy({
        id: message.created_by,
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const recipientEmail = user.email;
      const recipientName = user.first_name;
      const emailSubject = message.title;
      const emailData = {
        recipientName,
        title: message.title,
        content: message.content,
        writtenOn: message.created_at.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        }),
        senderName: user.first_name,
      };

      const emailTemplate = EMAIL_TEMPLATES.MESSAGE_TO_FUTURE;

      if (!(this.configService.get('DONT_SEND_EMAIL', 'false') === 'true')) {
        this.emailService.send({
          recipientEmail,
          recipientName,
          emailSubject,
          emailData,
          emailTemplate,
        });
      }

      message.sent = true;
      this.messageToFutureRepository.save(message);

      this.logger.verbose(`Message #${message.id} sent.`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
