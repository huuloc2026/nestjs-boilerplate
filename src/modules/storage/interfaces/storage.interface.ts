export interface StorageService {
  uploadFile(fileBuffer: Buffer, fileName: string, mimetype: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
  getSignedUrl(fileName: string, expiresInSeconds?: number): Promise<string>;
}