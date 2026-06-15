import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService, ResetPasswordPayload } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage {

  email = '';
  token = '';
  password = '';
  passwordConfirmation = '';

  isLoading = false;
  error = '';
  validationErrors: { [key: string]: string } = {};

  // Variabel buat ngecek mana input yang lagi di-klik (fokus)
  emailFocused = false;
  tokenFocused = false;
  passFocused = false;
  passConfFocused = false;

  // Buat nge-toggle tombol mata (lihat password)
  showPassword = false;
  showPasswordConf = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastController
  ) {}

  onSubmit(): void {
    this.error = '';
    this.validationErrors = {};

    // Validasi di sisi frontend dlu (biar ga nyampah nembak API padahal form kosong)
    if (!this.email.trim())              { this.validationErrors['email'] = 'Email wajib diisi.'; }
    if (!this.token.trim())              { this.validationErrors['token'] = 'Token wajib diisi.'; }
    if (!this.password)                  { this.validationErrors['password'] = 'Password wajib diisi.'; }
    if (this.password.length < 8)        { this.validationErrors['password'] = 'Password minimal 8 karakter.'; }
    if (this.password !== this.passwordConfirmation) {
      this.validationErrors['password_confirmation'] = 'Konfirmasi password tidak cocok.';
    }

    if (Object.keys(this.validationErrors).length > 0) return;

    this.isLoading = true;

    const payload: ResetPasswordPayload = {
      email: this.email.trim(),
      token: this.token.trim(),
      password: this.password,
      password_confirmation: this.passwordConfirmation
    };

    this.authService.resetPassword(payload).subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.status) {
          const t = await this.toast.create({
            message: 'Password berhasil direset! Silakan login kembali.',
            duration: 3000,
            color: 'success',
            position: 'top',
            icon: 'checkmark-circle-outline'
          });
          await t.present();
          this.router.navigate(['/login'], { replaceUrl: true });
        } else {
          this.error = res.message || 'Gagal mereset password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Tangkep error dari backend kalo validasinya gagal di server
        const backendErrors = err?.error?.data;
        if (backendErrors && typeof backendErrors === 'object') {
          for (const key of Object.keys(backendErrors)) {
            this.validationErrors[key] = backendErrors[key][0];
          }
        } else {
          this.error = err?.error?.message || 'Terjadi kesalahan. Periksa token Anda dan coba lagi.';
        }
      }
    });
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  goForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  get isFormInvalid(): boolean {
    return !this.email.trim() || !this.token.trim() || !this.password || !this.passwordConfirmation;
  }
}
