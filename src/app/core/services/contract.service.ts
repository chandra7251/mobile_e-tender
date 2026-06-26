import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Contract } from '../models/user.model';

export interface SubmitDeliveryPayload {
  vendor_notes: string;
}

@Injectable({ providedIn: 'root' })
export class ContractService {
  constructor(private api: ApiService) {}

  /** Ambil semua kontrak milik vendor yg login */
  getMyContracts(): Observable<ApiResponse<Contract[]>> {
    return this.api.get<Contract[]>('vendor/contracts');
  }

  /** Detail kontrak */
  getContractDetail(contractId: number): Observable<ApiResponse<Contract>> {
    return this.api.get<Contract>(`contracts/${contractId}`);
  }

  /** Vendor tanda tangan kontrak */
  signContract(contractId: number): Observable<ApiResponse<Contract>> {
    return this.api.patch<Contract>(`contracts/${contractId}/sign-vendor`, {});
  }

  /** Submit progress / bukti delivery */
  submitDelivery(
    contractId: number,
    deliveryId: number,
    payload: SubmitDeliveryPayload
  ): Observable<ApiResponse<any>> {
    return this.api.patch<any>(
      `contracts/${contractId}/deliveries/${deliveryId}/submit`,
      payload
    );
  }
}
