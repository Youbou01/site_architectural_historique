import { TestBed } from '@angular/core/testing';
import { Stats } from './stats';
import { Site } from './site';

describe('Stats', () => {
  let service: Stats;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [Stats, Site]
    });
    service = TestBed.inject(Stats);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
