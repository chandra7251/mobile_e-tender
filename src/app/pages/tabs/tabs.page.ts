import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Keyboard } from '@capacitor/keyboard';
import { Platform } from '@ionic/angular';
@Component({
  standalone: false,
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  activeTab: string = 'home';
  isKeyboardOpen: boolean = false;
  private routerSub!: Subscription;
  constructor(private router: Router, private platform: Platform) { }
  ngOnInit() {
    this.updateActiveTab(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveTab(event.urlAfterRedirects || event.url);
    });
    if (this.platform.is('capacitor')) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.isKeyboardOpen = true;
      });
      Keyboard.addListener('keyboardWillHide', () => {
        this.isKeyboardOpen = false;
      });
    }
  }
  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    if (this.platform.is('capacitor')) {
      Keyboard.removeAllListeners();
    }
  }
  private updateActiveTab(url: string) {
    if (url.includes('/tabs/home')) {
      this.activeTab = 'home';
    } else if (url.includes('/tabs/tenders')) {
      this.activeTab = 'tenders';
    } else if (url.includes('/tabs/pengajuan-tender')) {
      this.activeTab = 'pengajuan-tender';
    } else if (url.includes('/tabs/results')) {
      this.activeTab = 'results';
    } else if (url.includes('/tabs/profile')) {
      this.activeTab = 'profile';
    } else if (url.includes('/tabs/documents')) {
      this.activeTab = 'documents';
    }
  }
  get themeClass(): string {
    return 'theme-navy';
  }
}
