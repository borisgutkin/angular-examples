import { TestBed, async, inject } from '@angular/core/testing';

import { PromptGuard } from './prompt.guard';

describe('PromptGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PromptGuard]
    });
  });

  it('should ...', inject([PromptGuard], (guard: PromptGuard) => {
    expect(guard).toBeTruthy();
  }));
});
