import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements AfterViewInit {
  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef;
  
  public currentSlide = 0;
  public totalSlides = 4;

  private backButtonSub?: Subscription;

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private platform: Platform
  ) {}

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, (processNextHandler) => {
      if (this.currentSlide > 0) {
        this.prevSlide();
      } else {
        processNextHandler(); // Lanjut ke global handler untuk validasi keluar aplikasi
      }
    });
  }

  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    // Listener for scroll to update pagination dots
    this.sliderContainer.nativeElement.addEventListener('scroll', () => {
      const scrollLeft = this.sliderContainer.nativeElement.scrollLeft;
      const width = this.sliderContainer.nativeElement.offsetWidth;
      const newSlide = Math.round(scrollLeft / width);
      
      if (this.currentSlide !== newSlide) {
        this.currentSlide = newSlide;
        this.cdr.detectChanges(); // Paksa Angular update tampilan class dot
      }
    });
  }

  public nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.scrollToSlide(this.currentSlide);
    }
  }

  public prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.scrollToSlide(this.currentSlide);
    }
  }

  private scrollToSlide(index: number) {
    const width = this.sliderContainer.nativeElement.offsetWidth;
    this.sliderContainer.nativeElement.scrollTo({
      left: width * index,
      behavior: 'smooth'
    });
  }

  public isTermsChecked = false;

  public skipToLastSlide() {
    this.currentSlide = this.totalSlides - 1;
    this.scrollToSlide(this.currentSlide);
  }

  public async goToLogin() {
    await Preferences.set({ key: 'hasSeenIntro', value: 'true' });
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  public async goToRegister() {
    await Preferences.set({ key: 'hasSeenIntro', value: 'true' });
    this.router.navigateByUrl('/register', { replaceUrl: true });
  }
}
