import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { FavoritesService } from './favorites.service';
import { FavoritesCreateDto } from './dto/create.dto';

@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @ApiOperation({ summary: "favoriteslarni ko'rish" })
    @UseGuards(AuthGuard)
    @Get('all')
    getAllFavorites(@Req() req: any) {
        return this.favoritesService.getAllFavorites(req.user.id);
    }


    @ApiOperation({ summary: "get one favorite" })
    @UseGuards(AuthGuard)
    @Get('one/:id')
    getOneFavorite(@Req() req: any) {
        return this.favoritesService.getOneFavorite(req.user.id);
    }

    @ApiOperation({ summary: 'favorites qoshish' })
    @UseGuards(AuthGuard)
    @Post('create')
    createFavorite(@Req() req: any, @Body() payload: FavoritesCreateDto) {
        return this.favoritesService.createFavorite(req.user.id, payload);
    }

    @ApiOperation({ summary: 'favoritesni ochirish' })
    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    deleteFavorite(@Req() req: any) {
        return this.favoritesService.deleteFavorites(req.user.id);
    }
}

