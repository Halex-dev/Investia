// auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Get,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '@/modules/users/users.service';
import { CookieOptions } from '@/interfaces/cookie-options.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { User } from '@/modules/users/user.entity';

@Controller('auth')
export class AuthController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {
    this.cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
    try {
      const { accessToken, refreshToken } = await this.authService.login(req.user);

      this.setCookies(res, accessToken, refreshToken);

      return { message: 'Logged in successfully' };
    } catch (error) {
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('register')
  async register(@Body() createUserDto: RegisterDto): Promise<LoginResponseDto> {
    try {
      const user = await this.usersService.create(createUserDto);
      return { message: 'User registered successfully', userId: user.id };
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation in PostgreSQL
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req): Partial<User> {
    // Exclude sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userProfile } = req.user;
    return userProfile;
  }

  @Post('refresh')
  async refreshTokens(
    @Req() req,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponseDto> {
    try {
      const refreshToken = req.cookies['refresh_token'];
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshTokens(refreshToken);

      this.setCookies(res, accessToken, newRefreshToken);

      return { message: 'Tokens refreshed successfully' };
    } catch (error) {
      throw new HttpException('Token refresh failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie('access_token', accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
