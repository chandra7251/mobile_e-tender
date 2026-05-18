import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TenderDetailPageRoutingModule } from './tender-detail-routing.module';
import { TenderDetailPage } from './tender-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TenderDetailPageRoutingModule
  ],
  declarations: [TenderDetailPage]
})
export class TenderDetailPageModule {}
