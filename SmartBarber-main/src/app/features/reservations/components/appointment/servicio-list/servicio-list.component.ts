import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../../models/reservation.model';

@Component({
  selector: 'app-servicio-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicio-list.component.html',
  styleUrls: ['./servicio-list.component.css']
})
export class ServicioListComponent {
  @Input() servicios: Servicio[] = [];
  @Input() selectedIds: number[] = [];
  @Input() loading: boolean = false;
  @Output() servicioToggle = new EventEmitter<Servicio>();

  isSelected(servicioId: number): boolean {
    return this.selectedIds.includes(servicioId);
  }
}
