import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/common/decorators/role.dto';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @ApiOperation({
    summary: `${Role.SUPERADMIN}  ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}  ${Role.ADMIN} `,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('single/:id')
  getSingleUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getSingleUser(id);
  }


    @ApiOperation({
    summary: `${Role.SUPERADMIN}  ${Role.ADMIN} `,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('inactives')
  getInActiveUser(){
    return this.userService.getInActiveUser()
  }

  @ApiOperation({
    summary: `O'zini O'zi  Ko'ra oladi`,
  })
  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.userService.getMe(req.user.id);
  }

  @ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post('create/admin')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
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
  createAdmin(
    @Body() dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.createAdmin(dto, file?.filename ?? '');
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post('create/user')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './src/uploads',
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
  createUser(
    @Body() dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.createUser(dto, file?.filename ?? '');
  }

  @ApiOperation({
    summary: `O'zini O'zi Update qila oladi`,
  })
  @UseGuards(AuthGuard)
  @Patch('update/me')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './src/uploads',
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
  updateMe(
    @Req() req: any,
    @Body() dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateMe(req.user.id, file?.filename ?? '', dto);
  }

  @ApiOperation({
    summary: ` ${Role.SUPERADMIN}  ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Patch('update/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './src/uploads',
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
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateUser(id, file?.filename ?? '', dto);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
