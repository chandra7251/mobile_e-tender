import { Component, OnInit } from '@angular/core';
import { ToastController, Platform } from '@ionic/angular';
import { VendorService } from '../../core/services/vendor.service';
import { VendorDocument, DocumentType } from '../../core/models/user.model';
import { Subscription } from 'rxjs';

type AllowedType = 'legalitas' | 'izin_usaha' | 'dokumen_pendukung';

@Component({
  standalone: false,
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
})
export class DocumentsPage implements OnInit {

  // ── List ──────────────────────────────────────────────────────────────────
  documents: VendorDocument[] = [];
  isLoading = false;
  listError = '';

  // ── Paginasi ──────────────────────────────────────────────────────────────
  currentPage = 1;
  itemsPerPage = 7;

  // ── Upload form ───────────────────────────────────────────────────────────
  selectedType: AllowedType = 'legalitas';
  selectedFile: File | null = null;
  selectedFileName = '';
  isUploading = false;
  uploadError = '';
  showUploadForm = false;

  // ── Download state ────────────────────────────────────────────────────────
  downloadingId: number | null = null;

  readonly docTypes: { value: AllowedType; label: string }[] = [
    { value: 'legalitas',         label: 'Legalitas' },
    { value: 'izin_usaha',        label: 'Izin Usaha' },
    { value: 'dokumen_pendukung', label: 'Dokumen Pendukung' },
  ];

  vendorStatus = '';
  private backButtonSub?: Subscription;

  constructor(
    private vendorService: VendorService,
    private toast: ToastController,
    private platform: Platform
  ) {}

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, (processNextHandler) => {
      if (this.showUploadForm) {
        this.toggleUploadForm();
      } else {
        processNextHandler(); // Lanjut ke global handler di app.component.ts
      }
    });
  }

  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  ngOnInit(): void {} // Angular lifecycle — tidak dipakai karena ionViewWillEnter lebih andal di Ionic

  // Dipanggil setiap kali halaman tampil — termasuk saat user kembali dari halaman upload
  // Penting: Ionic meng-cache halaman, ngOnInit hanya dipanggil sekali
  ionViewWillEnter(): void {
    this.loadProfileAndDocuments();
  }

  // ── Load list ─────────────────────────────────────────────────────────────

  loadProfileAndDocuments(): void {
    this.isLoading = true;
    this.listError = '';
    
    // Ambil status profil vendor terlebih dahulu
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.vendorStatus = res.data.verification_status;
        }
        this.loadDocuments(false); // Lanjut load dokumen
      },
      error: () => {
        this.vendorStatus = 'pending';
        this.loadDocuments(false);
      }
    });
  }

  loadDocuments(setLoading = true): void {
    if (setLoading) {
      this.isLoading = true;
      this.listError = '';
    }

    this.vendorService.getDocuments().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === 'success' && res.data) {
          this.documents = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.listError = err?.error?.message || 'Gagal memuat daftar dokumen.';
      }
    });
  }

  doRefresh(event: any): void {
    this.vendorService.getDocuments().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) this.documents = res.data;
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  // ── File picker ───────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile     = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.uploadError      = '';
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  onUpload(): void {
    if (!this.selectedFile) {
      this.uploadError = 'Pilih file terlebih dahulu.';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    this.vendorService.uploadDocument(this.selectedType as DocumentType, this.selectedFile).subscribe({
      next: async (res) => {
        this.isUploading = false;
        if (res.status === 'success') {
          await this.showToast('Dokumen berhasil diupload!', 'success');
          this.resetForm();
          this.showUploadForm = false;
          this.loadDocuments();
        } else {
          this.uploadError = res.message || 'Upload gagal.';
        }
      },
      error: (err) => {
        this.isUploading = false;
        const errors = err?.error?.data;
        if (errors) {
          const firstKey = Object.keys(errors)[0];
          this.uploadError = errors[firstKey]?.[0] || 'Upload gagal.';
        } else {
          this.uploadError = err?.error?.message || 'Terjadi kesalahan saat upload.';
        }
      }
    });
  }

  // ── Download (authenticated — file tidak punya URL publik) ────────────────

  onDownload(doc: VendorDocument): void {
    if (this.downloadingId === doc.id) return; // debounce
    this.downloadingId = doc.id;

    this.vendorService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        this.downloadingId = null;
        // Buat URL object sementara dan trigger download / buka di tab baru
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.file_name; // nama file asli dari backend
        link.click();
        // Bersihkan URL object setelah delay singkat
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      error: async (err) => {
        this.downloadingId = null;
        const msg = err?.error?.message || 'Gagal mengunduh dokumen.';
        await this.showToast(msg, 'danger');
      }
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
    if (!this.showUploadForm) this.resetForm();
  }

  resetForm(): void {
    this.selectedFile     = null;
    this.selectedFileName = '';
    this.selectedType     = 'legalitas';
    this.uploadError      = '';
  }

  getTypeLabel(value: string): string {
    return this.docTypes.find(t => t.value === value)?.label ?? value;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default:         return 'warning';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default:         return 'Menunggu';
    }
  }

  getDocIcon(type: string): string {
    switch (type) {
      case 'legalitas':         return 'ribbon-outline';
      case 'izin_usaha':        return 'business-outline';
      case 'dokumen_pendukung': return 'document-attach-outline';
      default:                  return 'document-outline';
    }
  }

  isDownloading(docId: number): boolean {
    return this.downloadingId === docId;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // ── Paginasi Helpers ──────────────────────────────────────────────────────

  get paginatedDocuments(): VendorDocument[] {
    if (this.showUploadForm) {
      return this.documents.slice(0, 3); // Maksimal 3 dokumen saat form upload tampil
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.documents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.documents.length / this.itemsPerPage);
  }

  get pagesArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage = page;
    }
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }
}
