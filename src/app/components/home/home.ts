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
    }
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
        console.log('✅ Swiper inicializado correctamente fuera de la zona de Angular');
      } catch (error) {
        console.error('❌ Error al inicializar Swiper:', error);
      }
    } else {
      console.warn('⚠️ No se encontró el elemento .banner-swiper');
    }
  }
}