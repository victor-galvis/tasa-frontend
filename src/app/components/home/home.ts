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

    // SWIPER BANNER
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
            el: '.banner-swiper .swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.banner-swiper .swiper-button-next',
            prevEl: '.banner-swiper .swiper-button-prev',
          },
          speed: 600,
          grabCursor: true,
        });

      } catch (error) {
        console.error('Error iniciando banner swiper', error);
      }
    }

    // SWIPER VIDEOS
    const videos = document.querySelector('.video-swiper');

    if (videos) {
      new Swiper('.video-swiper', {
        modules: [Pagination, Navigation],
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        pagination: {
          el: '.video-swiper .swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.video-swiper .swiper-button-next',
          prevEl: '.video-swiper .swiper-button-prev',
        },
        speed: 600,
      });
    }

  }
}
