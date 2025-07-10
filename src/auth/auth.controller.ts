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
  UnauthorizedException,
  Query,
  Param,
} from '@nestjs/common';

import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser } from './interfaces/auth-user.interface';
import { User } from '@prisma/client'; // Import User type from Prisma
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';



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

  // --- Password Management Endpoints ---

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const authUser: AuthUser = req.user;
    return this.authService.changePassword(authUser.userId, changePasswordDto);
  }

  // --- Token Management Endpoints ---

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  // --- Email Verification Endpoints ---

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address using verification token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification token.' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async resendEmailVerification(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.resendEmailVerification(forgotPasswordDto.email);
  }

  // --- Social Authentication Endpoints ---

  // Google OAuth Login (Initiate)
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
//   @UseGuards(AuthGuard('google')) // Requires GoogleStrategy
  async googleAuth(@Request() req) {
    // This route will redirect to Google's authentication page
    // The actual authentication is handled by Passport's GoogleStrategy
    return { url: 'https://accounts.google.com/oauth/authorize', message: 'Redirect to Google OAuth' };
  }

  // Google OAuth Callback
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback URL' })
  @ApiResponse({ status: 200, description: 'Google OAuth successful', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Google OAuth failed' })
  // @UseGuards(AuthGuard('google')) // Requires GoogleStrategy
  async googleAuthRedirect(@Request() req): Promise<TokenResponseDto> {
    // Passport's GoogleStrategy will attach the validated user to req.user
    if (!req.user) {
      throw new UnauthorizedException('Google authentication failed');
    }
    return this.authService.login(req.user);
  }

//   // GitHub OAuth Login (Initiate)
//   @Get('github')
//   @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
//   @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth' })
//   // @UseGuards(AuthGuard('github')) // Requires GitHubStrategy
//   async githubAuth(@Request() req) {
//     return { url: 'https://github.com/login/oauth/authorize', message: 'Redirect to GitHub OAuth' };
//   }

//   // GitHub OAuth Callback
//   @Get('github/callback')
//   @ApiOperation({ summary: 'GitHub OAuth callback URL' })
//   @ApiResponse({ status: 200, description: 'GitHub OAuth successful', type: TokenResponseDto })
//   @ApiResponse({ status: 401, description: 'GitHub OAuth failed' })
//   // @UseGuards(AuthGuard('github')) // Requires GitHubStrategy
//   async githubAuthRedirect(@Request() req): Promise<TokenResponseDto> {
//     if (!req.user) {
//       throw new UnauthorizedException('GitHub authentication failed');
//     }
//     return this.authService.login(req.user);
//   }

//   // Facebook OAuth Login (Initiate)
//   @Get('facebook')
//   @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
//   @ApiResponse({ status: 302, description: 'Redirect to Facebook OAuth' })
//   // @UseGuards(AuthGuard('facebook')) // Requires FacebookStrategy
//   async facebookAuth(@Request() req) {
//     return { url: 'https://www.facebook.com/v18.0/dialog/oauth', message: 'Redirect to Facebook OAuth' };
//   }

//   // Facebook OAuth Callback
//   @Get('facebook/callback')
//   @ApiOperation({ summary: 'Facebook OAuth callback URL' })
//   @ApiResponse({ status: 200, description: 'Facebook OAuth successful', type: TokenResponseDto })
//   @ApiResponse({ status: 401, description: 'Facebook OAuth failed' })
//   // @UseGuards(AuthGuard('facebook')) // Requires FacebookStrategy
//   async facebookAuthRedirect(@Request() req): Promise<TokenResponseDto> {
//     if (!req.user) {
//       throw new UnauthorizedException('Facebook authentication failed');
//     }
//     return this.authService.login(req.user);
//   }

//   // Discord OAuth Login (Initiate)
//   @Get('discord')
//   @ApiOperation({ summary: 'Initiate Discord OAuth login' })
//   @ApiResponse({ status: 302, description: 'Redirect to Discord OAuth' })
//   // @UseGuards(AuthGuard('discord')) // Requires DiscordStrategy
//   async discordAuth(@Request() req) {
//     return { url: 'https://discord.com/api/oauth2/authorize', message: 'Redirect to Discord OAuth' };
//   }

//   // Discord OAuth Callback
//   @Get('discord/callback')
//   @ApiOperation({ summary: 'Discord OAuth callback URL' })
//   @ApiResponse({ status: 200, description: 'Discord OAuth successful', type: TokenResponseDto })
//   @ApiResponse({ status: 401, description: 'Discord OAuth failed' })
//   // @UseGuards(AuthGuard('discord')) // Requires DiscordStrategy
//   async discordAuthRedirect(@Request() req): Promise<TokenResponseDto> {
//     if (!req.user) {
//       throw new UnauthorizedException('Discord authentication failed');
//     }
//     return this.authService.login(req.user);
//   }



  // --- BetterAuth Integration Endpoints ---

  @Post('betterauth/verify')
  @ApiOperation({ summary: 'Verify a BetterAuth token/session' })
  @ApiResponse({ status: 200, description: 'Token verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid BetterAuth token.' })
  async verifyBetterAuthToken(@Body('token') token: string): Promise<{ success: boolean; user?: any }> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    // TODO: Implement actual BetterAuth verification logic here
    // This might involve calling a BetterAuth SDK method or their API
    try {
      // Example: const user = await betterAuth.verifyToken(token);
      const isVerified = true; // Placeholder - replace with actual verification
      
      if (!isVerified) {
        throw new BadRequestException('Invalid BetterAuth token.');
      }

      return { 
        success: true,
        // user: user // Include user data from BetterAuth
      };
    } catch (error) {
      throw new BadRequestException('Invalid BetterAuth token.');
    }
  }

  @Post('betterauth/session')
  @ApiOperation({ summary: 'Create session with BetterAuth' })
  @ApiResponse({ status: 200, description: 'Session created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid session data.' })
  async createBetterAuthSession(@Body() sessionData: any): Promise<{ success: boolean; sessionId?: string }> {
    // TODO: Implement BetterAuth session creation
    try {
      // Example: const session = await betterAuth.createSession(sessionData);
      const sessionId = 'placeholder-session-id'; // Replace with actual session creation
      
      return {
        success: true,
        sessionId
      };
    } catch (error) {
      throw new BadRequestException('Failed to create session.');
    }
  }

  // --- Health Check & Status Endpoints ---

  @Get('health')
  @ApiOperation({ summary: 'Auth service health check' })
  @ApiResponse({ status: 200, description: 'Auth service is healthy.' })
  async healthCheck(): Promise<{ status: string; timestamp: string; features: string[] }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'Email/Password Authentication',
        'JWT Tokens',
        'Refresh Tokens',
        'Email Verification',
        'Password Reset',
        'Social Authentication (Google, GitHub, Facebook, Discord)',
        'BetterAuth Integration',
        'Role-based Access Control'
      ]
    };
  }
}