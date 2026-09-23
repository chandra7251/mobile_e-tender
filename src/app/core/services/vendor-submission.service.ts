import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { PhotoService } from './photo.service';
import { VendorSubmission, SubmissionForm } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class VendorSubmissionService {
  private baseUrl = `${environment.apiUrl}/vendor/submissions`;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private photoService: PhotoService
  ) {}

  async createSubmission(data: SubmissionForm, photos: string[]): Promise<any> {
    const token = await this.storage.getToken();
    const formData = new FormData();
    formData.append('nama_barang', data.nama_barang);
    formData.append('deskripsi', data.deskripsi);
    if (data.spesifikasi) formData.append('spesifikasi', data.spesifikasi);
    if (data.kategori) formData.append('kategori', data.kategori);
    if (data.estimasi_harga !== undefined && data.estimasi_harga !== null && String(data.estimasi_harga) !== '') {
      formData.append('estimasi_harga', String(data.estimasi_harga));
    }
    if (data.catatan) formData.append('catatan', data.catatan);

    photos.forEach((base64, index) => {
      const blob = this.photoService.base64ToBlob(base64, 'image/jpeg');
      formData.append('photos[]', blob, `photo_${index}.jpg`);
    });

    return firstValueFrom(
      this.http.post(this.baseUrl, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  }

  async getMySubmissions(): Promise<VendorSubmission[]> {
    const token = await this.storage.getToken();
    const res: any = await firstValueFrom(
      this.http.get(this.baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return res?.data ?? [];
  }

  async getSubmissionDetail(id: number): Promise<VendorSubmission> {
    const token = await this.storage.getToken();
    const res: any = await firstValueFrom(
      this.http.get(`${this.baseUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return res?.data;
  }
}