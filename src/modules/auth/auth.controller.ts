import {
  Body,
  Controller,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}
  @Post('register')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './src/uploads/avatar',
        filename: (req, file, cb) => {
          const filename = Date.now() + '.' + file.mimetype.split('/')[1];
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const existFile = ['png', 'jpg', 'jpeg'];

        if (!existFile.includes(file.mimetype.split('/')[1])) {
          cb(new UnsupportedMediaTypeException(), false);
        }
        cb(null, true);
      },
    }),
  )
  register(
    @Body() payload: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.AuthService.register(payload, file?.filename ?? '');
  }

  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.AuthService.login(payload);
  }


  @Post('login/admin')
  loginAdmin(@Body() payload: LoginDto) {
    return this.AuthService.login(payload);
  }
}
