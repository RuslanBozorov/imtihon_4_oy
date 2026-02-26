import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MoviesCreateDto } from './dto/create.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/role.dto';
import { Role } from '@prisma/client';
import { UpdateMovieDto } from './dto/update.dto';
import type { Request } from 'express';
import { GetMoviesQueryDto } from './dto/query.dto';
@ApiBearerAuth()
@UseGuards(AuthGuard,RoleGuard)
@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService:MoviesService){}

     @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
      })
      @Roles(Role.SUPERADMIN,Role.ADMIN)
      @Get('all')
      getAll(@Query() query: GetMoviesQueryDto){
        return this.moviesService.getAll(query)
      }


        @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
      })
      @Roles(Role.SUPERADMIN,Role.ADMIN)
      @Get('one/:id')
      getOneMovie(@Param('id',ParseIntPipe) id : number){
        return this.moviesService.getOneMovies(id)
      }

    @ApiConsumes('multipart/form-data')
      @ApiBody({
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            release_year:{type:'string'},
            duration_minutes:{type:'string'},
            rating:{type:'number'},
            subscription_type:{type:'string'},
            categories:{
              type:'array',
              items:{type:'string'}
            },
            poster_url: { type: 'string', format: 'binary' },
          },
        },
      })
      @UseInterceptors(
        FileInterceptor('poster_url', {
          storage: diskStorage({
            destination: './src/uploads/movies',
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
      @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
      })
      @Roles(Role.SUPERADMIN,Role.ADMIN)
      @Post()
      createMovie(@Req() req:Request,@Body() payload:MoviesCreateDto,@UploadedFile() file?:Express.Multer.File){
        return this.moviesService.createMovie(payload,file?.filename ?? '',req['user'])
      }


      @ApiConsumes('multipart/form-data')
      @ApiBody({
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            release_year:{type:'string'},
            duration_minutes:{type:'string'},
            rating:{type:'number'},
            categories:{
              type:'array',
              items:{type:'string'}
            },
            poster_url: { type: 'string', format: 'binary' },
          },
        },
      })
      @UseInterceptors(
        FileInterceptor('poster_url', {
          storage: diskStorage({
            destination: './src/uploads/movies',
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
      @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
      })
      @Roles(Role.SUPERADMIN,Role.ADMIN)
      @Patch('update/:id')
      updateMovie(@Param('id',ParseIntPipe) id : number,@Body() payload : UpdateMovieDto,@UploadedFile() file?:Express.Multer.File){
        return this.moviesService.updateMovie(id,payload,file?.filename)
      }

      @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN} ${Role.USER}`
      })
      @Roles(Role.SUPERADMIN,Role.ADMIN,Role.USER)
      @Put('watch/movie/:id')
      watchMovie(@Param('id',ParseIntPipe) id:number,@Req() req:Request){
        return this.moviesService.watchMovie(id,req['user'])
      }


       @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
      })
      @Roles(Role.SUPERADMIN,Role.ADMIN)
      @Delete('delete/:id')
      deleteMovie(@Param('id',ParseIntPipe) id : number){
        return this.moviesService.deleteMovie(id)
      }

}
