import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TenderListPage } from './tender-list.page';

describe('TenderListPage', () => {
  let component: TenderListPage;
  let fixture: ComponentFixture<TenderListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TenderListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
