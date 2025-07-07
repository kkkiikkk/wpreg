import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUsernameDto {
  @ApiProperty({
    description: 'New username',
    example: 'user123',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @Length(3, 30, {
    message: 'Username must be between 3 and 30 characters',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  @Transform(({ value }: { value: string }): string => {
    return value.trim();
  })
  username: string;
}
