import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GithubApiModule } from './github-api/github-api.module';
import { GithubCliModule } from './github-cli/github-cli.module';
import { PrInterviewModule } from './pr-interview/pr-interview.module';

@Module({
  imports: [GithubApiModule, GithubCliModule, PrInterviewModule],
  controllers: [AppController],
})
export class AppModule {}
