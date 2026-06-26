import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BlockchainVerifyResult {
  found: boolean;
  record_id?: number;
  tender_id?: number;
  event_type?: string;
  is_valid?: boolean;
  hash_match?: boolean;
  chain_intact?: boolean;
  payload_hash?: string;
  block_hash?: string;
  tx_hash?: string;
  network?: string;
  created_at?: string;
  verification_status?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class BlockchainService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  publicVerify(hash: string): Observable<{ data: BlockchainVerifyResult }> {
    return this.http.get<any>(`${this.api}/blockchain/verify`, { params: { hash } });
  }

  getTenderChain(tenderId: number): Observable<{ data: BlockchainVerifyResult[] }> {
    return this.http.get<any>(`${this.api}/blockchain/chain/${tenderId}`);
  }
}
