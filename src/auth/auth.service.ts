import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtVerifiedResult } from './interfaces';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly jwtService: JwtService
  ) {
    super()
  }

  private readonly logger = new Logger(AuthService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log(`${AuthService.name} connected to the database.`);
  }

  async signJWT(payload: JwtPayload) {

    return this.jwtService.sign(payload);

  }

  async getOneByEmail(email: string) {

    const user = await this.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {

      throw new RpcException({
        message: `Invalid email or password.`,
        statusCode: HttpStatus.UNAUTHORIZED
      })

    }

    return user

  }

  async registerUser(registerUserDto: RegisterUserDto) {

    const { first_name, last_name, email, password, confirm_password } = registerUserDto;

    if (password !== confirm_password) {

      throw new RpcException({
        message: `Passwords do not match.`,
        statusCode: HttpStatus.BAD_REQUEST
      })

    }

    const existingUser = await this.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {

      throw new RpcException({
        message: 'Invalid email or password.',
        statusCode: HttpStatus.BAD_REQUEST
      })

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword
      }
    })

    const { password: _, ...result } = user;

    return {
      message: `User ${user.email} registered successfully.`,
      user: result,
      token: 'token'
    }

  }

  async loginUser(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    const user = await this.getOneByEmail(email);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {

      throw new RpcException({
        message: `Invalid email or password.`,
        statusCode: HttpStatus.UNAUTHORIZED
      })

    }

    const { password: _, last_name: __, ...result } = user;

    return {
      message: `User ${user.email} logged in successfully.`,
      user: result,
      token: await this.signJWT({
        ...result
      })
    }

  }

  async verifyToken(token: string) {

    try {

      const payload: JwtVerifiedResult = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });

      const { sub, iat, exp, ...user } = payload;

      return {
        message: `Token is valid.`,
        user: user,
        token: await this.signJWT({
          ...user
        })
      }

    } catch (error) {

      console.log(error);

      throw new RpcException({
        message: `Invalid token.`,
        statusCode: HttpStatus.UNAUTHORIZED
      })

    }

  }

}
