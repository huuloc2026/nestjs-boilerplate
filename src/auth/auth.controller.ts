// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { TokenResponseDto } from './dto/token-response.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser } from './interfaces/auth-user.interface';
import { User } from '@prisma/client'; // Import User type from Prisma
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';



@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiResponse({ status: 201, description: 'User successfully registered.', type: AuthRegisterDto })
  @ApiResponse({ status: 409, description: 'User with this email already exists.' })
  async register(@Body() authRegisterDto: AuthRegisterDto): Promise<User> {
    const user = await this.authService.register(authRegisterDto);
    // Remove sensitive data before sending to client
    // delete user.password;
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password to get JWT' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @UseGuards(LocalAuthGuard) 
  async login(@Request() req): Promise<TokenResponseDto> {
    // Passport's LocalStrategy will attach the validated user to req.user
    return this.authService.login(req.user);
  }

  @Get('profile')
  @ApiBearerAuth('access-token') 
  @UseGuards(JwtAuthGuard) 
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Request() req): Promise<User> {
    // req.user will contain the payload from JwtStrategy
    const authUser: AuthUser = req.user;
    const user = await this.authService.findUserById(authUser.userId);
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }
    return user; // Password is already removed by findUserById
  }

  // --- Social Authentication Endpoints ---
  // These will typically involve redirects to the social provider and then callbacks

  // Example: Google OAuth Login (Initiate)
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  // @UseGuards(AuthGuard('google')) // Requires GoogleStrategy
  async googleAuth(@Request() req) {
    // This route will redirect to Google's authentication page
    // The actual authentication is handled by Passport's GoogleStrategy
  }

  // Example: Google OAuth Callback
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback URL' })
  // @UseGuards(AuthGuard('google')) // Requires GoogleStrategy
  async googleAuthRedirect(@Request() req): Promise<TokenResponseDto> {
    // Passport's GoogleStrategy will attach the validated user to req.user
    return this.authService.login(req.user);
  }

  // Add similar endpoints for other social providers (GitHub, Facebook, etc.)



  @Post('betterauth/verify')
  @ApiOperation({ summary: 'Verify a BetterAuth token/session' })
  @ApiResponse({ status: 200, description: 'Token verified.' })
  @ApiResponse({ status: 400, description: 'Invalid BetterAuth token.' })
  async verifyBetterAuthToken(@Body('token') token: string): Promise<{ success: boolean }> {
    // Implement actual BetterAuth verification logic here
    // This might involve calling a BetterAuth SDK method or their API
    const isVerified = true; // Placeholder
    if (!isVerified) {
      throw new BadRequestException('Invalid BetterAuth token.');
    }
    return { success: true };
  }
}