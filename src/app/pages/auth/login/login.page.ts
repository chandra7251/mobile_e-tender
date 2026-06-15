import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  email = '';
  password = '';
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  isUnverified = false;
  isResending = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastController
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.status === 'success') {
          await this.showToast('Login berhasil!', 'success');
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        } else {
          // Backend return status 'error' with HTTP 200
          this.errorMessage = res.message || 'Login gagal.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        const serverMsg = err?.error?.message;
        if (err?.status === 0) {
          this.errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.';
        } else if (err?.status === 403 && serverMsg?.includes('belum diverifikasi')) {
          this.errorMessage = serverMsg;
          this.isUnverified = true;
        } else if (err?.status === 401 || err?.status === 403 || serverMsg) {
          this.errorMessage = serverMsg || 'Email atau password salah.';
        } else {
          this.errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        }
      }
    });
  }

  resendEmail(): void {
    if (!this.email) return;

    this.isResending = true;
    this.auth.resendVerificationEmail(this.email).subscribe({
      next: async (res) => {
        this.isResending = false;
        await this.showToast('Link verifikasi berhasil dikirim ulang!', 'success');
      },
      error: async (err) => {
        this.isResending = false;
        const serverMsg = err?.error?.message || 'Gagal mengirim ulang email.';
        await this.showToast(serverMsg, 'danger');
      }
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
