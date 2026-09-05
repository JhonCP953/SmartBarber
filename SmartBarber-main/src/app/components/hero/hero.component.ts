import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  // Arreglo con las URLs de las fotos del carrusel
  images: string[] = [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1920'
  ];

  // slideCount toma automáticamente la cantidad de imágenes definidas
  slideCount = this.images.length;
  currentSlide = 0;
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private startAutoplay(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.next(), 5000); // cambia cada 5 segundos
  }

  next(): void {
    this.goTo(this.currentSlide + 1);
  }

  prev(): void {
    this.goTo(this.currentSlide - 1);
  }

  goTo(index: number): void {
    this.currentSlide = (index + this.slideCount) % this.slideCount;
    this.startAutoplay(); // La interacción manual reinicia el temporizador
  }

  slideIndexes(): number[] {
    return Array.from({ length: this.slideCount }, (_, i) => i);
  }
}