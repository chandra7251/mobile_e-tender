import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { User, VendorProfile } from '../models/user.model';
const TOKEN_KEY  = 'auth_token';
const USER_KEY   = 'auth_user';
const VENDOR_KEY = 'vendor_data';
@Injectable({ providedIn: 'root' })
export class StorageService {
  async setToken(token: string): Promise<void> {
    if (!token) return;
    await Preferences.set({ key: TOKEN_KEY, value: token });
  }
  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    return (value && value !== 'undefined' && value !== 'null') ? value : null;
  }
  async removeToken(): Promise<void> {
    await Preferences.remove({ key: TOKEN_KEY });
  }
  async setUser(user: User | null | undefined): Promise<void> {
    if (!user) return;
    await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
  }
  async getUser(): Promise<User | null> {
    const { value } = await Preferences.get({ key: USER_KEY });
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
      return JSON.parse(value) as User;
    } catch {
      await Preferences.remove({ key: USER_KEY });
      return null;
    }
  }
  async removeUser(): Promise<void> {
    await Preferences.remove({ key: USER_KEY });
  }
  async setVendor(vendor: VendorProfile | null | undefined): Promise<void> {
    if (!vendor) return;
    await Preferences.set({ key: VENDOR_KEY, value: JSON.stringify(vendor) });
  }
  async getVendor(): Promise<VendorProfile | null> {
    const { value } = await Preferences.get({ key: VENDOR_KEY });
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
      return JSON.parse(value) as VendorProfile;
    } catch {
      await Preferences.remove({ key: VENDOR_KEY });
      return null;
    }
  }
  async removeVendor(): Promise<void> {
    await Preferences.remove({ key: VENDOR_KEY });
  }
  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
    await this.removeVendor(); // penting: hapus vendor_data agar tidak ada sisa sesi lama
  }
}
