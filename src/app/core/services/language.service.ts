import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export type SupportedLang = 'id' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translations: Record<string, any> = {};
  private currentLang$ = new BehaviorSubject<SupportedLang>(
    (localStorage.getItem('lang') as SupportedLang) || 'id'
  );

  constructor(private http: HttpClient) {
    this.loadTranslations(this.currentLang$.value).subscribe();
  }

  get currentLang(): SupportedLang { return this.currentLang$.value; }
  get langChange$(): Observable<SupportedLang> { return this.currentLang$.asObservable(); }

  switchLanguage(lang: SupportedLang): Observable<any> {
    return this.loadTranslations(lang).pipe(
      tap(() => {
        this.currentLang$.next(lang);
        localStorage.setItem('lang', lang);
      })
    );
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) value = value[k];
      else return key; // fallback ke key jika tidak ditemukan
    }
    return typeof value === 'string' ? value : key;
  }

  private loadTranslations(lang: SupportedLang): Observable<any> {
    return this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`).pipe(
      tap(data => this.translations = this.flattenKeys(data))
    );
  }

  private flattenKeys(obj: Record<string, any>, prefix = ''): Record<string, string> {
    return Object.keys(obj).reduce((acc, key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(acc, this.flattenKeys(obj[key], fullKey));
      } else {
        acc[fullKey] = obj[key];
      }
      return acc;
    }, {} as Record<string, string>);
  }
}
