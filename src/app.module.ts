import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PuppeterService } from './services/puppeter.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'), // path to your image folder
      serveRoot: '/images', // URL prefix — access images via /images/filename.jpg
    }),
  ],
  controllers: [AppController],
  providers: [PuppeterService, AppService],
})
export class AppModule {}
