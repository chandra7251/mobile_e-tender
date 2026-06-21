import { Injectable } from '@angular/core';
export interface ActivityLog {
  id: string;
  action: string;
  icon: string;
  timestamp: number;
}
@Injectable({ providedIn: 'root' })
export class ActivityService {
  private storageKey = 'vendor_activities';
  getActivities(): ActivityLog[] {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  log(action: string, icon: string = 'document-outline'): void {
    const logs = this.getActivities();
    if (logs.length > 0 && logs[0].action === action && (new Date().getTime() - logs[0].timestamp < 60000)) {
      return; 
    }
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      icon,
      timestamp: new Date().getTime()
    };
    logs.unshift(newLog);
    localStorage.setItem(this.storageKey, JSON.stringify(logs.slice(0, 20)));
  }
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
  timeAgo(timestamp: number): string {
    const diff = Math.floor((new Date().getTime() - timestamp) / 1000);
    if (diff < 60) return 'Baru saja';
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  }
}
