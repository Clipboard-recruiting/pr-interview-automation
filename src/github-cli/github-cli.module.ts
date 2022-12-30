import { Module } from '@nestjs/common';
import { GithubCliService } from './github-cli.service';

@Module({
  providers: [GithubCliService],
  exports: [GithubCliService],
})
export class GithubCliModule {}
