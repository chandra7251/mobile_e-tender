import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController, AlertController, Platform } from '@ionic/angular';
import { ComplaintService } from '../../../core/services/complaint.service';
import { TenderService } from '../../../core/services/tender.service';
import { Complaint, Tender } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-sanggahan',
  templateUrl: './sanggahan.page.html',
  styleUrls: ['./sanggahan.page.scss'],
})
export class SanggahanPage implements OnInit {
  tenderId!: number;
  tender: Tender | null = null;
  myComplaints: Complaint[] = [];
  isLoading = false;
  isSubmitting = false;
  loadError = '';
  submitError = '';
  showForm = false;
  form!: FormGroup;
  private backButtonSub?: Subscription;

  typeOptions = [
    { value: 'sanggahan', label: 'Sanggahan', desc: 'Keberatan terhadap hasil evaluasi / pemenang tender' },
    { value: 'banding',   label: 'Banding',   desc: 'Banding atas keputusan sanggahan yang ditolak' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toast: ToastController,
    private alert: AlertController,
    private platform: Platform,
    private complaintService: ComplaintService,
    private tenderService: TenderService,
  ) {}

  ngOnInit(): void {
    this.tenderId = this.extractTenderId();
    this.form = this.fb.group({
      type:   ['sanggahan', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(2000)]],
    });
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, () => this.goBack());
  }
  ionViewWillLeave() { this.backButtonSub?.unsubscribe(); }

  ionViewWillEnter(): void {
    this.tenderId = this.extractTenderId();
    this.loadAll();
  }

  private extractTenderId(): number {
    let cur: ActivatedRoute | null = this.route;
    while (cur) {
      const id = cur.snapshot.paramMap.get('id');
      if (id && +id > 0) return +id;
      cur = cur.parent;
    }
    const m = window.location.pathname.match(/\/tenders\/(\d+)\/sanggahan/);
    return m ? +m[1] : 0;
  }

  loadAll(): void {
    this.isLoading  = true;
    this.loadError  = '';
    // Load tender detail + my complaints in parallel
    this.tenderService.getTenderDetail(this.tenderId).subscribe({
      next: (res) => {
        if (res.status === true && res.data) this.tender = res.data;
      },
      error: () => {}
    });
    this.complaintService.getMyComplaints().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === true && res.data) {
          // Filter hanya complaint untuk tender ini
          this.myComplaints = res.data.filter((c: Complaint) => c.tender_id === this.tenderId);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = err?.error?.message || 'Gagal memuat data sanggahan.';
      }
    });
  }

  doRefresh(event: any): void {
    this.loadAll();
    setTimeout(() => event.target.complete(), 1500);
  }

  toggleForm(): void { this.showForm = !this.showForm; }

  get reasonLength(): number { return (this.form.get('reason')?.value || '').length; }

  get hasPendingSanggahan(): boolean {
    return this.myComplaints.some(c => c.type === 'sanggahan' && c.status === 'pending');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.hasPendingSanggahan) {
      await this.showToast('Anda sudah memiliki sanggahan yang sedang diproses.', 'warning');
      return;
    }
    const al = await this.alert.create({
      header: 'Konfirmasi',
      message: 'Yakin ingin mengajukan sanggahan ini? Pastikan alasan sudah lengkap dan jelas.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Ya, Ajukan',
          handler: () => { this.doSubmit(); }
        }
      ]
    });
    await al.present();
  }

  private doSubmit(): void {
    this.isSubmitting = true;
    this.submitError  = '';
    this.complaintService.submitComplaint(this.tenderId, this.form.value).subscribe({
      next: async (res) => {
        this.isSubmitting = false;
        if (res.status === true) {
          await this.showToast('Sanggahan berhasil diajukan!', 'success');
          this.form.reset({ type: 'sanggahan', reason: '' });
          this.showForm = false;
          this.loadAll();
        } else {
          this.submitError = res.message || 'Gagal mengajukan sanggahan.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const errors = err?.error?.errors;
        if (errors) {
          const first = Object.values(errors)[0] as string[];
          this.submitError = first?.[0] || err?.error?.message || 'Gagal mengajukan sanggahan.';
        } else {
          this.submitError = err?.error?.message || 'Gagal mengajukan sanggahan.';
        }
      }
    });
  }

  getStatusColor(s: string): string {
    return s === 'accepted' ? 'success' : s === 'rejected' ? 'danger' : 'warning';
  }
  getStatusLabel(s: string): string {
    return s === 'accepted' ? 'Diterima' : s === 'rejected' ? 'Ditolak' : 'Menunggu';
  }
  getTypeLabel(t: string): string {
    return t === 'sanggahan' ? 'Sanggahan' : 'Banding';
  }
  formatDate(d: string | null): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  goBack(): void {
    this.navCtrl.navigateBack(['/tabs/tenders', this.tenderId]);
  }
  private async showToast(msg: string, color: string): Promise<void> {
    const t = await this.toast.create({ message: msg, duration: 3000, color, position: 'top' });
    await t.present();
  }
}
