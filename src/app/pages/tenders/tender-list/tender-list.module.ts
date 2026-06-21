import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TenderListPageRoutingModule } from './tender-list-routing.module';
import { TenderListPage } from './tender-list.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TenderListPageRoutingModule
  ],
  declarations: [TenderListPage]
})
export class TenderListPageModule {}
