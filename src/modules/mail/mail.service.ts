import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
    const verificationUrl = `${this.configService.get('app.frontendUrl')}/verify-email?token=${token}`;
    
    // TODO: Implement actual email sending with your preferred email service
    // For now, just log the verification URL
    this.logger.log(`Email verification for ${email}: ${verificationUrl}`);
    this.logger.log(`Name: ${name}`);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    const resetUrl = `${this.configService.get('app.frontendUrl')}/reset-password?token=${token}`;
    
    // TODO: Implement actual email sending with your preferred email service
    // For now, just log the reset URL
    this.logger.log(`Password reset for ${email}: ${resetUrl}`);
    this.logger.log(`Name: ${name}`);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // TODO: Implement actual email sending with your preferred email service
    // For now, just log the welcome message
    this.logger.log(`Welcome email sent to ${email} for ${name}`);
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    // TODO: Implement actual email sending with your preferred email service
    // For now, just log the notification
    this.logger.log(`Password changed notification sent to ${email} for ${name}`);
  }
}
