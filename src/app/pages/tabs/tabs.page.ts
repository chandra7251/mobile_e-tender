import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  activeTab: string = 'home';
  private routerSub!: Subscription;

  constructor(private router: Router) { }

  ngOnInit() {
    this.updateActiveTab(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveTab(event.urlAfterRedirects || event.url);
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateActiveTab(url: string) {
    if (url.includes('/tabs/home')) {
      this.activeTab = 'home';
    } else if (url.includes('/tabs/tenders')) {
      this.activeTab = 'tenders';
    } else if (url.includes('/tabs/results')) {
      this.activeTab = 'results';
    } else if (url.includes('/tabs/profile')) {
      this.activeTab = 'profile';
    } else if (url.includes('/tabs/documents')) {
      this.activeTab = 'documents';
    }
  }

  get themeClass(): string {
    if (this.activeTab === 'home' || this.activeTab === 'results' || this.activeTab === 'documents') {
      return 'theme-blue';
    }
    return 'theme-white';
  }
}

