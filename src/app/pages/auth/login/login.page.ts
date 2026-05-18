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
        if (res.status) {
          await this.showToast('Login berhasil!', 'success');
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        } else {
          this.errorMessage = res.message || 'Login gagal.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Terjadi kesalahan. Coba lagi.';
      }
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
