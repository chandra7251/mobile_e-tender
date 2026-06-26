import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { CatalogueListPage } from './catalogue-list.page';

const routes: Routes = [{ path: '', component: CatalogueListPage }];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [CatalogueListPage]
})
export class CatalogueListPageModule {}
