import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  standalone: false,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
  email = '';
  isLoading = false;
  error = '';
  successMessage = '';
  emailFocused = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastController
  ) {}
  onSubmit(): void {
    this.error = '';
    this.successMessage = '';
    if (!this.email.trim()) {
      this.error = 'Email wajib diisi.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.error = 'Format email tidak valid.';
      return;
    }
    this.isLoading = true;
    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.status) {
          this.successMessage = res.message || 'Link reset password telah dikirim ke email Anda.';
          const t = await this.toast.create({
            message: this.successMessage,
            duration: 3000,
            color: 'success',
            position: 'top',
            icon: 'mail-outline'
          });
          await t.present();
        } else {
          this.error = res.message || 'Gagal mengirim link reset password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Terjadi kesalahan. Periksa email Anda dan coba lagi.';
      }
    });
  }
  goLogin(): void {
    this.router.navigate(['/login']);
  }
  goResetPassword(): void {
    this.router.navigate(['/reset-password']);
  }
}
