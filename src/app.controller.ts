import {
  Controller,
  Body,
  Post,
  UploadedFiles,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { PostVehicleDto } from './dto/post-vehicle.dto';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('vehicle')
  @UseInterceptors(FilesInterceptor('images', 3))
  postVehicle(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: PostVehicleDto,
    // @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.appService.postVehicle(res, dto);
  }
}
