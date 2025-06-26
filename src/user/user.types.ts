export interface User {
  id: string;
  address: string | null;
  email: string | null;
  username: string | null;
  loginMethod: string;
  isEmailVerified: boolean;
  emailVerifyToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  address?: string;
  email?: string;
  loginMethod: string;
  username?: string;
  isEmailVerified?: boolean;
  emailVerifyToken?: string;
}

export interface UpdateUserDto {
  username?: string;
  address?: string;
  email?: string;
  loginMethod?: string;
  isEmailVerified?: boolean;
  emailVerifyToken?: string;
}
