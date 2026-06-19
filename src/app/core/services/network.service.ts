import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';

/**
 * Service buat mantau sinyal internet HP user secara live.
 *
 * Cara pake:
 * - Inject ke komponen: constructor(private network: NetworkService)
 * - Subscribe ke isOnline$: this.network.isOnline$.subscribe(...)
 * - Jangan lupa panggil startListening() pas aplikasi baru jalan (di AppComponent)
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {

  private _isOnline$ = new BehaviorSubject<boolean>(true);
  private wasOffline = false;

  // Observable biar gampang dilistening (true = ada sinyal, false = putus)
  readonly isOnline$: Observable<boolean> = this._isOnline$.asObservable();

  constructor(private toastController: ToastController) {}

  /**
   * Mulai dengerin perubahan sinyal internet.
   * Cukup dipanggil sekali aja pas aplikasi baru diload.
   */
  async startListening(): Promise<void> {
    // Cek dulu sinyal pas pertama kali buka app
    const status = await Network.getStatus();
    this._isOnline$.next(status.connected);
    this.wasOffline = !status.connected;

    if (!status.connected) {
      this.showToast('Anda sedang offline. Menampilkan data tersimpan.', 'warning');
    }

    // Kalo tiba-tiba sinyal ilang atau dapet wifi, kita tangkep di sini
    await Network.addListener('networkStatusChange', (status) => {
      this._isOnline$.next(status.connected);
      if (!status.connected) {
        this.wasOffline = true;
        this.showToast('Koneksi terputus. Anda sedang offline.', 'warning');
      } else if (status.connected && this.wasOffline) {
        this.wasOffline = false;
        this.showToast('Koneksi kembali terhubung.', 'success');
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    toast.present();
  }

  /**
   * Fungsi cepet buat ngecek kondisi sinyal detik ini juga.
   * @returns true kalo lagi online
   */
  async checkConnection(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  // Ambil nilai terakhir tanpa nunggu promise/observable
  get isOnlineNow(): boolean {
    return this._isOnline$.getValue();
  }
}
