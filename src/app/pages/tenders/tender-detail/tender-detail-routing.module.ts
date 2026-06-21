import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TenderDetailPage } from './tender-detail.page';
const routes: Routes = [
  {
    path: '',
    component: TenderDetailPage
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenderDetailPageRoutingModule {}
