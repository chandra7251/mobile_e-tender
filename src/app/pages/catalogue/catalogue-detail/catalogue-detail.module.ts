import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { CatalogueDetailPage } from './catalogue-detail.page';
const routes: Routes = [{ path: '', component: CatalogueDetailPage }];
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [CatalogueDetailPage]
})
export class CatalogueDetailPageModule {}
