import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'pengajuan-tender',
        loadChildren: () => import('../pengajuan-tender/pengajuan-tender.module').then(m => m.PengajuanTenderPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'documents',
        loadChildren: () => import('../documents/documents.module').then(m => m.DocumentsPageModule)
      },
      {
        path: 'tenders',
        loadChildren: () => import('../tenders/tender-list/tender-list.module').then(m => m.TenderListPageModule)
      },
      {
        path: 'tenders/:id',
        loadChildren: () => import('../tenders/tender-detail/tender-detail.module').then(m => m.TenderDetailPageModule)
      },
      {
        path: 'tenders/:id/penawaran',
        loadChildren: () => import('../tenders/bid-form/bid-form.module').then(m => m.BidFormPageModule)
      },
      {
        path: 'tenders/:id/result',
        loadChildren: () => import('../tenders/result/result.module').then(m => m.ResultPageModule)
      },
      {
        path: 'results',
        loadChildren: () => import('../tenders/result-history/result-history.module').then(m => m.ResultHistoryPageModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('../notifications/notifications.module').then(m => m.NotificationsPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
