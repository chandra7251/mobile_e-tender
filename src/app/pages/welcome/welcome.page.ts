import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

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

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // Listener for scroll to update pagination dots
    this.sliderContainer.nativeElement.addEventListener('scroll', () => {
      const scrollLeft = this.sliderContainer.nativeElement.scrollLeft;
      const width = this.sliderContainer.nativeElement.offsetWidth;
      this.currentSlide = Math.round(scrollLeft / width);
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
