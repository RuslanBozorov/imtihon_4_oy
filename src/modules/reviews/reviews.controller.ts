import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Post,
  Req,
  Body,
  ParseIntPipe
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { ReviewsCreateDto } from './dto/create.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.dto';
import { Role } from '@prisma/client';

@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}


  @ApiOperation({ summary: 'Review qo‘shish' })
  @Post('create/:movieId')
  @Roles(Role.SUPERADMIN,Role.ADMIN,Role.USER)
  createReview(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Req() req: any,
    @Body() payload: ReviewsCreateDto,
  ) {
    return this.reviewsService.createReview(
      movieId,
      req.user.id,
      payload,
    );
  }

  @ApiOperation({ summary: 'Reviewlarni ko‘rish' })
  @Get('all')
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  getAllReviews() {
    return this.reviewsService.getAllReviews();
  }

  
 
  @ApiOperation({ summary: 'Bitta reviewni ko‘rish' })
  @Get('one/:id')
  @Roles(Role.SUPERADMIN,Role.ADMIN,Role.USER)
  getOneReview(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewsService.getOneReview(id);
  }


  @ApiOperation({ summary: 'Reviewni o‘chirish' })
  @Delete('delete/:id')
  @Roles(Role.SUPERADMIN,Role.ADMIN,Role.USER)
  deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.reviewsService.deleteReview(id, req.user.id);
  }
}