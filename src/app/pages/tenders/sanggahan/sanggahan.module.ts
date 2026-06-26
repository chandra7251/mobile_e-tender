import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SanggahanPageRoutingModule } from './sanggahan-routing.module';
import { SanggahanPage } from './sanggahan.page';
@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, SanggahanPageRoutingModule],
  declarations: [SanggahanPage]
})
export class SanggahanPageModule {}
