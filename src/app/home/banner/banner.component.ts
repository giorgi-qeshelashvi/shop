import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface BannerPhoto {
  image: string;
  alt: string;
}

interface BannerSlides {
  photos: BannerPhoto[];
}

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './banner.component.css',
})
export class BannerComponent implements OnDestroy {
  photos = signal<BannerPhoto[]>([]);
  currentIndex = signal(0);
  private slideInterval?: ReturnType<typeof setInterval>;

  constructor(private http: HttpClient) {
    this.http
      .get<BannerSlides>('/banner-slides.json')
      .subscribe(({ photos }) => {
        this.photos.set(photos);
        if (photos.length > 1) {
          this.slideInterval = setInterval(() => this.nextSlide(), 6000);
        }
      });
  }

  currentPhoto(): BannerPhoto | undefined {
    return this.photos()[this.currentIndex()];
  }

  nextSlide(): void {
    const count = this.photos().length;
    if (count > 1) {
      this.currentIndex.update((index) => (index + 1) % count);
    }
  }

  previousSlide(): void {
    const count = this.photos().length;
    if (count > 1) {
      this.currentIndex.update((index) => (index - 1 + count) % count);
    }
  }

  onImageError(event: Event): void {
    const image = event.target;
    if (image instanceof HTMLImageElement) {
      image.src = '/nophoto.jpg';
    }
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
}
