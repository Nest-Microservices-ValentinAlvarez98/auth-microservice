import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {
    super()
  }

  private readonly logger = new Logger(AuthService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log(`${AuthService.name} connected to the database.`);

  }

  registerUser(registerUserDto: RegisterUserDto) {

    const message = `User ${registerUserDto.email} created.`;

    return message

  }

  loginUser(loginUserDto: LoginUserDto) {

    const message = `User ${loginUserDto.email} logged in.`;

    return message

  }

  verifyToken(token: string) {

    const message = `User verified with token ${token}.`;

    return message

  }

}
