import { Component, OnInit } from '@angular/core';
import { BarberShopApiService as BarberConfigApiService } from '../../infrastructure/services/barber-shop-api.service';
import { BarberiasRegistrosComponent } from './barberias-registros/barberias-registros.component';
import { HorariosAtencionComponent } from './horarios-atencion/horarios-atencion.component';
import { DiasFestivosComponent } from './dias-festivos/dias-festivos.component';

@Component({
  selector: 'app-barber-config',
  standalone: true,
  imports: [BarberiasRegistrosComponent, HorariosAtencionComponent, DiasFestivosComponent],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class BarberConfigComponent implements OnInit {
  // Estado compartido entre los 3 componentes hijos
  barberId = '';
  barberList: any[] = [];
  selectedBarberName = '';
  selectedEmpleadoUuid = '3d7792b5-3e1f-44c8-bf84-b766068b';
  selectedItem: any = null;

  constructor(private readonly configApiService: BarberConfigApiService) {}

  ngOnInit(): void {
    console.log('🔥 [FRONTEND] Inicializando BarberConfigComponent...');
    this.loadBarberList();
  }

  loadBarberList(): void {
    console.log('📡 [FRONTEND] Solicitando listado de EMPLEADOS...');

    this.configApiService.getEmpleados().subscribe({
      next: (res: any) => {
        console.log('📦 [BACKEND - RESPUESTA CRUD EMPLEADOS]:', res);

        if (!res) {
          this.barberList = [];
          return;
        }

        if (Array.isArray(res)) {
          this.barberList = res;
        } else if (res.data && Array.isArray(res.data)) {
          this.barberList = res.data;
        } else if (res.content && Array.isArray(res.content)) {
          this.barberList = res.content;
        } else {
          this.barberList = [res];
        }

        if (this.barberList.length > 0) {
          const firstItem = this.barberList[0];
          this.selectedEmpleadoUuid = String(
            firstItem.idEmpleado ??
            firstItem.id_empleado ??
            firstItem.uuid ??
            firstItem.id ?? ''
          );
        }
      },
      error: (err: any) => {
        console.error('❌ [BACKEND - ERROR AL CARGAR EMPLEADOS]:', err);
      }
    });
  }

  // Viene de la tabla (botón 🔍 o ✏️)
  onBarberiaSeleccionada(item: any): void {
    this.barberId = String(item.id_barberia ?? item.id ?? '');
    this.selectedBarberName = item.nombre ?? item.name ?? '';
    this.selectedEmpleadoUuid = String(item.id_empleado ?? item.uuid ?? item.id ?? '');
    this.selectedItem = item;
  }

  // Viene del selector "Sede Activa" (días festivos)
  onBarberSelectionChange(id: string): void {
    this.barberId = id;
    const found = this.barberList.find(b => String(b.id_barberia ?? b.id) === String(this.barberId));
    if (found) {
      this.selectedBarberName = found.nombre ?? found.name ?? '';
      this.selectedEmpleadoUuid = String(found.id_empleado ?? found.uuid ?? found.id ?? '');
      this.selectedItem = found;
    }
  }
}
