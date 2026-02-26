import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MovieFilesService } from './movie_files.service';
import { Roles } from 'src/common/decorators/role.dto';
import { Role } from '@prisma/client';
import { MovieFilesCreateDto } from './dto/create.dto';
import { MovieFilesUpdateDto } from './dto/update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('movie/files')
export class MovieFilesController {
  constructor(private readonly movieFileService: MovieFilesService) { }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAllMovieFile() {
    return this.movieFileService.getAllMovieFile()
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/:id')
  getOneMovieFile(@Param('id', ParseIntPipe) id: number) {
    return this.movieFileService.getOneMovieFile(id)
  }


  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        movie_id: { type: 'number' },
        quality: { type: 'string' },
        language: { type: 'string' },
        file_url: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file_url', {
      storage: diskStorage({
        destination: './src/uploads/videos',
        filename: (req, file, cb) => {
          const filename = Date.now() + '.' + file.mimetype.split('/')[1];
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post('create/:id')
  createMovieFile(@Param('id', ParseIntPipe) id: number, @Body() payload: MovieFilesCreateDto, @UploadedFile() file?: Express.Multer.File) {

    return this.movieFileService.createMovieFile(id, payload, file?.filename ?? '')
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        movie_id: { type: 'number' },
        quality: { type: 'string' },
        language: { type: 'string' },
        file_url: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file_url', {
      storage: diskStorage({
        destination: './src/uploads/videos',
        filename: (req, file, cb) => {
          const filename = Date.now() + '.' + file.mimetype.split('/')[1];
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put('update/:id')
  updateMovieFile(@Param('id', ParseIntPipe) id: number, @Body() payload: MovieFilesUpdateDto, @UploadedFile() file?: Express.Multer.File) {

    return this.movieFileService.updateMovieFile(id, payload, file?.filename)
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  deleteMovieFile(@Param('id', ParseIntPipe) id: number) {
    return this.movieFileService.deleteMovieFile(id)
  }
}
