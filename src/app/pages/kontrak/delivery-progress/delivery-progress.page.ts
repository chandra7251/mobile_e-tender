import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController, AlertController, Platform } from '@ionic/angular';
import { ContractService } from '../../../core/services/contract.service';
import { ContractDelivery } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-delivery-progress',
  templateUrl: './delivery-progress.page.html',
  styleUrls: ['./delivery-progress.page.scss'],
})
export class DeliveryProgressPage implements OnInit {
  contractId!: number;
  deliveryId!: number;
  delivery: ContractDelivery | null = null;
  isLoading = false;
  isSubmitting = false;
  loadError = '';
  submitError = '';
  form!: FormGroup;
  private backButtonSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toast: ToastController,
    private alert: AlertController,
    private platform: Platform,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.contractId = +(this.route.snapshot.paramMap.get('contractId') || 0);
    this.deliveryId = +(this.route.snapshot.paramMap.get('deliveryId') || 0);
    this.form = this.fb.group({
      vendor_notes: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, () => this.goBack());
  }
  ionViewWillLeave() { this.backButtonSub?.unsubscribe(); }

  ionViewWillEnter(): void {
    this.contractId = +(this.route.snapshot.paramMap.get('contractId') || 0);
    this.deliveryId = +(this.route.snapshot.paramMap.get('deliveryId') || 0);
    this.loadDelivery();
  }

  loadDelivery(): void {
    this.isLoading = true;
    this.loadError = '';
    // Load via contract detail, filter delivery by id
    this.contractService.getContractDetail(this.contractId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === true && res.data?.deliveries) {
          this.delivery = res.data.deliveries.find((d: ContractDelivery) => d.id === this.deliveryId) || null;
          if (this.delivery && (this.delivery.status === 'in_progress' || this.delivery.status === 'delivered' || this.delivery.status === 'verified')) {
            this.form.patchValue({ vendor_notes: this.delivery.vendor_notes || '' });
          }
        } else {
          this.loadError = 'Data delivery tidak ditemukan.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = err?.error?.message || 'Gagal memuat data delivery.';
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const al = await this.alert.create({
      header: 'Konfirmasi Submit Progress',
      message: 'Pastikan informasi progress yang Anda kirim sudah benar. Lanjutkan?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Ya, Submit', handler: () => { this.doSubmit(); } }
      ]
    });
    await al.present();
  }

  private doSubmit(): void {
    this.isSubmitting = true;
    this.submitError  = '';
    this.contractService.submitDelivery(this.contractId, this.deliveryId, this.form.value).subscribe({
      next: async (res) => {
        this.isSubmitting = false;
        if (res.status === true) {
          await this.showToast('Progress pengiriman berhasil dikirim!', 'success');
          this.loadDelivery();
        } else {
          this.submitError = res.message || 'Gagal submit progress.';
        }
      },
      error: async (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Gagal submit progress.';
      }
    });
  }

  get canSubmit(): boolean {
    return this.delivery?.status === 'scheduled' || this.delivery?.status === 'in_progress';
  }
  get isAlreadySubmitted(): boolean {
    return this.delivery?.status === 'delivered';
  }
  get isVerified(): boolean {
    return this.delivery?.status === 'verified';
  }

  formatDate(d: string | null): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  formatDateTime(d: string | null): string {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  getStatusColor(s: string): string {
    return s === 'verified' ? 'success' : s === 'delivered' ? 'warning' : s === 'in_progress' ? 'primary' : s === 'overdue' ? 'danger' : 'medium';
  }
  getStatusLabel(s: string): string {
    return s === 'verified' ? 'Terverifikasi' : s === 'delivered' ? 'Menunggu Verifikasi' : s === 'in_progress' ? 'Sedang Proses' : s === 'overdue' ? 'Terlambat' : 'Terjadwal';
  }
  goBack(): void { this.navCtrl.navigateBack(['/tabs/kontrak', this.contractId]); }
  private async showToast(msg: string, color: string): Promise<void> {
    const t = await this.toast.create({ message: msg, duration: 3000, color, position: 'top' });
    await t.present();
  }
}
