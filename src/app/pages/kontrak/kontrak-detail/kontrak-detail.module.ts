import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KontrakDetailPageRoutingModule } from './kontrak-detail-routing.module';
import { KontrakDetailPage } from './kontrak-detail.page';
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, KontrakDetailPageRoutingModule],
  declarations: [KontrakDetailPage]
})
export class KontrakDetailPageModule {}
