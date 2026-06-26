import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { VendorService } from '../../core/services/vendor.service';
import { ActivityService } from '../../core/services/activity.service';
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
  documents: VendorDocument[] = [];
  isLoading = false;
  listError = '';
  currentPage = 1;
  itemsPerPage = 7;
  selectedType: AllowedType = 'legalitas';
  selectedFile: File | null = null;
  selectedFileName = '';
  isUploading = false;
  uploadError = '';
  showUploadForm = false;
  downloadingId: number | null = null;
  readonly docTypes: { value: AllowedType; label: string }[] = [
    { value: 'legalitas',         label: 'Legalitas' },
    { value: 'izin_usaha',        label: 'Izin Usaha' },
    { value: 'dokumen_pendukung', label: 'Dokumen Pendukung' },
  ];
  vendorStatus = '';
  private backButtonSub?: Subscription;
  private previousPage: string | null = null;
  private openedFromQuickAction = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private toast: ToastController,
    private platform: Platform,
    private navCtrl: NavController,
    private activityService: ActivityService
  ) {}
  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, (processNextHandler) => {
      this.goBack();
    });
  }
  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }
  ngOnInit(): void {}
  ionViewWillEnter(): void {
    this.loadProfileAndDocuments();
    const from = this.route.snapshot.queryParamMap.get('from');
    const openForm = this.route.snapshot.queryParamMap.get('openForm');
    if (from === 'home') {
      this.previousPage = '/tabs/home';
    } else {
      this.previousPage = '/tabs/profile'; 
    }
    if (openForm === 'true') {
      this.showUploadForm = true;
      this.openedFromQuickAction = true;
    }
    if (openForm === 'true' || from === 'home') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }
  loadProfileAndDocuments(): void {
    this.isLoading = true;
    this.listError = '';
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        if (res.status === true && res.data) {
          this.vendorStatus = res.data.verification_status;
        }
        this.loadDocuments(false); 
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
        if (res.status === true && res.data) {
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
        if (res.status === true && res.data) this.documents = res.data;
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile     = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.uploadError      = '';
    }
  }
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
        if (res.status === true) {
          this.activityService.log(`Berhasil mengunggah dokumen ${this.selectedType}`, 'cloud-upload-outline');
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
  onDownload(doc: VendorDocument): void {
    if (this.downloadingId === doc.id) return; 
    this.downloadingId = doc.id;
    this.vendorService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        this.downloadingId = null;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.file_name; 
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      error: async (err) => {
        this.downloadingId = null;
        const msg = err?.error?.message || 'Gagal mengunduh dokumen.';
        await this.showToast(msg, 'danger');
      }
    });
  }
  goBack(): void {
    if (this.showUploadForm) {
      if (this.openedFromQuickAction && this.previousPage === '/tabs/home') {
        this.showUploadForm = false;
        this.openedFromQuickAction = false;
        this.navCtrl.navigateBack('/tabs/home');
      } else {
        this.toggleUploadForm();
      }
    } else {
      this.navCtrl.navigateBack(this.previousPage || '/tabs/profile');
    }
  }
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
  get paginatedDocuments(): VendorDocument[] {
    if (this.showUploadForm) {
      return this.documents.slice(0, 3); 
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
