import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { User } from '../models/user.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

@Injectable({ providedIn: 'root' })
export class StorageService {
  // Fungsi buat nyimpen token ke HP user
  async setToken(token: string): Promise<void> {
    if (!token) return;
    await Preferences.set({ key: TOKEN_KEY, value: token });
  }
  // Fungsi buat ngambil token dari HP user
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
      // Kalo datanya error atau korup pas di parse, hapus aja sekalian biar ga bikin bug
      await Preferences.remove({ key: USER_KEY });
      return null;
    }
  }

  async removeUser(): Promise<void> {
    await Preferences.remove({ key: USER_KEY });
  }

  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
}
