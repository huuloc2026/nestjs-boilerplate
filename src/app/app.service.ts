import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World from Jake Onyx - My Boilerplate 2025!';
  }
}
