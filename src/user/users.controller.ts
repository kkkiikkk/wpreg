import {
  Controller,
  Get,
  UseGuards,
  Req,
  NotFoundException,
  Query,
  BadRequestException,
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
}
