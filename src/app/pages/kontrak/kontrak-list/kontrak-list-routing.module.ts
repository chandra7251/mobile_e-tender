import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KontrakListPage } from './kontrak-list.page';
const routes: Routes = [{ path: '', component: KontrakListPage }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KontrakListPageRoutingModule {}
