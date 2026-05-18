import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TenderDetailPage } from './tender-detail.page';

describe('TenderDetailPage', () => {
  let component: TenderDetailPage;
  let fixture: ComponentFixture<TenderDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TenderDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
