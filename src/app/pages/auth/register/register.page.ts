import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService, RegisterPayload } from '../../../core/services/auth.service';
import { ActivityService } from '../../../core/services/activity.service';
@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  form: RegisterPayload = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    phone: '',
    address: ''
  };
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastController,
    private activityService: ActivityService
  ) {}
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  onRegister(): void {
    if (this.form.password !== this.form.password_confirmation) {
      this.errorMessage = 'Password dan konfirmasi tidak cocok.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.auth.register(this.form).subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.status === true) {
          this.activityService.log('Mendaftar akun ZETA', 'person-add-outline');
          await this.showToast('Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.', 'success');
          this.router.navigate(['/login'], { replaceUrl: true });
        } else {
          this.errorMessage = res.message || 'Registrasi gagal.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errors = err?.error?.errors;
        if (errors && Object.keys(errors).length > 0) {
          const firstKey = Object.keys(errors)[0];
          this.errorMessage = errors[firstKey]?.[0] || 'Terjadi kesalahan.';
        } else {
          this.errorMessage = err?.error?.message || 'Terjadi kesalahan server.';
        }
      }
    });
  }
  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
