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
import * as crypto from 'crypto';

import { User, Role } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { MailService } from 'src/modules/mail/mail.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService, 
    ) { }

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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        // Create the user in the database
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                roles: [Role.USER],
                emailVerificationToken,
                isEmailVerified: false,
            },
        });

        // Send verification email
        await this.mailService.sendVerificationEmail(user.email, emailVerificationToken, user.firstName || 'User');

        // Remove sensitive data before returning
        const { password: _, emailVerificationToken: __, ...result } = user;
        return result as User;
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

            const { password, ...result } = user;
            return result as User;
        }
        return null; 
    }

    /**
     * Performs user login and generates JWT tokens.
     * @param user The validated user object.
     * @returns TokenResponseDto containing the access and refresh tokens.
     */
    async login(user: User & { isEmailVerified: boolean }): Promise<TokenResponseDto> {
        // Check if email is verified
        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Please verify your email before logging in.');
        }

        // Update last login time
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const payload = { email: user.email, sub: user.id, roles: user.roles };
        const expiresIn = this.configService.get<string>('app.jwtExpiresIn') ?? '1h';

        const accessToken = this.jwtService.sign(payload, { expiresIn });
        const refreshToken = await this.generateRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
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
            const { password, ...userWithoutPassword } = user; // Exclude password
            return userWithoutPassword as User;
        }
        return null;
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

    /**
     * Generates a refresh token for the user
     */
    private async generateRefreshToken(userId: string): Promise<string> {
        const token = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });

        return token;
    }

    /**
     * Refreshes the access token using a refresh token
     */
    async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
        const { refreshToken } = refreshTokenDto;

        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token.');
        }

        if (tokenRecord.expiresAt < new Date()) {
            // Clean up expired token
            await this.prisma.refreshToken.delete({
                where: { id: tokenRecord.id },
            });
            throw new UnauthorizedException('Refresh token has expired.');
        }

        const payload = { 
            email: tokenRecord.user.email, 
            sub: tokenRecord.user.id, 
            roles: tokenRecord.user.roles 
        };
        const expiresIn = this.configService.get<string>('app.jwtExpiresIn') ?? '1h';

        const accessToken = this.jwtService.sign(payload, { expiresIn });

        return {
            accessToken,
            tokenType: 'bearer',
            expiresIn: this.parseJwtExpiresIn(expiresIn),
        };
    }

    /**
     * Verifies user email using verification token
     */
    async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
        const { token } = verifyEmailDto;

        const user = await this.prisma.user.findFirst({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            throw new BadRequestException('Invalid verification token.');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
            },
        });

        await this.mailService.sendWelcomeEmail(user.email, user.firstName || 'User');

        return { message: 'Email verified successfully.' };
    }

    /**
     * Initiates forgot password process
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const { email } = forgotPasswordDto;

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal if email exists for security
            return { message: 'If the email exists, a password reset link has been sent.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });

        await this.mailService.sendPasswordResetEmail(user.email, resetToken, user.firstName || 'User');

        return { message: 'If the email exists, a password reset link has been sent.' };
    }

    /**
     * Resets password using reset token
     */
    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, newPassword } = resetPasswordDto;

        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        // Invalidate all refresh tokens for security
        await this.prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });

        await this.mailService.sendPasswordChangedEmail(user.email, user.firstName || 'User');

        return { message: 'Password reset successfully.' };
    }

    /**
     * Changes user password (authenticated user)
     */
    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Invalidate all refresh tokens except current session (optional)
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        await this.mailService.sendPasswordChangedEmail(user.email, user.firstName || 'User');

        return { message: 'Password changed successfully.' };
    }

    /**
     * Logs out user by invalidating refresh token
     */
    async logout(refreshToken: string): Promise<{ message: string }> {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });

        return { message: 'Logged out successfully.' };
    }

    /**
     * Logs out user from all devices
     */
    async logoutAllDevices(userId: string): Promise<{ message: string }> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        return { message: 'Logged out from all devices successfully.' };
    }

    /**
     * Resends email verification
     */
    async resendEmailVerification(email: string): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: 'If the email exists, a verification link has been sent.' };
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email is already verified.');
        }

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerificationToken },
        });

        await this.mailService.sendVerificationEmail(user.email, emailVerificationToken, user.firstName || 'User');

        return { message: 'If the email exists, a verification link has been sent.' };
    }

    /**
     * Clean up expired tokens (can be called by a cron job)
     */
    async cleanupExpiredTokens(): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });

        // Clean up expired password reset tokens
        await this.prisma.user.updateMany({
            where: { passwordResetExpires: { lt: new Date() } },
            data: {
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
    }
}