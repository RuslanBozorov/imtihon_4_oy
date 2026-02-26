import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali' })
  @IsString()
  @MinLength(3)
  username: string;
  @ApiProperty({ example: 'ali@gmail.com' })
  @IsString()
  email: string;
  @ApiProperty({ example: 'Ali1234' })
  @IsString()
  password: string;
}
