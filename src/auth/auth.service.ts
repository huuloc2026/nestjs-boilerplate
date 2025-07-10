// src/modules/auth/services/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User, Role } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { MailService } from 'src/modules/mail/mail.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { TokenResponseDto } from './dto/token-response.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService, // Inject MailService
  ) {}

  /**
   * Registers a new user.
   * @param authRegisterDto The registration data.
   * @returns The newly created user (without password).
   */
  async register(authRegisterDto: AuthRegisterDto): Promise<User> {
    const { email, password, firstName, lastName } = authRegisterDto;

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    // Create the user in the database
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: [Role.USER], // Assign default role
      },
    });

    // Send a welcome email (example)
    // await this.mailService.sendWelcomeEmail(user.email, user.firstName || 'User');

    // Remove password before returning
    // delete user.password;
    return user;
  }

  /**
   * Validates user credentials for local login.
   * This method is called by LocalStrategy.
   * @param email User email.
   * @param password User password.
   * @returns User object without password if valid, otherwise null.
   */
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return null; // User not found or inactive
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (isPasswordValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Exclude password from the returned object
      return result as User;
    }
    return null; // Invalid credentials
  }

  /**
   * Performs user login and generates JWT tokens.
   * @param user The validated user object.
   * @returns TokenResponseDto containing the access token.
   */
  async login(user: User): Promise<TokenResponseDto> {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    const expiresIn = this.configService.get<string>('app.jwtExpiresIn') ?? '1h';

    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      accessToken,
      tokenType: 'bearer',
      expiresIn: this.parseJwtExpiresIn(expiresIn),
    };
  }

  /**
   * Parses the JWT expiration string (e.g., '1h', '60s') into seconds.
   */
  private parseJwtExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 3600; // Default to 1 hour if unit is unknown
    }
  }

  /**
   * Finds a user by ID.
   * @param userId The ID of the user.
   * @returns The user object without password.
   */
  async findUserById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
    //   delete user.password;
    }
    return user;
  }

  /**
   * Handles user creation/finding for social login.
   * @param email User's email from social provider.
   * @param firstName User's first name.
   * @param lastName User's last name.
   * @param socialProvider Which social provider (e.g., 'google', 'github').
   * @param socialId The unique ID from the social provider.
   * @returns The user object.
   */
  async findOrCreateSocialUser(
    email: string,
    firstName: string,
    lastName: string,
    socialProvider: string,
    socialId: string,
  ): Promise<User> {
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // User does not exist, create a new one
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          // Social users might not have a password set initially if they only use social login
          // You might set a random password or null, and handle password setting later
          password: await bcrypt.hash(socialId, 10), // A dummy password, force user to set real one later or associate with socialId
          roles: [Role.USER],
          // You might add fields like socialProvider, socialId to the User model
        },
      });
    //   await this.mailService.sendWelcomeEmail(user.email, user.firstName || 'User');
    } else {
      // User exists, update their social ID if not already linked (optional)
      // await this.prisma.user.update({
      //   where: { id: user.id },
      //   data: { socialId: socialId, socialProvider: socialProvider },
      // });
    }

    // delete user.password;
    return user;
  }
}