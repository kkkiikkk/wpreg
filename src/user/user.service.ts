import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, CreateUserDto, UpdateUserDto } from './user.types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByAddress(address: string): Promise<User | null> {
    if (!address) return null;
    return this.prisma.user.findUnique({
      where: { address },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmailVerifyToken(token: string): Promise<User | null> {
    if (!token) return null;
    return this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });
  }
}
