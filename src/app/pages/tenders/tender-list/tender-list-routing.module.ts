import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TenderListPage } from './tender-list.page';
const routes: Routes = [
  {
    path: '',
    component: TenderListPage
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenderListPageRoutingModule {}
