import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dias-festivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dias-festivos.component.html',
  styleUrls: ['../shared/vintage-shared.css', './dias-festivos.component.css']
})
export class DiasFestivosComponent {
  @Input() barberList: any[] = [];

  holidays: any[] = [];
  newHolidayDate = '';
  newHolidayDesc = '';

  addHoliday(): void {
    if (!this.newHolidayDate) {
      alert('Por favor selecciona una fecha válida.');
      return;
    }

    const holidayItem = {
      id: Date.now(),
      fecha: this.newHolidayDate,
      descripcion: this.newHolidayDesc
    };

    this.holidays.push(holidayItem);
    this.newHolidayDate = '';
    this.newHolidayDesc = '';
  }

  removeHoliday(id: number | string): void {
    this.holidays = this.holidays.filter(h => h.id !== id);
  }
}
