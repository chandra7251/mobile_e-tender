import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const CACHE_KEYS = {
  TENDER_LIST:    'cache_tender_list',
  VENDOR_PROFILE: 'cache_vendor_profile',
  TENDER_DETAIL_PREFIX: 'cache_tender_detail_'
} as const;

/**
 * Service buat nyimpen data ke cache lokal (storage HP).
 * Biar kalo pas sinyal jelek atau offline, user tetep bisa liat data terakhir.
 */
@Injectable({ providedIn: 'root' })
export class OfflineCacheService {

  // === Bagian Tender ===

  async cacheTenderList(data: any[]): Promise<void> {
    await Preferences.set({
      key: CACHE_KEYS.TENDER_LIST,
      value: JSON.stringify(data),
    });
  }

  async getCachedTenderList(): Promise<any[] | null> {
    const { value } = await Preferences.get({ key: CACHE_KEYS.TENDER_LIST });
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  // === Bagian Detail Tender ===

  async cacheTenderDetail(id: number, data: any): Promise<void> {
    await Preferences.set({
      key: `${CACHE_KEYS.TENDER_DETAIL_PREFIX}${id}`,
      value: JSON.stringify(data),
    });
  }

  async getCachedTenderDetail(id: number): Promise<any | null> {
    const { value } = await Preferences.get({ key: `${CACHE_KEYS.TENDER_DETAIL_PREFIX}${id}` });
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  // === Bagian Profil Vendor ===

  async cacheVendorProfile(data: any): Promise<void> {
    await Preferences.set({
      key: CACHE_KEYS.VENDOR_PROFILE,
      value: JSON.stringify(data),
    });
  }

  async getCachedVendorProfile(): Promise<any | null> {
    const { value } = await Preferences.get({ key: CACHE_KEYS.VENDOR_PROFILE });
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  // === Fungsi Bantuan ===

  async clearAllCache(): Promise<void> {
    await Preferences.remove({ key: CACHE_KEYS.TENDER_LIST });
    await Preferences.remove({ key: CACHE_KEYS.VENDOR_PROFILE });
  }
}
