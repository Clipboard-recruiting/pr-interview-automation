import { Module } from '@nestjs/common';
import { PrInterviewService } from './pr-interview.service';
import { GithubCliModule } from '../github-cli/github-cli.module';
import { GithubApiModule } from '../github-api/github-api.module';

@Module({
  providers: [PrInterviewService],
  exports: [PrInterviewService],
  imports: [GithubCliModule, GithubApiModule],
})
export class PrInterviewModule {}
