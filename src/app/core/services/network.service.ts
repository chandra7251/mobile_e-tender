import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * NetworkService — monitor status koneksi internet secara realtime.
 *
 * Cara pakai:
 * - Inject ke component: constructor(private network: NetworkService)
 * - Subscribe: this.network.isOnline$.subscribe(online => { ... })
 * - Panggil startListening() di AppComponent untuk memulai monitoring
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {

  private _isOnline$ = new BehaviorSubject<boolean>(true);

  /** Observable status koneksi: true = online, false = offline */
  readonly isOnline$: Observable<boolean> = this._isOnline$.asObservable();

  /**
   * Mulai mendengarkan perubahan status jaringan.
   * Dipanggil sekali di AppComponent constructor/ngOnInit.
   */
  async startListening(): Promise<void> {
    // Cek status saat app pertama dibuka
    const status = await Network.getStatus();
    this._isOnline$.next(status.connected);

    // Listen perubahan jaringan
    await Network.addListener('networkStatusChange', (status) => {
      this._isOnline$.next(status.connected);
    });
  }

  /**
   * Cek status koneksi saat ini (one-shot).
   * @returns true jika online
   */
  async checkConnection(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  /** Nilai saat ini (synchronous, tanpa await) */
  get isOnlineNow(): boolean {
    return this._isOnline$.getValue();
  }
}
