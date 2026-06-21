import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BidFormPage } from './bid-form.page';
const routes: Routes = [
  {
    path: '',
    component: BidFormPage
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BidFormPageRoutingModule {}
