import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.dto';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateDto } from './dto/create.dto';
import { UpdateMoviesCategoryDto } from './dto/update.dto';
import { MoviesCategoriesService } from './movies_categories.service';

@ApiBearerAuth()
@Controller('moviescategories')
@UseGuards(AuthGuard, RoleGuard)
export class MoviesCategoriesController {
  constructor(private readonly service: MoviesCategoriesService) {}

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAll() {
    return this.service.getAll();
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/:id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  create(@Body() payload: CreateDto) {
    return this.service.create(payload);
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Patch('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateMoviesCategoryDto,
  ) {
    return this.service.update(id, payload);
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
