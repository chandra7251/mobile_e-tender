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
        path: 'tenders/:id/sanggahan',
        loadChildren: () => import('../tenders/sanggahan/sanggahan.module').then(m => m.SanggahanPageModule)
      },
      {
        path: 'kontrak',
        loadChildren: () => import('../kontrak/kontrak-list/kontrak-list.module').then(m => m.KontrakListPageModule)
      },
      {
        path: 'kontrak/:contractId',
        loadChildren: () => import('../kontrak/kontrak-detail/kontrak-detail.module').then(m => m.KontrakDetailPageModule)
      },
      {
        path: 'kontrak/:contractId/delivery/:deliveryId',
        loadChildren: () => import('../kontrak/delivery-progress/delivery-progress.module').then(m => m.DeliveryProgressPageModule)
      },
        {
          path: 'catalogue',
          loadChildren: () => import('../catalogue/catalogue-list/catalogue-list.module').then(m => m.CatalogueListPageModule)
        },
        {
          path: 'catalogue/my',
          loadChildren: () => import('../catalogue/my-catalogue/my-catalogue.module').then(m => m.MyCataloguePageModule)
        },
        {
          path: 'catalogue/:id',
          loadChildren: () => import('../catalogue/catalogue-detail/catalogue-detail.module').then(m => m.CatalogueDetailPageModule)
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
