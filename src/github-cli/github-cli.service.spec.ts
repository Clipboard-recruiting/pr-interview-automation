import { Test, TestingModule } from '@nestjs/testing';
import { GithubCliService } from './github-cli.service';

describe('GithubCliService', () => {
  let service: GithubCliService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubCliService],
    }).compile();

    service = module.get<GithubCliService>(GithubCliService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
