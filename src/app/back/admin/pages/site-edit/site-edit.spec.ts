import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditComponent } from './site-edit';

describe('SiteEdit', () => {
  let component: SiteEditComponent;
  let fixture: ComponentFixture<SiteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
