import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NetworkService } from '../../core/services/network.service';
@Component({
  selector: 'app-offline-banner',
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.scss'],
  standalone: false,
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  isOffline = false;
  private sub?: Subscription;
  constructor(private networkService: NetworkService) {}
  ngOnInit(): void {
    this.sub = this.networkService.isOnline$.subscribe(online => {
      this.isOffline = !online;
    });
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
