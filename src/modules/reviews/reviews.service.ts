import {BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { ReviewsCreateDto } from './dto/create.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma:PrismaService){}

  async createReview(movieId: number, userId: number, payload: ReviewsCreateDto) {
    
    const movie = await this.prisma.movies.findUnique({
        where: { id: Number(movieId) }
    })

    if (!movie) {
        throw new NotFoundException("Movie topilmadi")
    }

    const user = await this.prisma.users.findUnique({
        where: { id: Number(userId) }
    })

    if (!user) {
        throw new NotFoundException("User topilmadi")
    }

    const existingReview = await this.prisma.reviews.findFirst({
        where: {
            movie_id: movieId,
            user_id: userId
        }
    })

    if (existingReview) {
        throw new BadRequestException("Siz bu movie uchun allaqachon review yozgansiz")
    }

    if (payload.rating < 1 || payload.rating > 5) {
        throw new BadRequestException("Rating 1 dan 5 gacha bo‘lishi kerak")
    }

    const newReview = await this.prisma.reviews.create({
        data: {
            movie_id: movieId,
            user_id: userId,
            rating: payload.rating,
            comment: payload.comment
        }
    })

    return {
        success: true,
        message: "Review yaratildi",
        data: newReview
    }
}


    async getAllReviews(){
        const allReviews = await this.prisma.reviews.findMany()
        return {
            success:true,
            message:"Barcha reviews",
            data:allReviews
        }
    }

    async getOneReview(id:number){
        const existId = await this.prisma.reviews.findUnique({where:{id:Number(id)}})
        if(!existId){
            throw new NotFoundException("Review topilmadi")
        }
        return {
            success:true,
            message:"Review",
            data:existId
        }
    }

   async deleteReview(id: number, userId: number) {

  const review = await this.prisma.reviews.findUnique({
    where: { id }
  });

  if (!review) {
    throw new NotFoundException('Review topilmadi');
  }


  const user = await this.prisma.users.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundException('User topilmadi');
  }

  
  if (
    user.role === 'USER' &&
    review.user_id !== userId
  ) {
    throw new ForbiddenException(
      'Siz faqat o‘zingiz yozgan reviewni o‘chira olasiz'
    );
  }

  await this.prisma.reviews.delete({
    where: { id }
  });

  return {
    success: true,
    message: 'Review o‘chirildi'
  };
}

}
