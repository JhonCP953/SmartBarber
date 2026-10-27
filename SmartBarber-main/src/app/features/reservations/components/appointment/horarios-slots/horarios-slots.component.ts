import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotHorario } from '../../../models/reservation.model';

@Component({
  selector: 'app-horarios-slots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horarios-slots.component.html',
  styleUrls: ['./horarios-slots.component.css']
})
export class HorariosSlotsComponent {
  @Input() selectedFecha: string = '';
  @Input() selectedHora: string = '';
  @Input() slots: SlotHorario[] = [];
  @Input() loading: boolean = false;
  @Input() error: string = '';
  @Output() horaSeleccionada = new EventEmitter<SlotHorario>();
}
