import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeliveryProgressPage } from './delivery-progress.page';
const routes: Routes = [{ path: '', component: DeliveryProgressPage }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryProgressPageRoutingModule {}
