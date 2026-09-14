import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Barbershop {
  name: string;
  location: string;
  image: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent {

  barbershops: Barbershop[] = [
    {
      name: 'Barbería El Imperio',
      location: 'Bogotá, Colombia',
      image: 'Shop1.jpg'
    },
    {
      name: 'Viking Cut Studio',
      location: 'Medellín, Colombia',
      image: 'Shop2.jpg'
    },
    {
      name: 'Golden Blade Club',
      location: 'Cali, Colombia',
      image: 'Shop3.jpg'
    },
    {
      name: 'Master Barber Shop',
      location: 'Barranquilla, Colombia',
      image: 'Shop4.jpg'
    }
  ];

}