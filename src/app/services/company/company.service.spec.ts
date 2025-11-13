import { TestBed } from '@angular/core/testing';

import { CompanyService } from './company.service';

describe('Company', () => {
  let companyService: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    companyService = TestBed.inject(CompanyService);
  });

  it('should be created', () => {
    expect(companyService).toBeTruthy();
  });
});
