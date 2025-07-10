// src/modules/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from '@prisma/client';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('app.googleClientId'),
      clientSecret: configService.get<string>('app.googleClientSecret'),
      callbackURL: 'http://localhost:3000/api/auth/google/callback', // Update with your actual callback URL
      scope: ['email', 'profile'],
      passReqToCallback: true,    
    });
  }

  async validate(req:any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, id, photos } = profile;
    const userEmail = emails && emails.length > 0 ? emails[0].value : null;

    if (!userEmail) {
      return done(new Error('Google profile did not provide an email.'), null);
    }

    // Use AuthService to find or create user based on social profile
    const user = await this.authService.findOrCreateSocialUser(
      userEmail,
      name.givenName,
      name.familyName,
      'google',
      // picture: photos[0].value,
      id,
      
    );

    done(null, user); // Pass the user object to Passport
  }
}