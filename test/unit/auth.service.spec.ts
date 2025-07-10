// // test/unit/auth.service.spec.ts
// import { Test, TestingModule } from '@nestjs/testing';

// import { PrismaService } from '../../src/database/prisma.service';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

// import * as bcrypt from 'bcrypt';
// import { User, Role } from '@prisma/client';
// import { AuthService } from 'src/auth/auth.service';
// import { MailService } from 'src/modules/mail/mail.service';
// import { ConflictException } from '@nestjs/common';

// const mockUser: User = {
//   id: 'some-uuid',
//   email: 'test@example.com',
//   password: 'hashedpassword',
//   firstName: 'Test',
//   lastName: 'User',
//   roles: [Role.USER],
//   isActive: true,
//   createdAt: new Date(),
//   updatedAt: new Date(),
// };

// describe('AuthService', () => {
//   let service: AuthService;
//   let prisma: PrismaService;
//   let jwtService: JwtService;
//   let mailService: MailService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: PrismaService,
//           useValue: {
//             user: {
//               findUnique: jest.fn(),
//               create: jest.fn(),
//             },
//           },
//         },
//         {
//           provide: JwtService,
//           useValue: {
//             sign: jest.fn(() => 'mockAccessToken'),
//           },
//         },
//         {
//           provide: ConfigService,
//           useValue: {
//             get: jest.fn((key: string) => {
//               if (key === 'app.jwtSecret') return 'testSecret';
//               if (key === 'app.jwtExpiresIn') return '1h';
//               return null;
//             }),
//           },
//         },
//         {
//           provide: MailService,
//           useValue: {
//             sendWelcomeEmail: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     prisma = module.get<PrismaService>(PrismaService);
//     jwtService = module.get<JwtService>(JwtService);
//     mailService = module.get<MailService>(MailService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('register', () => {
//     it('should register a new user successfully', async () => {
//       jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
//       jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');
//       jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
//       jest.spyOn(mailService, 'sendWelcomeEmail').mockResolvedValue(undefined);

//       const result = await service.register({
//         email: 'newuser@example.com',
//         password: 'Password123!',
//         firstName: 'New',
//         lastName: 'User',
//       });

//       expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'newuser@example.com' } });
//       expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
//       expect(prisma.user.create).toHaveBeenCalledWith({
//         data: {
//           email: 'newuser@example.com',
//           password: 'hashedpassword',
//           firstName: 'New',
//           lastName: 'User',
//           roles: [Role.USER],
//         },
//       });
//       expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith('newuser@example.com', 'New');
//       expect(result.email).toEqual('newuser@example.com');
//       expect(result.password).toBeUndefined(); // Ensure password is removed
//     });

//     it('should throw ConflictException if user already exists', async () => {
//       jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

//       await expect(
//         service.register({
//           email: 'test@example.com',
//           password: 'Password123!',
//         }),
//       ).rejects.toThrow(ConflictException);
//     });
//   });

//   describe('validateUser', () => {
//     it('should return user without password on valid credentials', async () => {
//       jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
//       jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

//       const result = await service.validateUser('test@example.com', 'Password123!');
//       expect(result.email).toEqual('test@example.com');
//       expect(result.password).toBeUndefined();
//     });

//     it('should return null for invalid credentials', async () => {
//       jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
//       jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

//       const result = await service.validateUser('test@example.com', 'WrongPassword');
//       expect(result).toBeNull();
//     });

//     it('should return null if user not found', async () => {
//       jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

//       const result = await service.validateUser('nonexistent@example.com', 'Password123!');
//       expect(result).toBeNull();
//     });

//     it('should return null if user is inactive', async () => {
//       jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...mockUser, isActive: false });
//       jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

//       const result = await service.validateUser('test@example.com', 'Password123!');
//       expect(result).toBeNull();
//     });
//   });

//   describe('login', () => {
//     it('should return an access token', async () => {
//       const result = await service.login(mockUser);
//       expect(result).toEqual({
//         accessToken: 'mockAccessToken',
//         tokenType: 'bearer',
//         expiresIn: 3600, // Based on '1h' in config
//       });
//       expect(jwtService.sign).toHaveBeenCalledWith(
//         { email: mockUser.email, sub: mockUser.id, roles: mockUser.roles },
//         { expiresIn: '1h' },
//       );
//     });
//   });
// });