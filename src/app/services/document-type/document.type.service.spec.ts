import { TestBed } from '@angular/core/testing';

import { DocumentType } from './document-type';

describe('DocumentType', () => {
  let service: DocumentType;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentType);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
