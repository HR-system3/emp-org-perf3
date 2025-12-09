// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterRequestDto } from './dto/RegisterRequestDto';
import { Types } from 'mongoose';

export interface JwtPayload {
  userid: string;   // <-- string is enough inside JWT
  role: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(user: RegisterRequestDto): Promise<string> {
    const existingUser = await this.usersService.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: RegisterRequestDto = { ...user, password: hashedPassword };
    await this.usersService.create(newUser);
    return 'registered successfully';
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; payload: JwtPayload }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, (user as any).password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDoc = user as any; // Mongoose document

    const payload: JwtPayload = {
      userid: userDoc._id.toString(), // <-- no more TS error
      role: userDoc.role,
      name: userDoc.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      payload,
    };
  }

}
