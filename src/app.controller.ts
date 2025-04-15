import {
  Controller,
  Body,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AppService } from './app.service';
import { PostVehicleDto } from './dto/post-vehicle.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('vehicle')
  @UseInterceptors(FilesInterceptor('images', 3))
  postVehicle(
    @Body() dto: PostVehicleDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.appService.getHello(dto, images);
  }
}
