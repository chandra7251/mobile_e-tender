import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
const CACHE_KEYS = {
  TENDER_LIST:    'cache_tender_list',
  VENDOR_PROFILE: 'cache_vendor_profile',
  TENDER_DETAIL_PREFIX: 'cache_tender_detail_'
} as const;
@Injectable({ providedIn: 'root' })
export class OfflineCacheService {
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
  async clearAllCache(): Promise<void> {
    await Preferences.remove({ key: CACHE_KEYS.TENDER_LIST });
    await Preferences.remove({ key: CACHE_KEYS.VENDOR_PROFILE });
  }
}
