import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ayoub } from './ayoub';

describe('Ayoub', () => {
  let component: Ayoub;
  let fixture: ComponentFixture<Ayoub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ayoub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ayoub);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
