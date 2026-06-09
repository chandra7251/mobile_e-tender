import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const CACHE_KEYS = {
  TENDER_LIST:    'cache_tender_list',
  VENDOR_PROFILE: 'cache_vendor_profile',
} as const;

/**
 * Cache service for offline mode.
 */
@Injectable({ providedIn: 'root' })
export class OfflineCacheService {

  // Tender List

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

  // Vendor Profile

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

  // Utility

  async clearAllCache(): Promise<void> {
    await Preferences.remove({ key: CACHE_KEYS.TENDER_LIST });
    await Preferences.remove({ key: CACHE_KEYS.VENDOR_PROFILE });
  }
}
