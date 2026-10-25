import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Barbero } from '../../../models/reservation.model';

@Component({
  selector: 'app-barbero-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barbero-list.component.html',
  styleUrls: ['./barbero-list.component.css']
})
export class BarberoListComponent {
  @Input() barberos: Barbero[] = [];
  @Input() selected: Barbero | null = null;
  @Output() barberoSeleccionado = new EventEmitter<Barbero>();
}
