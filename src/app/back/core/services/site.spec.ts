import { TestBed } from '@angular/core/testing';
import { Site } from './site';

describe('Site', () => {
  let service: Site;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [Site]
    });
    service = TestBed.inject(Site);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
