import {
  Controller,
  Get,
  Put,
  UseGuards,
  Req,
  NotFoundException,
  Query,
  BadRequestException,
  Body,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { User } from './user.types';
import { Request } from 'express';
import { UpdateUsernameDto } from './dto/update-username.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: "Returns the authenticated user's information",
  })
  async getProfile(@Req() req: Request & { user: User }): Promise<User> {
    const userId = req.user.id;
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('username/check')
  @ApiOperation({ summary: 'Check if username is unique' })
  @ApiResponse({
    status: 200,
    description: 'Returns whether the username is available',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        isAvailable: { type: 'boolean' },
      },
    },
  })
  async checkUsernameUniqueness(
    @Query('username') username: string,
  ): Promise<{ username: string; isAvailable: boolean }> {
    if (!username || username.trim().length === 0) {
      throw new BadRequestException('Username is required');
    }

    const existingUser = await this.userService.findByUsername(username);
    return {
      username,
      isAvailable: !existingUser,
    };
  }

  @Put('username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user username' })
  @ApiResponse({
    status: 200,
    description: "Successfully updated user's username",
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        address: { type: 'string' },
        email: { type: 'string' },
        loginMethod: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Username already taken',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Username already taken' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async updateUsername(
    @Req() req: Request & { user: User },
    @Body() updateUsernameDto: UpdateUsernameDto,
  ): Promise<User> {
    const userId = req.user.id;
    const { username } = updateUsernameDto;

    // Check if username is already taken
    const existingUser = await this.userService.findByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already taken');
    }

    // Update username
    return this.userService.updateUser(userId, { username });
  }
}
