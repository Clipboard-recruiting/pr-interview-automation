import { Test, TestingModule } from '@nestjs/testing';
import { PrInterviewService } from './pr-interview.service';

describe('PrInterviewService', () => {
  let service: PrInterviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrInterviewService],
    }).compile();

    service = module.get<PrInterviewService>(PrInterviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
