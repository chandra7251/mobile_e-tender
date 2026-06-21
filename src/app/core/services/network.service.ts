import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
@Injectable({ providedIn: 'root' })
export class NetworkService {
  private _isOnline$ = new BehaviorSubject<boolean>(true);
  private wasOffline = false;
  readonly isOnline$: Observable<boolean> = this._isOnline$.asObservable();
  constructor(private toastController: ToastController) {}
  async startListening(): Promise<void> {
    const status = await Network.getStatus();
    this._isOnline$.next(status.connected);
    this.wasOffline = !status.connected;
    if (!status.connected) {
      this.showToast('Anda sedang offline. Menampilkan data tersimpan.', 'warning');
    }
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
  async checkConnection(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }
  get isOnlineNow(): boolean {
    return this._isOnline$.getValue();
  }
}
