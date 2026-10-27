import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Barberia } from '../../../models/reservation.model';

@Component({
  selector: 'app-barberia-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barberia-selector.component.html',
  styleUrls: ['./barberia-selector.component.css']
})
export class BarberiaSelectorComponent {
  @Input() barberias: Barberia[] = [];
  @Input() selectedId: string = '';
  @Output() barberiaChange = new EventEmitter<string>();
}
