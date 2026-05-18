import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BidFormPageRoutingModule } from './bid-form-routing.module';
import { BidFormPage } from './bid-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BidFormPageRoutingModule
  ],
  declarations: [BidFormPage]
})
export class BidFormPageModule {}
