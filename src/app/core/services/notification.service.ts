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
  isDeleting?: boolean;
}
export interface NotificationResponse {
  status: boolean;
  data: {
    current_page: number;
    data: NotificationItem[];
    last_page: number;
    total: number;
    unread_count?: number; 
  };
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl + '/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  constructor(private http: HttpClient) {}
  getNotifications(page: number = 1): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}?page=${page}`).pipe(
      tap(res => {
        if (res.status === true) {
          if (res.data.unread_count !== undefined) {
            this.unreadCountSubject.next(res.data.unread_count);
          } else if (page === 1) {
            const unread = res.data.data.filter(n => n.read_at === null).length;
            this.unreadCountSubject.next(unread);
          }
        }
      })
    );
  }
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
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/all`).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }
}
