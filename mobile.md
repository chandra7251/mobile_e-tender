# CLAUDE-VENDOR-MOBILE.md
# E-PROCUREMENT — VENDOR MOBILE APP
> Dokumen ini KHUSUS untuk pengembangan **Vendor Mobile App** menggunakan Ionic + Angular.
> Baca ini sebelum menulis satu baris kode pun.

---

## 1. IDENTITAS APLIKASI

| Properti | Nilai |
|---|---|
| Platform | Ionic + Angular |
| Role yang dilayani | **Vendor** (peserta tender) |
| Architecture | **NgModules** (BUKAN standalone components) |
| Komunikasi backend | REST API via HTTP (JSON) |
| Autentikasi | **JWT Token** (Bearer Token) |
| Local storage token | `@capacitor/preferences` atau `localStorage` |
| Target build | Android APK / AAB |

---

## 2. ATURAN KERAS ANGULAR/IONIC (WAJIB DIIKUTI SEMUA DEVELOPER)

```typescript
// ✅ BENAR — wajib ada standalone: false di setiap component
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,   // ← WAJIB ADA, JANGAN DIHAPUS
})
export class LoginPage {}

// ❌ SALAH — standalone: true akan menyebabkan error di NgModule
@Component({
  selector: 'app-login',
  standalone: true,
})
export class LoginPage {}
```

**Rules:**
- Setiap `@Component`, `@Pipe`, `@Directive` wajib `standalone: false`
- Semua page/component harus di-declare di dalam `declarations[]` module-nya
- Semua module menggunakan lazy loading via `loadChildren`
- Business logic di **Service**, bukan di Page component
- HTTP call hanya boleh di dalam Service, bukan langsung di Page

---

## 3. JWT AUTHENTICATION FLOW

### 3.1 Cara Kerja JWT di Aplikasi Ini

```
Vendor login → Backend validasi → Backend return JWT token
     ↓
App simpan token di storage
     ↓
Setiap request berikutnya → kirim token di header:
Authorization: Bearer <token>
     ↓
Backend validasi token → return data
     ↓
Jika token expired / invalid → 401 Unauthorized → redirect ke Login
```

### 3.2 Token Storage

```typescript
// auth.service.ts
import { Preferences } from '@capacitor/preferences';

// Simpan token
async saveToken(token: string): Promise<void> {
  await Preferences.set({ key: 'jwt_token', value: token });
}

// Ambil token
async getToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: 'jwt_token' });
  return value;
}

// Hapus token (logout)
async clearToken(): Promise<void> {
  await Preferences.remove({ key: 'jwt_token' });
}
```

### 3.3 HTTP Interceptor untuk JWT

```typescript
// interceptors/auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getTokenSync(); // sync version dari storage

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
```

```typescript
// app.module.ts — daftarkan interceptor
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,  // handle 401 → redirect login
    multi: true,
  }
]
```

### 3.4 Error Interceptor (Handle Token Expired)

```typescript
// interceptors/error.interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired atau invalid
          this.authService.clearToken();
          this.router.navigateByUrl('/auth/login', { replaceUrl: true });
        }
        return throwError(() => error);
      })
    );
  }
}
```

### 3.5 Auth Guard

```typescript
// guards/auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const token = await this.authService.getToken();
    if (token) {
      return true;
    }
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    return false;
  }
}
```

```typescript
// guards/guest.guard.ts — cegah user yang sudah login akses halaman auth
@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const token = await this.authService.getToken();
    if (!token) {
      return true;
    }
    this.router.navigateByUrl('/tabs/tenders', { replaceUrl: true });
    return false;
  }
}
```

---

## 4. STRUKTUR FOLDER LENGKAP

```
src/
├── app/
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   ├── app.component.ts              standalone: false
│   ├── app.component.html
│   │
│   ├── core/
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── guest.guard.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── vendor.model.ts
│   │       ├── tender.model.ts
│   │       ├── bid.model.ts
│   │       ├── aanwijzing.model.ts
│   │       └── result.model.ts
│   │
│   ├── services/
│   │   ├── api.service.ts            ← base HTTP wrapper
│   │   ├── auth.service.ts           ← login, register, token, profile
│   │   ├── vendor.service.ts         ← profile, dokumen, status verifikasi
│   │   ├── tender.service.ts         ← list, detail, join tender
│   │   ├── aanwijzing.service.ts     ← baca aanwijzing
│   │   ├── bidding.service.ts        ← submit bid, cek waktu
│   │   └── result.service.ts         ← lihat hasil tender
│   │
│   ├── shared/
│   │   ├── shared.module.ts
│   │   └── components/
│   │       ├── bottom-nav/
│   │       │   ├── bottom-nav.component.ts     standalone: false
│   │       │   └── bottom-nav.component.html
│   │       ├── status-badge/
│   │       │   └── status-badge.component.ts   standalone: false
│   │       └── countdown-timer/
│   │           └── countdown-timer.component.ts standalone: false
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth-routing.module.ts
│   │   │   ├── login/
│   │   │   │   ├── login.module.ts
│   │   │   │   ├── login.page.ts               standalone: false
│   │   │   │   └── login.page.html
│   │   │   └── register/
│   │   │       ├── register.module.ts
│   │   │       ├── register.page.ts            standalone: false
│   │   │       └── register.page.html
│   │   │
│   │   ├── tabs/
│   │   │   ├── tabs.module.ts
│   │   │   ├── tabs-routing.module.ts
│   │   │   ├── tabs.page.ts                    standalone: false
│   │   │   └── tabs.page.html
│   │   │
│   │   ├── tender/
│   │   │   ├── tender.module.ts
│   │   │   ├── tender-routing.module.ts
│   │   │   ├── tender-list/
│   │   │   │   ├── tender-list.page.ts         standalone: false
│   │   │   │   └── tender-list.page.html
│   │   │   ├── tender-detail/
│   │   │   │   ├── tender-detail.page.ts       standalone: false
│   │   │   │   └── tender-detail.page.html
│   │   │   └── tender-join/
│   │   │       ├── tender-join.page.ts         standalone: false
│   │   │       └── tender-join.page.html
│   │   │
│   │   ├── aanwijzing/
│   │   │   ├── aanwijzing.module.ts
│   │   │   ├── aanwijzing-routing.module.ts
│   │   │   └── aanwijzing-view/
│   │   │       ├── aanwijzing-view.page.ts     standalone: false
│   │   │       └── aanwijzing-view.page.html
│   │   │
│   │   ├── bidding/
│   │   │   ├── bidding.module.ts
│   │   │   ├── bidding-routing.module.ts
│   │   │   └── bidding/
│   │   │       ├── bidding.page.ts             standalone: false
│   │   │       └── bidding.page.html
│   │   │
│   │   ├── result/
│   │   │   ├── result.module.ts
│   │   │   ├── result-routing.module.ts
│   │   │   ├── result-list/
│   │   │   │   ├── result-list.page.ts         standalone: false
│   │   │   │   └── result-list.page.html
│   │   │   └── result-detail/
│   │   │       ├── result-detail.page.ts       standalone: false
│   │   │       └── result-detail.page.html
│   │   │
│   │   └── profile/
│   │       ├── profile.module.ts
│   │       ├── profile-routing.module.ts
│   │       ├── profile/
│   │       │   ├── profile.page.ts             standalone: false
│   │       │   └── profile.page.html
│   │       └── documents/
│   │           ├── documents.page.ts           standalone: false
│   │           └── documents.page.html
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── theme/
    └── variables.scss
```

---

## 5. APP ROUTING (LAZY LOADED)

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/tabs/tabs.module').then(m => m.TabsModule),
    canActivate: [AuthGuard]
  },
];
```

```typescript
// tabs-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tenders',
        loadChildren: () =>
          import('../tender/tender.module').then(m => m.TenderModule)
      },
      {
        path: 'bidding',
        loadChildren: () =>
          import('../bidding/bidding.module').then(m => m.BiddingModule)
      },
      {
        path: 'results',
        loadChildren: () =>
          import('../result/result.module').then(m => m.ResultModule)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: '',
        redirectTo: 'tenders',
        pathMatch: 'full'
      }
    ]
  }
];
```

---

## 6. MODELS (TYPESCRIPT INTERFACES)

```typescript
// core/models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'vendor' | 'admin';
  created_at: string;
}

// core/models/vendor.model.ts
export interface Vendor {
  id: number;
  user_id: number;
  nama_perusahaan: string;
  alamat: string;
  kontak: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  documents?: VendorDocument[];
}

export interface VendorDocument {
  id: number;
  vendor_id: number;
  document_type: string;
  file_path: string;
  file_url: string;
  uploaded_at: string;
}

// core/models/tender.model.ts
export interface Tender {
  id: number;
  nama_tender: string;
  deskripsi: string;
  spesifikasi: string;
  status: TenderStatus;
  timeline?: TenderTimeline;
  created_at: string;
}

export type TenderStatus =
  | 'draft'
  | 'open'
  | 'aanwijzing'
  | 'bidding'
  | 'closed'
  | 'finished';

export interface TenderTimeline {
  id: number;
  tender_id: number;
  tanggal_mulai: string;       // ISO datetime
  tanggal_selesai: string;
  aanwijzing_start: string;
  aanwijzing_end: string;
  bidding_start: string;       // ← critical
  bidding_end: string;         // ← critical
}

// core/models/bid.model.ts
export interface Bid {
  id: number;
  tender_id: number;
  vendor_id: number;
  nilai_penawaran: number;
  submitted_at: string;
  updated_at: string;
}

export interface BidPayload {
  nilai_penawaran: number;
}

// core/models/aanwijzing.model.ts
export interface Aanwijzing {
  id: number;
  tender_id: number;
  content: string;
  created_at: string;
}

// core/models/result.model.ts
export interface TenderResult {
  id: number;
  tender_id: number;
  tender: Tender;
  winner_vendor_id: number;
  winning_amount: number;
  decided_at: string;
  is_winner: boolean;          // ← true jika vendor yg login adalah pemenang
}

// core/models/api-response.model.ts
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}
```

---

## 7. SERVICES LENGKAP

### 7.1 ApiService — Base HTTP Wrapper

```typescript
// services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl; // 'https://your-api.com/api/v1'

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
  }

  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData);
    // Note: DO NOT set Content-Type — browser sets it automatically with boundary
  }
}
```

### 7.2 AuthService

```typescript
// services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // Register vendor baru
  register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    nama_perusahaan: string;
    alamat: string;
    kontak: string;
  }): Observable<ApiResponse<{ token: string; user: User }>> {
    return this.api.post('auth/register', payload).pipe(
      tap(res => {
        if (res.status === 'success') {
          this.saveToken(res.data.token);
          this.saveUser(res.data.user);
          this.currentUserSubject.next(res.data.user);
        }
      })
    );
  }

  // Login
  login(email: string, password: string): Observable<ApiResponse<{ token: string; user: User }>> {
    return this.api.post('auth/login', { email, password }).pipe(
      tap(res => {
        if (res.status === 'success') {
          this.saveToken(res.data.token);
          this.saveUser(res.data.user);
          this.currentUserSubject.next(res.data.user);
        }
      })
    );
  }

  // Logout
  logout(): Observable<any> {
    return this.api.post('auth/logout', {}).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      }),
      catchError(() => {
        this.clearSession();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
        return of(null);
      })
    );
  }

  // Get current user profile dari API
  getProfile(): Observable<ApiResponse<User>> {
    return this.api.get<User>('auth/me');
  }

  // Update profile
  updateProfile(payload: { name?: string; email?: string }): Observable<ApiResponse<User>> {
    return this.api.put<User>('auth/profile', payload);
  }

  // Change password
  changePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Observable<ApiResponse<any>> {
    return this.api.put('auth/password', payload);
  }

  // Token management
  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'jwt_token' });
    return value;
  }

  getTokenSync(): string | null {
    return localStorage.getItem('jwt_token'); // fallback sync
  }

  private saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
    Preferences.set({ key: 'jwt_token', value: token });
  }

  private saveUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private async loadUserFromStorage(): Promise<void> {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
    }
  }

  private clearSession(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    Preferences.remove({ key: 'jwt_token' });
    this.currentUserSubject.next(null);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getTokenSync();
  }
}
```

### 7.3 VendorService

```typescript
// services/vendor.service.ts
@Injectable({ providedIn: 'root' })
export class VendorService {
  constructor(private api: ApiService) {}

  // Ambil profil vendor sendiri
  getMyProfile(): Observable<ApiResponse<Vendor>> {
    return this.api.get<Vendor>('vendor/profile');
  }

  // Update profil vendor
  updateProfile(payload: {
    nama_perusahaan?: string;
    alamat?: string;
    kontak?: string;
  }): Observable<ApiResponse<Vendor>> {
    return this.api.put<Vendor>('vendor/profile', payload);
  }

  // Upload dokumen perusahaan
  uploadDocument(file: File, documentType: string): Observable<ApiResponse<VendorDocument>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);
    return this.api.postFormData<VendorDocument>('vendor/documents', formData);
  }

  // List dokumen milik vendor
  getMyDocuments(): Observable<ApiResponse<VendorDocument[]>> {
    return this.api.get<VendorDocument[]>('vendor/documents');
  }

  // Cek status verifikasi vendor
  getVerificationStatus(): Observable<ApiResponse<{ status: string; notes?: string }>> {
    return this.api.get('vendor/status');
  }
}
```

### 7.4 TenderService

```typescript
// services/tender.service.ts
@Injectable({ providedIn: 'root' })
export class TenderService {
  constructor(private api: ApiService) {}

  // List semua tender yang bisa dilihat vendor (open, aanwijzing, bidding, closed, finished)
  getTenders(): Observable<ApiResponse<Tender[]>> {
    return this.api.get<Tender[]>('tenders');
  }

  // Detail satu tender
  getTenderDetail(tenderId: number): Observable<ApiResponse<Tender>> {
    return this.api.get<Tender>(`tenders/${tenderId}`);
  }

  // Daftar sebagai peserta tender
  // Hanya bisa jika vendor status = approved
  joinTender(tenderId: number): Observable<ApiResponse<any>> {
    return this.api.post(`tenders/${tenderId}/join`, {});
  }

  // Daftar tender yang sudah vendor ini ikuti
  getMyTenders(): Observable<ApiResponse<Tender[]>> {
    return this.api.get<Tender[]>('vendor/tenders');
  }

  // Cek apakah vendor sudah join tender ini
  checkParticipation(tenderId: number): Observable<ApiResponse<{ is_participant: boolean }>> {
    return this.api.get(`tenders/${tenderId}/my-participation`);
  }
}
```

### 7.5 AanwijzingService

```typescript
// services/aanwijzing.service.ts
@Injectable({ providedIn: 'root' })
export class AanwijzingService {
  constructor(private api: ApiService) {}

  // Ambil semua aanwijzing dari satu tender
  getAanwijzing(tenderId: number): Observable<ApiResponse<Aanwijzing[]>> {
    return this.api.get<Aanwijzing[]>(`tenders/${tenderId}/aanwijzing`);
  }
}
```

### 7.6 BiddingService — KRITIS

```typescript
// services/bidding.service.ts
@Injectable({ providedIn: 'root' })
export class BiddingService {
  constructor(private api: ApiService) {}

  // Submit penawaran harga
  // Backend AKAN menolak jika di luar waktu bidding
  submitBid(tenderId: number, payload: BidPayload): Observable<ApiResponse<Bid>> {
    return this.api.post<Bid>(`tenders/${tenderId}/bids`, payload);
  }

  // Update penawaran (selama bidding masih aktif)
  updateBid(tenderId: number, payload: BidPayload): Observable<ApiResponse<Bid>> {
    return this.api.put<Bid>(`tenders/${tenderId}/bids`, payload);
  }

  // Ambil bid saya untuk tender ini
  getMyBid(tenderId: number): Observable<ApiResponse<Bid | null>> {
    return this.api.get<Bid | null>(`tenders/${tenderId}/my-bid`);
  }

  // ─── TIME LOGIC (CLIENT SIDE — sebagai UI helper saja) ───
  // NOTE: Validasi sesungguhnya ada di backend. Ini hanya untuk UI.

  isBiddingActive(timeline: TenderTimeline): boolean {
    const now = new Date();
    const start = new Date(timeline.bidding_start);
    const end = new Date(timeline.bidding_end);
    return now >= start && now <= end;
  }

  isBiddingNotYetOpen(timeline: TenderTimeline): boolean {
    const now = new Date();
    const start = new Date(timeline.bidding_start);
    return now < start;
  }

  isBiddingClosed(timeline: TenderTimeline): boolean {
    const now = new Date();
    const end = new Date(timeline.bidding_end);
    return now > end;
  }

  // Hitung sisa waktu bidding dalam detik
  getRemainingSeconds(timeline: TenderTimeline): number {
    const now = new Date();
    const end = new Date(timeline.bidding_end);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }

  getBiddingStatusLabel(timeline: TenderTimeline): string {
    if (this.isBiddingNotYetOpen(timeline)) return 'Bidding Belum Dibuka';
    if (this.isBiddingActive(timeline)) return 'Bidding Sedang Berlangsung';
    if (this.isBiddingClosed(timeline)) return 'Bidding Telah Ditutup';
    return 'Tidak Diketahui';
  }
}
```

### 7.7 ResultService

```typescript
// services/result.service.ts
@Injectable({ providedIn: 'root' })
export class ResultService {
  constructor(private api: ApiService) {}

  // Hasil tender tertentu (menang/kalah)
  getTenderResult(tenderId: number): Observable<ApiResponse<TenderResult>> {
    return this.api.get<TenderResult>(`tenders/${tenderId}/result`);
  }

  // Semua hasil tender yang vendor ini ikuti
  getMyResults(): Observable<ApiResponse<TenderResult[]>> {
    return this.api.get<TenderResult[]>('vendor/results');
  }
}
```

---

## 8. FITUR VENDOR — LENGKAP

### 8.1 REGISTER
**File:** `pages/auth/register/`

Vendor mengisi:
- Nama lengkap (`name`)
- Email (`email`)
- Password + konfirmasi
- Nama perusahaan (`nama_perusahaan`)
- Alamat (`alamat`)
- Nomor kontak (`kontak`)

Setelah register:
- Backend simpan user dengan role `vendor`
- Backend simpan data vendor dengan status `pending`
- Backend return JWT token
- App simpan token → redirect ke halaman utama
- Status vendor masih `pending` sampai admin approve

```typescript
// register.page.ts
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: false,
})
export class RegisterPage {
  form = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    nama_perusahaan: '',
    alamat: '',
    kontak: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async onRegister() {
    const loading = await this.loadingCtrl.create({ message: 'Mendaftar...' });
    await loading.present();

    this.authService.register(this.form).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigateByUrl('/tabs/tenders', { replaceUrl: true });
      },
      error: async (err) => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: err.error?.message || 'Registrasi gagal',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
```

---

### 8.2 LOGIN
**File:** `pages/auth/login/`

Vendor mengisi:
- Email
- Password

Setelah login berhasil:
- Simpan JWT token
- Simpan data user
- Redirect ke `/tabs/tenders`

---

### 8.3 LOGOUT
**File:** `pages/profile/profile/`

- Panggil `authService.logout()`
- Backend invalidate token (jika pakai blacklist)
- Hapus token dari storage
- Redirect ke login page

---

### 8.4 UPLOAD DOKUMEN PERUSAHAAN
**File:** `pages/profile/documents/`

Vendor bisa upload:
- Dokumen legalitas
- Izin usaha
- Dokumen pendukung lain

```typescript
// documents.page.ts
@Component({
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  standalone: false,
})
export class DocumentsPage {
  documents: VendorDocument[] = [];

  constructor(
    private vendorService: VendorService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.vendorService.getMyDocuments().subscribe({
      next: (res) => this.documents = res.data
    });
  }

  async onFileSelected(event: Event, documentType: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const loading = await this.loadingCtrl.create({ message: 'Mengupload...' });
    await loading.present();

    this.vendorService.uploadDocument(file, documentType).subscribe({
      next: async () => {
        await loading.dismiss();
        this.loadDocuments();
        (await this.toastCtrl.create({
          message: 'Dokumen berhasil diupload',
          duration: 2000,
          color: 'success'
        })).present();
      },
      error: async () => {
        await loading.dismiss();
      }
    });
  }
}
```

---

### 8.5 CEK STATUS VERIFIKASI
**File:** `pages/profile/profile/`

Vendor bisa melihat status verifikasinya:

| Status | Warna Badge | Pesan |
|---|---|---|
| `pending` | Kuning | Menunggu verifikasi admin |
| `approved` | Hijau | Terverifikasi — dapat mengikuti tender |
| `rejected` | Merah | Ditolak — hubungi admin |

```typescript
// Tampilkan badge status di profile page
getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  return colors[status] || 'medium';
}
```

---

### 8.6 LIHAT DAFTAR TENDER
**File:** `pages/tender/tender-list/`

Vendor melihat:
- Semua tender dengan status: `open`, `aanwijzing`, `bidding`, `closed`, `finished`
- Setiap card menampilkan: nama tender, status, waktu bidding

```typescript
// tender-list.page.ts
@Component({
  selector: 'app-tender-list',
  templateUrl: './tender-list.page.html',
  standalone: false,
})
export class TenderListPage {
  tenders: Tender[] = [];
  isLoading = true;

  constructor(
    private tenderService: TenderService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.loadTenders();
  }

  loadTenders() {
    this.isLoading = true;
    this.tenderService.getTenders().subscribe({
      next: (res) => {
        this.tenders = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  goToDetail(tenderId: number) {
    this.router.navigate(['/tabs/tenders', tenderId]);
  }

  getTenderStatusColor(status: TenderStatus): string {
    const map: Record<TenderStatus, string> = {
      draft: 'medium',
      open: 'primary',
      aanwijzing: 'tertiary',
      bidding: 'warning',
      closed: 'danger',
      finished: 'success',
    };
    return map[status] || 'medium';
  }
}
```

---

### 8.7 LIHAT DETAIL TENDER
**File:** `pages/tender/tender-detail/`

Vendor melihat:
- Nama tender
- Deskripsi & spesifikasi
- Timeline (tanggal mulai, aanwijzing, bidding start/end)
- Status tender saat ini
- Tombol **Join Tender** (hanya tampil jika status `open` dan vendor approved)
- Tombol **Lihat Aanwijzing** (jika status `aanwijzing` atau setelahnya)
- Tombol **Bidding** (jika status `bidding`)
- Tombol **Lihat Hasil** (jika status `finished`)

```typescript
// tender-detail.page.ts
@Component({
  selector: 'app-tender-detail',
  templateUrl: './tender-detail.page.html',
  standalone: false,
})
export class TenderDetailPage {
  tender: Tender | null = null;
  isParticipant = false;
  vendorStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private tenderService: TenderService,
    private vendorService: VendorService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetail(id);
    this.checkVendorStatus();
  }

  loadDetail(id: number) {
    this.tenderService.getTenderDetail(id).subscribe({
      next: (res) => {
        this.tender = res.data;
        this.checkParticipation(id);
      }
    });
  }

  checkVendorStatus() {
    this.vendorService.getVerificationStatus().subscribe({
      next: (res) => this.vendorStatus = res.data.status
    });
  }

  checkParticipation(tenderId: number) {
    this.tenderService.checkParticipation(tenderId).subscribe({
      next: (res) => this.isParticipant = res.data.is_participant
    });
  }

  get canJoin(): boolean {
    return this.tender?.status === 'open'
      && this.vendorStatus === 'approved'
      && !this.isParticipant;
  }

  get canBid(): boolean {
    return this.tender?.status === 'bidding' && this.isParticipant;
  }
}
```

---

### 8.8 JOIN TENDER
**File:** `pages/tender/tender-join/`

- Vendor klik tombol "Ikut Tender"
- Backend cek: vendor status = `approved`? → jika tidak, return 403
- Backend cek: vendor sudah join? → jika ya, return error
- Jika oke → vendor tercatat sebagai peserta
- Tampilkan konfirmasi sukses

**Yang ditampilkan sebelum join:**
- Nama tender
- Deskripsi singkat
- Tombol konfirmasi "Ya, Ikut Tender"

---

### 8.9 BACA AANWIJZING
**File:** `pages/aanwijzing/aanwijzing-view/`

- Vendor membaca informasi tambahan dari admin
- Ditampilkan sebagai list kartu berurutan (terbaru di atas)
- Vendor tidak bisa reply / post — read only
- Jika belum ada aanwijzing → tampilkan pesan "Belum ada informasi aanwijzing"

---

### 8.10 BIDDING (KRITIS)
**File:** `pages/bidding/bidding/`

Ini adalah halaman terpenting di seluruh aplikasi.

**Kondisi dan tampilan:**

| Kondisi | Tampilan |
|---|---|
| Bidding belum dibuka | Info waktu mulai, form disabled |
| Bidding aktif | Form input aktif, countdown timer |
| Bidding sudah ditutup | Pesan "Bidding Telah Ditutup", tampilkan bid terakhir |
| Vendor belum join | Redirect ke tender detail atau tampilkan pesan |
| Vendor sudah submit bid | Tampilkan bid sebelumnya, opsi update |

```typescript
// bidding.page.ts
@Component({
  selector: 'app-bidding',
  templateUrl: './bidding.page.html',
  standalone: false,
})
export class BiddingPage implements OnInit, OnDestroy {
  tender: Tender | null = null;
  myBid: Bid | null = null;
  nilaiPenawaran: number | null = null;
  biddingStatus: 'not_open' | 'active' | 'closed' = 'not_open';
  remainingSeconds = 0;
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private tenderService: TenderService,
    private biddingService: BiddingService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  loadData(tenderId: number) {
    this.tenderService.getTenderDetail(tenderId).subscribe(res => {
      this.tender = res.data;
      this.updateBiddingStatus();
      this.startCountdown();
    });

    this.biddingService.getMyBid(tenderId).subscribe(res => {
      this.myBid = res.data;
      if (this.myBid) {
        this.nilaiPenawaran = this.myBid.nilai_penawaran;
      }
    });
  }

  updateBiddingStatus() {
    if (!this.tender?.timeline) return;
    const timeline = this.tender.timeline;

    if (this.biddingService.isBiddingNotYetOpen(timeline)) {
      this.biddingStatus = 'not_open';
    } else if (this.biddingService.isBiddingActive(timeline)) {
      this.biddingStatus = 'active';
    } else {
      this.biddingStatus = 'closed';
    }
  }

  startCountdown() {
    if (!this.tender?.timeline) return;
    this.remainingSeconds = this.biddingService.getRemainingSeconds(this.tender.timeline);

    this.countdownInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateBiddingStatus(); // update status setiap detik
      } else {
        clearInterval(this.countdownInterval);
        this.biddingStatus = 'closed';
      }
    }, 1000);
  }

  get isFormActive(): boolean {
    return this.biddingStatus === 'active';
  }

  get formattedCountdown(): string {
    const h = Math.floor(this.remainingSeconds / 3600);
    const m = Math.floor((this.remainingSeconds % 3600) / 60);
    const s = this.remainingSeconds % 60;
    return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  async onSubmitBid() {
    if (!this.isFormActive) {
      const toast = await this.toastCtrl.create({
        message: 'Bidding tidak aktif saat ini',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    if (!this.nilaiPenawaran || this.nilaiPenawaran <= 0) {
      const toast = await this.toastCtrl.create({
        message: 'Masukkan nilai penawaran yang valid',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Mengirim penawaran...' });
    await loading.present();

    const tenderId = this.tender!.id;
    const payload: BidPayload = { nilai_penawaran: this.nilaiPenawaran };

    const request = this.myBid
      ? this.biddingService.updateBid(tenderId, payload)
      : this.biddingService.submitBid(tenderId, payload);

    request.subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.myBid = res.data;
        (await this.toastCtrl.create({
          message: 'Penawaran berhasil dikirim!',
          duration: 2000,
          color: 'success'
        })).present();
      },
      error: async (err) => {
        await loading.dismiss();
        // Backend akan return 422 jika di luar waktu bidding
        (await this.toastCtrl.create({
          message: err.error?.message || 'Gagal mengirim penawaran',
          duration: 3000,
          color: 'danger'
        })).present();
      }
    });
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
```

---

### 8.11 LIHAT HASIL TENDER
**File:** `pages/result/result-list/` dan `result-detail/`

**Result List:** Semua tender yang vendor ini ikuti beserta statusnya

**Result Detail:** Detail satu tender:
- Nama tender
- Status: **MENANG** (hijau) atau **KALAH** (merah/abu)
- Jika menang: tampilkan nilai penawaran pemenang
- Jika kalah: tampilkan pesan "Penawaran Anda tidak dipilih"
- Detail PO jika menang (opsional)

```typescript
// result-list.page.ts
@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.page.html',
  standalone: false,
})
export class ResultListPage {
  results: TenderResult[] = [];

  constructor(private resultService: ResultService) {}

  ionViewWillEnter() {
    this.resultService.getMyResults().subscribe({
      next: (res) => this.results = res.data
    });
  }
}
```

---

### 8.12 PROFILE & EDIT PROFILE
**File:** `pages/profile/profile/`

Vendor melihat dan mengedit:
- Nama
- Email (baca saja / atau bisa edit)
- Nama perusahaan
- Alamat
- Kontak
- Status verifikasi (badge, tidak bisa diedit)
- Tombol logout
- Tombol ke halaman dokumen
- Tombol ganti password

---

## 9. NAVIGASI — BOTTOM TABS

```typescript
// tabs.page.html
<ion-tabs>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="tenders" routerLink="/tabs/tenders" routerLinkActive="tab-selected">
      <ion-icon name="document-text-outline"></ion-icon>
      <ion-label>Tender</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="bidding" routerLink="/tabs/bidding" routerLinkActive="tab-selected">
      <ion-icon name="pricetag-outline"></ion-icon>
      <ion-label>Bidding</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="results" routerLink="/tabs/results" routerLinkActive="tab-selected">
      <ion-icon name="trophy-outline"></ion-icon>
      <ion-label>Hasil</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="profile" routerLink="/tabs/profile" routerLinkActive="tab-selected">
      <ion-icon name="person-outline"></ion-icon>
      <ion-label>Profil</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</ion-tabs>
```

---

## 10. ENVIRONMENT CONFIG

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',   // development
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-deployed-api.com/api/v1',  // production
};
```

---

## 11. API ENDPOINTS — VENDOR (LENGKAP)

Semua endpoint menggunakan:
- Base URL: `{{apiUrl}}/`
- Header: `Authorization: Bearer <jwt_token>`
- Header: `Accept: application/json`

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `auth/register` | Registrasi vendor baru |
| POST | `auth/login` | Login |
| POST | `auth/logout` | Logout (invalidate token) |
| GET | `auth/me` | Ambil profil user saat ini |
| PUT | `auth/profile` | Update profil user |
| PUT | `auth/password` | Ganti password |
| GET | `vendor/profile` | Profil vendor (nama perusahaan, dll) |
| PUT | `vendor/profile` | Update profil vendor |
| GET | `vendor/status` | Status verifikasi vendor |
| GET | `vendor/documents` | List dokumen vendor |
| POST | `vendor/documents` | Upload dokumen (multipart/form-data) |
| GET | `tenders` | Daftar semua tender aktif |
| GET | `tenders/{id}` | Detail tender |
| POST | `tenders/{id}/join` | Daftar sebagai peserta tender |
| GET | `tenders/{id}/my-participation` | Cek apakah sudah join |
| GET | `vendor/tenders` | Daftar tender yang diikuti |
| GET | `tenders/{id}/aanwijzing` | Baca aanwijzing tender |
| POST | `tenders/{id}/bids` | Submit penawaran harga |
| PUT | `tenders/{id}/bids` | Update penawaran (jika masih aktif) |
| GET | `tenders/{id}/my-bid` | Lihat bid saya di tender ini |
| GET | `tenders/{id}/result` | Hasil tender |
| GET | `vendor/results` | Semua hasil tender yang diikuti |

---

## 12. ERROR HANDLING STANDARD

```typescript
// Semua service menggunakan pattern ini
someApiCall().subscribe({
  next: (res) => {
    // handle success
  },
  error: (err: HttpErrorResponse) => {
    switch (err.status) {
      case 400:
        // Bad request — validasi gagal
        // err.error.errors berisi field errors
        break;
      case 401:
        // Token expired / invalid → ErrorInterceptor handle ini
        break;
      case 403:
        // Forbidden — vendor belum approved, atau bukan peserta
        // Tampilkan pesan: err.error.message
        break;
      case 422:
        // Unprocessable — bidding di luar waktu, atau validasi bisnis
        // Tampilkan pesan: err.error.message
        break;
      case 500:
        // Server error
        break;
    }
  }
});
```

---

## 13. CHECKLIST FITUR VENDOR (SEMUA HARUS ADA)

- [ ] Register sebagai vendor
- [ ] Login dengan JWT token
- [ ] Logout dan hapus token
- [ ] Upload dokumen perusahaan
- [ ] Lihat status verifikasi (pending/approved/rejected)
- [ ] Update profil vendor
- [ ] Ganti password
- [ ] Lihat daftar tender
- [ ] Lihat detail tender
- [ ] Join tender (hanya jika approved)
- [ ] Baca aanwijzing
- [ ] Submit bid (hanya dalam waktu bidding)
- [ ] Update bid (selama bidding aktif)
- [ ] Lihat countdown timer bidding
- [ ] Input ditolak jika bidding tidak aktif
- [ ] Lihat hasil tender (menang/kalah)

---

## 14. YANG TIDAK BOLEH DILAKUKAN DI MOBILE APP

- ❌ Tidak boleh menulis business logic di page component
- ❌ Tidak boleh menerima atau menolak bid secara lokal — semua validasi dari backend
- ❌ Tidak boleh menggunakan `standalone: true`
- ❌ Tidak boleh menggunakan `HttpClient` langsung di page — harus lewat service
- ❌ Tidak boleh menyimpan token di tempat selain `Preferences` / `localStorage`
- ❌ Tidak boleh ada halaman admin di mobile app ini
- ❌ Tidak boleh menampilkan bid vendor lain
- ❌ Tidak boleh bypass guard dengan navigasi langsung

---

*File ini adalah referensi khusus untuk tim yang mengerjakan **Vendor Mobile App** (Ionic + Angular).*
*Pastikan semua developer di tim membaca ini sebelum mulai coding.*