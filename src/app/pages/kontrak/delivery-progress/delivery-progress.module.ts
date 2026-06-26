import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeliveryProgressPageRoutingModule } from './delivery-progress-routing.module';
import { DeliveryProgressPage } from './delivery-progress.page';
@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, DeliveryProgressPageRoutingModule],
  declarations: [DeliveryProgressPage]
})
export class DeliveryProgressPageModule {}
