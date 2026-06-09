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
    unread_count?: number; // Opsional, jika backend mengirimkan total unread
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // environment.apiUrl sudah '/api' (via proxy) — jangan tambah '/api' lagi
  private apiUrl = environment.apiUrl + '/notifications';

  // State global untuk badge lonceng
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Ambil daftar notifikasi dari backend (dengan pagination)
   */
  getNotifications(page: number = 1): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}?page=${page}`).pipe(
      tap(res => {
        if (res.status === 'success') {
          // Gunakan unread_count dari backend jika tersedia, fallback ke hitung manual
          if (res.data.unread_count !== undefined) {
            this.unreadCountSubject.next(res.data.unread_count);
          } else if (page === 1) {
            // Hanya update dari halaman pertama agar tidak reset saat infinite scroll
            const unread = res.data.data.filter(n => n.read_at === null).length;
            this.unreadCountSubject.next(unread);
          }
        }
      })
    );
  }

  /**
   * Tandai satu notifikasi sudah dibaca
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
   * Tandai semua notifikasi sudah dibaca
   */
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  /**
   * Update badge count secara manual (misal setelah login)
   */
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
