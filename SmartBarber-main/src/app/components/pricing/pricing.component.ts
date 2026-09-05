import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PriceItem {
  name: string;
  price: string;
  description: string;
}

interface PriceCategory {
  category: string;
  items: PriceItem[];
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent {
  // Extend here: add a category, or push a new item into an existing
  // category's `items` array — the grid and dotted rows render automatically.
  categories: PriceCategory[] = [
    {
      category: 'Cabello',
      items: [
        { name: 'Corte de cabello', price: '$35.000', description: 'Corte a tijera o máquina con acabado y asesoría según tu tipo de rostro.' },
        { name: 'Peinado de estilo', price: '$40.000', description: 'Diseño de peinado con productos de fijación para el día a día o eventos.' },
        { name: 'Recorte de puntas', price: '$45.000', description: 'Mantenimiento del corte sin perder el largo, ideal cada 3-4 semanas.' }
      ]
    },
    {
      category: 'Afeitado',
      items: [
        { name: 'Afeitado clásico', price: '$35.000', description: 'Afeitado a navaja con toallas calientes para un acabado impecable.' },
        { name: 'Arreglo de barba', price: '$40.000', description: 'Perfilado y forma con aceites hidratantes para dejarla suave y prolija.' },
        { name: 'Afeitado suave', price: '$45.000', description: 'Técnica tradicional pensada para pieles sensibles, sin irritación.' }
      ]
    },
    {
      category: 'Rostro',
      items: [
        { name: 'Facial básico', price: '$35.000', description: 'Limpieza superficial para refrescar la piel después del corte.' },
        { name: 'Limpieza profunda', price: '$40.000', description: 'Exfoliación y mascarilla para eliminar impurezas y puntos negros.' },
        { name: 'Tratamiento premium', price: '$50.000', description: 'Rutina completa con masaje facial y productos de alta gama.' }
      ]
    }
  ];
}
