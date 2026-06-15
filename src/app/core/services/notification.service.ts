import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface NotificationData {
  tender_id: number;
  tender_title: string;
  old_status: string;
  new_status: string;
  message: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  status: string;
  data: {
    current_page: number;
    data: NotificationItem[];
    last_page: number;
    total: number;
    unread_count?: number; // Opsional sih, cuma kepake kalo dari backend ngirim datanya
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // environment.apiUrl sudah '/api' (via proxy) — jangan tambah '/api' lagi
  private apiUrl = environment.apiUrl + '/notifications';

  // State global buat nyimpen angka di badge lonceng (icon notif)
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Ambil daftar notifikasi dari backend.
   * Udah support pagination juga biar ga ngelag kalo datanya banyak.
   */
  getNotifications(page: number = 1): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}?page=${page}`).pipe(
      tap(res => {
        if (res.status === 'success') {
          // Pake angka unread_count dari backend kalo ada, kalo ngga ya kita itung manual aja
          if (res.data.unread_count !== undefined) {
            this.unreadCountSubject.next(res.data.unread_count);
          } else if (page === 1) {
            // Diupdate dari page 1 aja, biar ga kereset aneh pas lagi scroll-scroll nyari data lama
            const unread = res.data.data.filter(n => n.read_at === null).length;
            this.unreadCountSubject.next(unread);
          }
        }
      })
    );
  }

  /**
   * Fungsi buat nandain satu notif kalo udah dibaca sama user
   */
  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCountSubject.value;
        if (current > 0) {
          this.unreadCountSubject.next(current - 1);
        }
      })
    );
  }

  /**
   * Fungsi sapu jagat buat nandain semua notif udah dibaca sekaligus
   */
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  /**
   * Fungsi manual buat nembak angka ke badge (biasanya dipake pas abis login)
   */
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
