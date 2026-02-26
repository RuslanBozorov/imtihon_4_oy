import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { SaveWatchHistoryDto } from './dto/create.dto';
import { WatchHistoryService } from './watch_histroy.service';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('watch/histroy')
export class WatchHistroyController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @ApiOperation({ summary: "Watch history saqlash" })
  @Post('save/:movieId')
  saveWatchHistory(
    @Req() req: any,
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() payload: SaveWatchHistoryDto,
  ) {
    return this.watchHistoryService.saveWatchHistory(
      req.user.id,
      movieId,
      payload.watched_duration,
    );
  }
}
