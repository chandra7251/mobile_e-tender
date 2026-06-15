import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { PhotoService } from './photo.service';
import { VendorSubmission, SubmissionForm } from '../models/user.model';

/**
 * Service buat ngurusin pengajuan tender dari sisi vendor.
 * Nembak ke API backend pake service ini.
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
   * Fungsi buat nge-submit pengajuan tender baru.
   * Fotonya kita kirim pake format Blob lewat FormData biar gampang diterima backend.
   * @param data form isian dari UI
   * @param photos array string base64 fotonya
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

  // Fungsi buat ngambil riwayat pengajuan tender si vendor yang lagi login
  async getMySubmissions(): Promise<VendorSubmission[]> {
    const token = await this.storage.getToken();
    const res: any = await this.http.get(this.baseUrl, {
      headers: { Authorization: `Bearer ${token}` },
    }).toPromise();
    return res?.data ?? [];
  }

  // Fungsi buat liat detail lengkap dari satu pengajuan tender
  async getSubmissionDetail(id: number): Promise<VendorSubmission> {
    const token = await this.storage.getToken();
    const res: any = await this.http.get(`${this.baseUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).toPromise();
    return res?.data;
  }
}
