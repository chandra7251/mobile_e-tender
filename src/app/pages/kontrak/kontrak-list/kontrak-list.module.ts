import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KontrakListPageRoutingModule } from './kontrak-list-routing.module';
import { KontrakListPage } from './kontrak-list.page';
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, KontrakListPageRoutingModule],
  declarations: [KontrakListPage]
})
export class KontrakListPageModule {}
