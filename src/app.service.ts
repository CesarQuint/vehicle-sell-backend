import { Injectable } from '@nestjs/common';
import { PuppeterService } from './services/puppeter.service';
import { PostVehicleDto } from './dto/post-vehicle.dto';

@Injectable()
export class AppService {
  constructor(private readonly puppeterService: PuppeterService) {}
  async getHello(
    postVehicleDto: PostVehicleDto,
    images: Express.Multer.File[],
  ) {
    return await this.puppeterService.postVehicle(postVehicleDto, images);
  }
}
