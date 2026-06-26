import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AiPricePrediction {
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
  data_points: number;
  recommendation: string;
  method: string;
}

export interface AiVendorScore {
  vendor_id: number;
  vendor_name: string;
  bid_price: number;
  total_score: number;
  breakdown: { price_score: number; winrate_score: number; rating_score: number; exp_score: number; win_rate_pct: number; avg_rating: number };
  recommendation: string;
}

export interface AiAnomalyResult {
  anomaly_score: number;
  is_anomaly: boolean;
  z_score: number;
  hps_ratio: number;
  reason: string;
  flag: string;
}

export interface AiTenderAnalysis {
  tender_id: number;
  tender_title: string;
  hps: number;
  bid_count: number;
  price_prediction: AiPricePrediction;
  vendor_ranking: AiVendorScore[];
  anomaly_report: (AiAnomalyResult & { vendor_name: string; bid_price: number })[];
  anomaly_flags: number;
  ai_recommendation: string;
  analysis_at: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  predictPrice(category: string, hps: number): Observable<{ data: AiPricePrediction }> {
    return this.http.post<any>(`${this.api}/ai/predict-price`, { category, hps });
  }

  detectAnomaly(tenderId: number, bidPrice: number): Observable<{ data: AiAnomalyResult }> {
    return this.http.post<any>(`${this.api}/ai/detect-anomaly`, { tender_id: tenderId, bid_price: bidPrice });
  }

  scoreVendors(tenderId: number): Observable<{ data: AiVendorScore[] }> {
    return this.http.get<any>(`${this.api}/ai/score-vendors/${tenderId}`);
  }

  analyzeTender(tenderId: number): Observable<{ data: AiTenderAnalysis }> {
    return this.http.get<any>(`${this.api}/ai/analyze/${tenderId}`);
  }
}
