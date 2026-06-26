import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KontrakDetailPage } from './kontrak-detail.page';
const routes: Routes = [{ path: '', component: KontrakDetailPage }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KontrakDetailPageRoutingModule {}
