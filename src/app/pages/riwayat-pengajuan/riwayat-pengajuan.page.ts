import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { VendorSubmissionService } from '../../core/services/vendor-submission.service';
import { VendorSubmission } from '../../core/models/user.model';
@Component({
  selector: 'app-riwayat-pengajuan',
  templateUrl: './riwayat-pengajuan.page.html',
  styleUrls: ['./riwayat-pengajuan.page.scss'],
  standalone: false,
})
export class RiwayatPengajuanPage implements OnInit {
  submissions: VendorSubmission[] = [];
  isLoading = true;
  hasError = false;
  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private submissionService: VendorSubmissionService,
  ) {}
  ngOnInit(): void {
    this.loadSubmissions();
  }
  async loadSubmissions(event?: any): Promise<void> {
    this.isLoading = !event;
    this.hasError  = false;
    try {
      this.submissions = await this.submissionService.getMySubmissions();
    } catch (err: any) {
      this.hasError = true;
      if (!event) {
        const msg = err?.error?.message || 'Gagal memuat riwayat pengajuan.';
        const alert = await this.alertCtrl.create({
          header: 'Gagal',
          message: msg,
          buttons: ['OK'],
        });
        await alert.present();
      }
    } finally {
      this.isLoading = false;
      if (event) {
        event.target.complete();
      }
    }
  }
  formatCurrency(value: number | null): string {
    if (value == null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  }
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending:  'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return map[status] ?? 'medium';
  }
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending:  'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
    };
    return map[status] ?? status;
  }
  goToPengajuan(): void {
    this.router.navigate(['/vendor/pengajuan']);
  }
  goBack(): void {
    this.router.navigate(['/tabs/home']);
  }
}
