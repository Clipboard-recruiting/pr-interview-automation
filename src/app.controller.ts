import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  CanActivate,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrInterviewService } from './pr-interview/pr-interview.service';

const API_PASSWORD = 'API_PASS';

class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    return authorization === API_PASSWORD;
  }
}

interface CreatePrInterviewPayload {
  username: string;
}

@Controller()
export class AppController {
  constructor(private readonly prInterviewService: PrInterviewService) {}

  @Get('health-check/public')
  async public(@Headers() headers) {
    return {
      headers,
      date: new Date(),
    };
  }

  @Get('health-check/private')
  @UseGuards(AuthGuard)
  async private(@Headers() headers) {
    return {
      headers,
      date: new Date(),
    };
  }

  @Get('pr-interviews')
  @UseGuards(AuthGuard)
  async getPrInterviews() {
    const prInterviewRepos = await this.prInterviewService.list();
    return {
      repos: prInterviewRepos,
    };
  }

  @Post('pr-interviews')
  @UseGuards(AuthGuard)
  async createPrInterview(
    @Body() createPrInterviewPayload: CreatePrInterviewPayload,
  ) {
    const { username } = createPrInterviewPayload;
    const createdPrInterviewRepo = await this.prInterviewService.create(
      username,
    );
    return {
      repo: createdPrInterviewRepo,
    };
  }

  @Delete('pr-interviews/:repoName')
  @UseGuards(AuthGuard)
  async deletePrInterview(@Param('repoName') repoName: string) {
    const deletedPrInterviewRepo = await this.prInterviewService.delete(
      repoName,
    );
    return {
      repo: deletedPrInterviewRepo,
    };
  }
}
