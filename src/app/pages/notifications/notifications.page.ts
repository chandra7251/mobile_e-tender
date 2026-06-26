import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll, ToastController } from '@ionic/angular';
import { NotificationService, NotificationItem } from '../../core/services/notification.service';
@Component({
  standalone: false,
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  notifications: NotificationItem[] = [];
  currentPage: number = 1;
  lastPage: number = 1;
  isLoading: boolean = true;
  hasError: boolean = false;
  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}
  ngOnInit() {
    this.fetchNotifications(1);
  }
  fetchNotifications(page: number, event?: any) {
    if (page === 1) {
      this.isLoading = true;
      this.hasError = false;
    }
    this.notificationService.getNotifications(page).subscribe({
      next: (res) => {
        if (res.status === true) {
          const incoming = res.data.data;
          if (page === 1) {
            this.notifications = incoming;
          } else {
            this.notifications = [...this.notifications, ...incoming];
          }
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
        }
        this.isLoading = false;
        this.completeEvent(event, page);
      },
      error: (err) => {
        console.error('[NotificationsPage] fetch error', err);
        this.isLoading = false;
        this.hasError = page === 1; 
        this.completeEvent(event, page);
      }
    });
  }
  doRefresh(event: any) {
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    this.fetchNotifications(1, event);
  }
  loadData(event: any) {
    if (this.currentPage < this.lastPage) {
      this.fetchNotifications(this.currentPage + 1, event);
    } else {
      event.target.complete();
      event.target.disabled = true;
    }
  }
  onNotificationClick(notif: NotificationItem) {
    if (!notif.read_at) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          notif.read_at = new Date().toISOString();
        },
        error: (err) => {
          console.error('[NotificationsPage] markAsRead error', err);
        }
      });
    }
    if (notif.data?.tender_id) {
      this.router.navigate(['/tabs/tenders', notif.data.tender_id]);
    }
  }
  markAllRead() {
    const hasUnread = this.notifications.some(n => !n.read_at);
    if (!hasUnread) return;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.notifications = this.notifications.map(n => ({ ...n, read_at: n.read_at ?? now }));
        this.showToast('Semua notifikasi ditandai sudah dibaca.', 'success');
      },
      error: () => this.showToast('Gagal menandai semua notifikasi.', 'danger')
    });
  }
  deleteNotification(notif: any) { 
    notif.isDeleting = true;
    setTimeout(() => {
      const isUnread = !notif.read_at;
      this.notifications = this.notifications.filter(n => n.id !== notif.id);
      if (isUnread) {
        const currentCount = this.notifications.filter(n => !n.read_at).length;
        this.notificationService.updateUnreadCount(currentCount);
      }
      this.notificationService.deleteNotification(notif.id).subscribe({
        next: () => {
        },
        error: (err) => {
          console.error('Gagal hapus notifikasi di backend', err);
        }
      });
    }, 300);
  }
  deleteAllNotifications() {
    this.notifications.forEach(n => (n as any).isDeleting = true);
    this.notificationService.updateUnreadCount(0);
    setTimeout(() => {
      this.notificationService.deleteAllNotifications().subscribe({
        next: () => {
        },
        error: (err) => {
          console.error('Gagal hapus semua notifikasi', err);
        }
      });
      this.notifications = [];
      this.showToast('Semua notifikasi berhasil dihapus.', 'success');
    }, 300);
  }
  private completeEvent(event: any, page: number) {
    if (!event) return;
    event.target.complete();
    if (event.type === 'ionInfinite' && this.currentPage >= this.lastPage) {
      event.target.disabled = true;
    }
  }
  private async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
