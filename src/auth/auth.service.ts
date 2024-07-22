import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAuthDto } from './dto';

@Injectable()
export class AuthService implements OnModuleInit {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {
  }

  private readonly logger = new Logger(AuthService.name);

  async onModuleInit() {
    this.logger.log(`${AuthService.name} initialized.`);
  }

  create(createAuthDto: CreateAuthDto) {

    const message = `User ${createAuthDto.username} created.`;

    return {
      message
    }
  }

}
