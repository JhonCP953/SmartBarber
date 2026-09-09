import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BlogPost {
  tag: string;
  title: string;
  image?: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  posts: BlogPost[] = [
    { 
      tag: 'Cortes', 
      title: '5 cortes de tendencia para probar esta temporada',
      image: '/Sec8.1.jpg'
    },
    { 
      tag: 'Barba', 
      title: 'Cómo mantener tu barba sana entre visitas a la barbería',
      image: '/Sec8.2.jpg'
    },
    { 
      tag: 'Cuidado', 
      title: 'Rutina básica de cuidado facial para hombres',
      image: '/Sec8.3.jpg'
    }
  ];
}