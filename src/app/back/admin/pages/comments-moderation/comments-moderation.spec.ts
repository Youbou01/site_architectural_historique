import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsModerationComponent } from './comments-moderation';

describe('CommentsModeration', () => {
  let component: CommentsModerationComponent;
  let fixture: ComponentFixture<CommentsModerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsModerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
