import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-register.component.html',
  styleUrl: './branch-register.component.css'
})
export class BranchRegisterComponent {
  branch = {
    name: '',
    city: '',
    address: '',
    phone: '',
    capacity: null,
    schedule: ''
  };

  branches: Array<any> = [
    {
      name: 'SmartBarber Principal',
      city: 'Bogotá',
      address: 'Calle 93 #13-45',
      phone: '310 987 6543',
      capacity: 6,
      schedule: 'Lun - Sáb: 9:00 AM - 8:00 PM'
    }
  ];

  onRegisterBranch() {
    if (this.branch.name && this.branch.address) {
      this.branches.push({ ...this.branch });
      alert(`¡Sucursal "${this.branch.name}" registrada con éxito!`);
      this.branch = {
        name: '',
        city: '',
        address: '',
        phone: '',
        capacity: null,
        schedule: ''
      };
    }
  }
}