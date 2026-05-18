import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementsPage } from './announcements.page';

describe('AnnouncementsPage', () => {
  let component: AnnouncementsPage;
  let fixture: ComponentFixture<AnnouncementsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
