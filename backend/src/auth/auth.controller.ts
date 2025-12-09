// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/RegisterRequestDto';
import { SignInDto } from './dto/SignInDto';
import { AuthGuard } from './guards/authentication.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.signIn(
        signInDto.email,
        signInDto.password,
      );

      res.cookie('token', result.access_token, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        user: result.payload,
        access_token: result.access_token,   // <--- add this
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred during login',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  async signup(@Body() registerRequestDto: RegisterRequestDto) {
    const result = await this.authService.register(registerRequestDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: result,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    const userId = (req as any).user.userid;
    const user = await this.userService.findById(userId);

    return {
      id: userId,
      name: user?.name,
      email: user?.email,
      role: user?.role,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('token', '', {
      httpOnly: true,
      secure: false, // true in production
      sameSite: 'strict',
      expires: new Date(0),
    });

    return { message: 'Logged out successfully' };
  }
}
