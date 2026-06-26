import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class FcmService {
  constructor(private api: ApiService) {}

  /** Simpan FCM token ke server setelah login */
  registerToken(fcmToken: string): Observable<ApiResponse<null>> {
    return this.api.post<null>('device/fcm-token', { fcm_token: fcmToken });
  }

  /** Hapus FCM token dari server saat logout */
  unregisterToken(): Observable<ApiResponse<null>> {
    return this.api.delete<null>('device/fcm-token');
  }
}
