import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { PhotoService } from './photo.service';
import { VendorSubmission, SubmissionForm } from '../models/user.model';

/**
 * VendorSubmissionService — komunikasi dengan API pengajuan tender vendor.
 */
@Injectable({ providedIn: 'root' })
export class VendorSubmissionService {

  private baseUrl = `${environment.apiUrl}/vendor/submissions`;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private photoService: PhotoService
  ) {}

  /**
   * Buat pengajuan baru.
   * Foto dikirim sebagai File (Blob) via FormData.
   * @param data isian form pengajuan
   * @param photos array base64 string foto
   */
  async createSubmission(data: SubmissionForm, photos: string[]): Promise<any> {
    const token = await this.storage.getToken();

    const formData = new FormData();
    formData.append('nama_barang',    data.nama_barang);
    formData.append('deskripsi',      data.deskripsi);
    formData.append('spesifikasi',    data.spesifikasi ?? '');
    formData.append('kategori',       data.kategori ?? '');
    formData.append('estimasi_harga', String(data.estimasi_harga ?? ''));
    formData.append('catatan',        data.catatan ?? '');

    photos.forEach((base64, index) => {
      const blob = this.photoService.base64ToBlob(base64, 'image/jpeg');
      formData.append('photos[]', blob, `photo_${index}.jpg`);
    });

    return this.http.post(this.baseUrl, formData, {
      headers: { Authorization: `Bearer ${token}` },
    }).toPromise();
  }

  /**
   * Ambil riwayat pengajuan vendor yang sedang login.
   */
  async getMySubmissions(): Promise<VendorSubmission[]> {
    const token = await this.storage.getToken();
    const res: any = await this.http.get(this.baseUrl, {
      headers: { Authorization: `Bearer ${token}` },
    }).toPromise();
    return res?.data ?? [];
  }

  /**
   * Ambil detail satu pengajuan berdasarkan id.
   */
  async getSubmissionDetail(id: number): Promise<VendorSubmission> {
    const token = await this.storage.getToken();
    const res: any = await this.http.get(`${this.baseUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).toPromise();
    return res?.data;
  }
}
