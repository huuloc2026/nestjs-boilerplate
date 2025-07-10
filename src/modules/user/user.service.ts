// src/modules/user/services/user.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedUserResponseDto, UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, firstName, lastName, roles } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: roles || [Role.USER],
      },
    });

    return new UserResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    await this.findOneById(id);

    const updateData: Prisma.UserUpdateInput = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new UserResponseDto(user);
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUserResponseDto> {
    const { page = 1, limit = 10, search, role, sortBy = 'createdAt', sortOrder = 'desc', isActive } = query;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.roles = { has: role };
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Build order by
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    
    return {
      data: users.map(user => new UserResponseDto(user)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async remove(id: string): Promise<UserResponseDto> {
    // Check if user exists
    await this.findOneById(id);

    const user = await this.prisma.user.delete({
      where: { id },
    });

    return new UserResponseDto(user);
  }

  async toggleActiveStatus(id: string): Promise<UserResponseDto> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return new UserResponseDto(updatedUser);
  }
}