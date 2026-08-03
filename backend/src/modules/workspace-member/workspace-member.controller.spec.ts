import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceMemberController } from './workspace-member.controller';

describe('WorkspaceMemberController', () => {
  let controller: WorkspaceMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceMemberController],
    }).compile();

    controller = module.get<WorkspaceMemberController>(WorkspaceMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
