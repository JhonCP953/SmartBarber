import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent {
  teamMembers: TeamMember[] = [
    {
      name: 'Camilo Rey',
      role: 'BARBERO PRINCIPAL',
      image: 'Camilo.jpg'
    },
    {
      name: 'Julián Prieto',
      role: 'BARBERO',
      image: 'Julian.jpg'
    },
    {
      name: 'Andrés Villa',
      role: 'BARBERO SENIOR',
      image: 'Andres.jpg'
    },
    {
      name: 'Mariana Cote',
      role: 'ESTILISTA',
      image: 'Mario.jpg' 
    }
  ];
}