import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SnapPaymentData {
  token: string;
  redirect_url: string;
  snap_token?: string;
}

export interface TenderPayment {
  id: number;
  tender_id: number;
  vendor_id: number;
  order_id: string;
  type: 'deposit' | 'invoice' | 'refund';
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';
  snap_token: string | null;
  snap_url: string | null;
  paid_at: string | null;
}

export interface PaymentSummary {
  total_deposits: number;
  total_amount: number;
  pending_count: number;
  refunded_count: number;
  payments: TenderPayment[];
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Buat deposit jaminan — return snap_token + snap_url */
  createDeposit(tenderId: number, depositAmount: number): Observable<{ data: SnapPaymentData }> {
    return this.http.post<any>(`${this.api}/payment/deposit`, { tender_id: tenderId, deposit_amount: depositAmount });
  }

  /** Get payment summary untuk tender */
  getTenderPayments(tenderId: number): Observable<{ data: PaymentSummary }> {
    return this.http.get<any>(`${this.api}/payment/tender/${tenderId}`);
  }

  /** Get Midtrans client key */
  getClientKey(): Observable<{ data: { client_key: string } }> {
    return this.http.get<any>(`${this.api}/payment/client-key`);
  }

  /** Open Midtrans Snap payment popup */
  openSnapPayment(snapToken: string): void {
    const w = window as any;
    if (w.snap) {
      w.snap.pay(snapToken, {
        onSuccess: (result: any) => console.log('Payment success', result),
        onPending: (result: any) => console.log('Payment pending', result),
        onError:   (result: any) => console.error('Payment error', result),
        onClose:   ()           => console.log('Payment popup closed'),
      });
    } else {
      // Fallback: redirect ke snap_url
      console.warn('Snap.js not loaded, redirecting...');
    }
  }
}
