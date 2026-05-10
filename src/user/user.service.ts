import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashString } from 'src/utils/string.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const user = new User();
    user.first_name = data.first_name;
    user.last_name = data.last_name;
    user.email = data.email;
    user.password_hash = await hashString(data.password);

    const saved = await this.userRepository.save(user);

    if (!saved) {
      throw new UnprocessableEntityException(
        'Failed to add user. Please try again.',
      );
    }

    return {
      message: 'success',
      data: {
        user: {
          email: user.email,
        },
      },
    };
  }
}
