import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteForm } from './site-form';

describe('SiteForm', () => {
  let component: SiteForm;
  let fixture: ComponentFixture<SiteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
