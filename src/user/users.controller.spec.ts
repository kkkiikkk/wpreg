import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';
import { User } from './user.types';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UserService;

  const mockUser: User = {
    id: 'test-id',
    address: '0x1234567890',
    email: 'test@example.com',
    username: 'testuser',
    loginMethod: 'web3auth',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const req = {
        user: { id: 'test-id' },
      };

      const result = await controller.getProfile(req as any);

      expect(result).toEqual(mockUser);
      expect(mockUserService.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      const req = {
        user: { id: 'non-existent-id' },
      };

      await expect(controller.getProfile(req as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserService.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });
});
