import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TenderService } from '../../../core/services/tender.service';
import { Winner, TenderResult } from '../../../core/models/user.model';
import { forkJoin, of } from 'rxjs';
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

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private tenderService: TenderService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.tenderId = idParam ? +idParam : 0;
    this.loadAll();
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadAll(): void {
    this.isLoading = true;
    this.winnerError = '';
    this.resultError = '';

    // Panggil winner + result secara paralel via forkJoin
    // Masing-masing di-catchError agar tidak crash jika salah satu gagal
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

    forkJoin([winner$, result$]).subscribe(([winnerRes, resultRes]) => {
      this.isLoading = false;

      if (winnerRes?.status && winnerRes?.data) {
        this.winner = winnerRes.data;
      }

      if (resultRes?.status && resultRes?.data) {
        this.tenderResult = resultRes.data;
      }
    });
  }

  doRefresh(event: any): void {
    const winner$ = this.tenderService.getWinner(this.tenderId).pipe(catchError(() => of(null)));
    const result$ = this.tenderService.getTenderResult(this.tenderId).pipe(catchError(() => of(null)));

    forkJoin([winner$, result$]).subscribe(([winnerRes, resultRes]) => {
      if (winnerRes?.status && winnerRes?.data) this.winner = winnerRes.data;
      if (resultRes?.status && resultRes?.data) this.tenderResult = resultRes.data;
      event.target.complete();
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  goBack(): void {
    this.location.back();
  }

  // Apakah vendor ini adalah pemenang — dari winner.is_winner
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
      case 'won':  return '🏆 Anda Menang!';
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

  // Harga bid pemenang — langsung dari winning_bid_amount
  get winnerBidAmount(): number | null {
    return this.winner?.winning_bid_amount ?? this.tenderResult?.winning_bid_amount ?? null;
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
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
