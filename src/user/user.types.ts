export interface User {
  id: string;
  address: string | null;
  email: string | null;
  username: string | null;
  loginMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  address: string;
  email?: string;
  loginMethod: string;
  username?: string;
}

export interface UpdateUserDto {
  username?: string;
  address?: string;
  email?: string;
  loginMethod?: string;
}
