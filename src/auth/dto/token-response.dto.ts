// src/modules/auth/dto/token-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ example: 'bearer', description: 'Token type' })
  tokenType: string;

  @ApiProperty({ example: 3600, description: 'Expires in seconds' })
  expiresIn: number;
}