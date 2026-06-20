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

  /**
   * Ambil notifikasi dari backend, support refresh & infinite scroll
   */
  fetchNotifications(page: number, event?: any) {
    if (page === 1) {
      this.isLoading = true;
      this.hasError = false;
    }

    this.notificationService.getNotifications(page).subscribe({
      next: (res) => {
        if (res.status === 'success') {
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
        this.hasError = page === 1; // Tampilkan error state hanya saat halaman pertama
        this.completeEvent(event, page);
      }
    });
  }

  /** Tarik ke bawah untuk refresh */
  doRefresh(event: any) {
    // Re-enable infinite scroll jika sempat di-disable
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    this.fetchNotifications(1, event);
  }

  /** Scroll ke bawah: muat halaman berikutnya */
  loadData(event: any) {
    if (this.currentPage < this.lastPage) {
      this.fetchNotifications(this.currentPage + 1, event);
    } else {
      event.target.complete();
      event.target.disabled = true;
    }
  }

  /**
   * Klik item notifikasi → tandai sudah dibaca + opsional navigasi
   */
  onNotificationClick(notif: NotificationItem) {
    if (!notif.read_at) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          // Update UI secara lokal tanpa reload seluruh list
          notif.read_at = new Date().toISOString();
        },
        error: (err) => {
          console.error('[NotificationsPage] markAsRead error', err);
        }
      });
    }

    // Navigasi ke detail tender jika data tersedia
    if (notif.data?.tender_id) {
      this.router.navigate(['/tabs/tenders', notif.data.tender_id]);
    }
  }

  /** Tandai semua notifikasi dibaca sekaligus */
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

  /**
   * Hapus notifikasi dengan cara swipe-to-delete
   */
  deleteNotification(notif: NotificationItem) {
    // Tandai sedang dihapus untuk trigger animasi CSS
    notif.isDeleting = true;

    // Tunggu animasi CSS selesai (300ms) baru hapus dari array
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== notif.id);
      
      // Tembak backend untuk hapus secara permanen
      this.notificationService.deleteNotification(notif.id).subscribe({
        next: () => {
          // Biarkan kosong, atau update badge unread kalo notif yang dihapus belum dibaca
          if (!notif.read_at) {
            const currentCount = this.notifications.filter(n => !n.read_at).length;
            this.notificationService.updateUnreadCount(currentCount);
          }
        },
        error: (err) => {
          console.error('Gagal hapus notifikasi di backend', err);
          // Gagal hapus di backend biarkan saja (silent error), karena ini optimistic UI
        }
      });
    }, 300);
  }

  /** Helper menyelesaikan event (refresher / infinite scroll) */
  private completeEvent(event: any, page: number) {
    if (!event) return;
    event.target.complete();
    // Disable infinite scroll jika sudah halaman terakhir
    if (event.type === 'ionInfinite' && this.currentPage >= this.lastPage) {
      event.target.disabled = true;
    }
  }

  private async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
