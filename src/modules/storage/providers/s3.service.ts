import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../interfaces/storage.interface';

@Injectable()
export class S3StorageService implements StorageService {
  private s3: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const bucket = this.configService.get<string>('app.awsS3BucketName');
    if (!bucket) {
      throw new Error('AWS S3 bucket name is not defined in configuration');
    }
    this.bucketName = bucket;

    const region = this.configService.get<string>('app.awsS3Region');
    const accessKeyId = this.configService.get<string>('app.awsS3AccessKeyId');
    const secretAccessKey = this.configService.get<string>('app.awsS3SecretAccessKey');

    if (!region) {
      throw new Error('AWS S3 region is not defined in configuration');
    }
    if (!accessKeyId) {
      throw new Error('AWS S3 access key ID is not defined in configuration');
    }
    if (!secretAccessKey) {
      throw new Error('AWS S3 secret access key is not defined in configuration');
    }

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimetype: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimetype,
    });

    await this.s3.send(command);
    // You might return a public URL if the bucket is public, or a signed URL
    return `https://${this.bucketName}.s3.${this.configService.get<string>('app.awsS3Region')}.amazonaws.com/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });
    await this.s3.send(command);
  }

  async getSignedUrl(fileName: string, expiresInSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }
}