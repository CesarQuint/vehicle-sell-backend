import { Injectable, StreamableFile, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { PuppeterService } from './services/puppeter.service';
import { PostVehicleDto } from './dto/post-vehicle.dto';
import { Response } from 'express';

@Injectable()
export class AppService {
  constructor(private readonly puppeterService: PuppeterService) {}
  async postVehicle(
    res: Response,
    postVehicleDto: PostVehicleDto,
    // images: Express.Multer.File[],
  ) {
    try {
      await this.puppeterService.postVehicle(postVehicleDto);

      const filePath = join(process.cwd(), 'vehicle-post.png');

      if (!existsSync(filePath)) {
        throw new NotFoundException('Image not found.');
      }

      const fileStream = createReadStream(filePath);

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="vehicle-post.png"',
      });

      return new StreamableFile(fileStream);
    } catch (error) {
      throw error;
    }
  }
}
