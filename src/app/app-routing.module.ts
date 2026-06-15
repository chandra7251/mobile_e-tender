import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { VendorApprovedGuard } from './core/guards/vendor-approved.guard';
import { IntroGuard } from './core/guards/intro.guard';

const routes: Routes = [
  // Root redirect
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule),
    canActivate: [IntroGuard]
  },

  // Public routes
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/auth/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule),
    canActivate: [GuestGuard]
  },

  // Protected routes
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },

  // Vendor submission
  {
    path: 'vendor/pengajuan',
    loadChildren: () => import('./pages/pengajuan-tender/pengajuan-tender.module')
      .then(m => m.PengajuanTenderPageModule),
    canActivate: [AuthGuard, VendorApprovedGuard]
  },
  {
    path: 'vendor/pengajuan/riwayat',
    loadChildren: () => import('./pages/riwayat-pengajuan/riwayat-pengajuan.module')
      .then(m => m.RiwayatPengajuanPageModule),
    canActivate: [AuthGuard, VendorApprovedGuard]
  },

  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then( m => m.SplashPageModule)
  },
  // Wildcard fallback
  {
    path: '**',
    redirectTo: 'splash'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
