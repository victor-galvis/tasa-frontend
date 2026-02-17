import { Component, AfterViewInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit {

  
  mostrarPopupImagen: boolean = false;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {

      
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.initSwiper();
        }, 100);
      });

      
      setTimeout(() => {
        this.mostrarPopupImagen = true;
      }, 1000);
    }
  }

  
  cerrarPopupImagen() {
    this.mostrarPopupImagen = false;
  }

  initSwiper() {
    const swiperElement = document.querySelector('.banner-swiper');
    
    if (swiperElement) {
      try {
        new Swiper('.banner-swiper', {
          modules: [Autoplay, Pagination, Navigation],
          slidesPerView: 1,
          spaceBetween: 0,
          loop: true,
          autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          speed: 600,
          grabCursor: true,
        });
        console.log('');
      } catch (error) {
        console.error('', error);
      }
    } else {
      console.warn('');
    }
  }
}
