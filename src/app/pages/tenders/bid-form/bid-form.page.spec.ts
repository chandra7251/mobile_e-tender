import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BidFormPage } from './bid-form.page';

describe('BidFormPage', () => {
  let component: BidFormPage;
  let fixture: ComponentFixture<BidFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BidFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
