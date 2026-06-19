import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { TenderService } from '../../../core/services/tender.service';
import { Winner, TenderResult } from '../../../core/models/user.model';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  tenderId!: number;

  winner: Winner | null = null;
  tenderResult: TenderResult | null = null;

  isLoading = false;
  winnerError = '';
  resultError = '';

  private backButtonSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,    // Ionic-aware back nav — respects tab stack
    private tenderService: TenderService,
    private platform: Platform
  ) {}

  ngOnInit(): void {
    // Extract ID pertama kali saat komponen dibuat
    this.tenderId = this.extractTenderId();
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, (processNextHandler) => {
      this.goBack();
    });
  }

  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  // ionViewWillEnter dipanggil SETIAP KALI halaman ditampilkan, termasuk saat Ionic cache aktif.
  // Wajib ada agar tender ID selalu fresh saat navigasi antar result halaman berbeda.
  ionViewWillEnter(): void {
    // Re-extract ID setiap kali halaman masuk — cegah ID stale dari cache Ionic
    this.tenderId = this.extractTenderId();

    if (!this.tenderId) {
      this.winnerError = 'ID tender tidak valid.';
      return;
    }
    this.loadAll();
  }

  // Helper: traverse semua parent ActivatedRoute hingga menemukan param 'id'
  // Diperlukan karena halaman ini bisa di-nested di dalam route tender/:id/result
  private extractTenderId(): number {
    // Coba dari paramMap langsung
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const idParam = currentRoute.snapshot.paramMap.get('id');
      if (idParam && +idParam > 0) return +idParam;
      currentRoute = currentRoute.parent;
    }

    // Fallback: regex dari URL — /tenders/{id}/result
    const match = window.location.pathname.match(/\/tenders\/(\d+)\/result/);
    if (match?.[1] && +match[1] > 0) return +match[1];

    return 0;
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadAll(): void {
    this.isLoading = true;
    this.winnerError = '';
    this.resultError = '';

    // Reset data lama agar tidak menampilkan data tender sebelumnya saat loading
    this.winner = null;
    this.tenderResult = null;

    const winner$ = this.tenderService.getWinner(this.tenderId).pipe(
      catchError(err => {
        this.winnerError = err?.error?.message || '';
        return of(null);
      })
    );

    const result$ = this.tenderService.getTenderResult(this.tenderId).pipe(
      catchError(err => {
        this.resultError = err?.error?.message || '';
        return of(null);
      })
    );

    // Jalankan keduanya paralel — hemat waktu load dibanding sequential
    forkJoin([winner$, result$]).subscribe(([winnerRes, resultRes]) => {
      this.isLoading = false;

      if (winnerRes?.status === 'success' && winnerRes?.data) {
        this.winner = winnerRes.data;
      }

      if (resultRes?.status === 'success' && resultRes?.data) {
        this.tenderResult = resultRes.data;
      }
    });
  }

  doRefresh(event: any): void {
    // Reset error sebelum refresh
    this.winner = null;
    this.tenderResult = null;

    const winner$ = this.tenderService.getWinner(this.tenderId).pipe(catchError(() => of(null)));
    const result$ = this.tenderService.getTenderResult(this.tenderId).pipe(catchError(() => of(null)));

    forkJoin([winner$, result$]).subscribe(([winnerRes, resultRes]) => {
      if (winnerRes?.status === 'success' && winnerRes?.data) this.winner = winnerRes.data;
      if (resultRes?.status === 'success' && resultRes?.data) this.tenderResult = resultRes.data;
      event.target.complete();
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  goBack(): void {
    this.navCtrl.back();
  }

  get myResult(): 'won' | 'lost' | 'not_available' {
    if (!this.winner) return 'not_available';
    return this.winner.is_winner ? 'won' : 'lost';
  }

  getResultColor(result: string): string {
    switch (result) {
      case 'won':  return 'success';
      case 'lost': return 'danger';
      case 'pending': return 'warning';
      default: return 'medium';
    }
  }

  getResultLabel(result: string): string {
    switch (result) {
      case 'won':  return 'Anda Menang!';
      case 'lost': return 'Belum Beruntung';
      case 'pending': return 'Menunggu Hasil';
      default: return 'Belum Tersedia';
    }
  }

  getResultIcon(result: string): string {
    switch (result) {
      case 'won':  return 'trophy-outline';
      case 'lost': return 'close-circle-outline';
      case 'pending': return 'time-outline';
      default: return 'help-circle-outline';
    }
  }

  get winnerBidAmount(): number | null {
    return this.winner?.winning_bid_amount ?? this.tenderResult?.winning_bid_amount ?? null;
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  get skeletonRows(): number[] {
    return [1, 2, 3];
  }
}
