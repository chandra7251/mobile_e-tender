import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { VendorService } from '../../core/services/vendor.service';
import { StorageService } from '../../core/services/storage.service';
import { VendorProfile, Tender, Announcement } from '../../core/models/user.model';
import { TenderService } from '../../core/services/tender.service';
import { ActivityService, ActivityLog } from '../../core/services/activity.service';
import { NotificationService } from '../../core/services/notification.service';
@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  vendorProfile: VendorProfile | null = null;
  openTenders: Tender[] = [];
  isLoadingTenders = false;
  unreadCount: number = 0;
  private unreadSub?: Subscription;
  myTendersCount = { bidding: 0, open: 0, aanwijzing: 0, finished: 0 };
  isLoadingMyTenders = false;
  biddingTenders: Tender[] = [];
  isLoadingBidding = false;
  countdowns: { [id: number]: string } = {};
  private timer: any;
  aanwijzings: (Announcement & { tenderTitle?: string })[] = [];
  isLoadingAanwijzing = false;
  activities: ActivityLog[] = [];
  constructor(
    private auth: AuthService,
    private vendorService: VendorService,
    private storage: StorageService,
    private router: Router,
    private toast: ToastController,
    private tenderService: TenderService,
    public activityService: ActivityService,
    private notificationService: NotificationService
  ) {}
  ionViewWillEnter(): void {
    this.loadProfile();
    this.loadOpenTenders();
    this.loadMyTenders();
    this.loadBiddingTenders();
    this.loadActivities();
    this.subscribeUnreadCount();
  }
  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.unreadSub?.unsubscribe();
  }
  private subscribeUnreadCount(): void {
    this.unreadSub?.unsubscribe();
    this.unreadSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.notificationService.getNotifications(1).subscribe();
  }
  private loadProfile(): void {
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.vendorProfile = res.data;
        }
      },
      error: (err) => {
        console.warn('[vendors/me] error', err?.status);
      }
    });
  }
  private loadOpenTenders(): void {
    this.isLoadingTenders = true;
    this.tenderService.getTenders({ status: 'open' }).subscribe({
      next: (res) => {
        this.isLoadingTenders = false;
        if (res.status === 'success' && res.data) {
          this.openTenders = res.data.slice(0, 5);
        }
      },
      error: () => {
        this.isLoadingTenders = false;
      }
    });
  }
  private loadMyTenders(): void {
    this.isLoadingMyTenders = true;
    this.vendorService.getMyTenders().subscribe({
      next: (res) => {
        this.isLoadingMyTenders = false;
        if (res.status === 'success' && res.data) {
          this.myTendersCount = {
            bidding: res.data.filter(t => t.status === 'bidding').length,
            open: res.data.filter(t => t.status === 'open').length,
            aanwijzing: res.data.filter(t => t.status === 'aanwijzing').length,
            finished: res.data.filter(t => t.status === 'finished').length
          };
          this.loadMyAnnouncements(res.data);
        }
      },
      error: () => this.isLoadingMyTenders = false
    });
  }
  private loadMyAnnouncements(tenders: Tender[]): void {
    this.isLoadingAanwijzing = true;
    this.aanwijzings = [];
    if (tenders.length === 0) {
      this.isLoadingAanwijzing = false;
      return;
    }
    const relevant = [
      ...tenders.filter(t => t.status === 'aanwijzing'),
      ...tenders.filter(t => t.status !== 'aanwijzing'),
    ].slice(0, 5);
    let loadedCount = 0;
    relevant.forEach(t => {
      this.tenderService.getAnnouncements(t.id).subscribe({
        next: (res) => {
          if (res.status === 'success' && res.data && res.data.length > 0) {
            const mapped = res.data.map(a => ({ ...a, tenderTitle: t.title } as any));
            this.aanwijzings = [...this.aanwijzings, ...mapped];
          }
          loadedCount++;
          if (loadedCount === relevant.length) {
            this.finalizeAnnouncements();
          }
        },
        error: () => {
          loadedCount++;
          if (loadedCount === relevant.length) {
            this.finalizeAnnouncements();
          }
        }
      });
    });
  }
  private finalizeAnnouncements(): void {
    this.aanwijzings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    this.aanwijzings = this.aanwijzings.slice(0, 5);
    this.isLoadingAanwijzing = false;
  }
  private loadActivities(): void {
    this.activities = this.activityService.getActivities().slice(0, 5);
  }
  private loadBiddingTenders(): void {
    this.isLoadingBidding = true;
    this.tenderService.getTenders({ status: 'bidding' }).subscribe({
      next: (res) => {
        this.isLoadingBidding = false;
        if (res.status === 'success' && res.data) {
          this.biddingTenders = res.data;
          this.startCountdown();
        }
      },
      error: () => this.isLoadingBidding = false
    });
  }
  private startCountdown(): void {
    if (this.timer) clearInterval(this.timer);
    this.updateCountdowns(); 
    this.timer = setInterval(() => {
      this.updateCountdowns();
    }, 1000);
  }
  private updateCountdowns(): void {
    const now = new Date().getTime();
    this.biddingTenders = this.biddingTenders.filter(t => {
      const endDateString = t.bidding_end || t.end_date;
      if (!endDateString) return false;
      const end = new Date(endDateString).getTime();
      const diff = end - now;
      if (diff <= 0) {
        return false; 
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        this.countdowns[t.id] = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        return true;
      }
    });
  }
  private pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }
  onLogout(): void {
    this.auth.logout().subscribe({
      next: async () => {
        await this.showToast('Berhasil logout.', 'medium');
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async () => {
        await this.storage.clearAll();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
  get companyName(): string {
    return this.vendorProfile?.company_name ?? '';
  }
  get vendorStatus(): string {
    return this.vendorProfile?.verification_status ?? '';
  }
  goAjukanTender(): void {
    this.router.navigate(['/tabs/pengajuan-tender'], { queryParams: { openForm: 'true', from: 'home' } });
  }
  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
