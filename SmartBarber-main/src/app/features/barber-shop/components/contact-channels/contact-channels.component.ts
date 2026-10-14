import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-channels',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-channels.component.html',
  styleUrls: ['./contact-channels.component.css']
})
export class ContactChannelsComponent implements OnInit {
  contactForm!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      whatsapp: ['', [Validators.required, Validators.pattern(/^[0-9+ ]+$/)]],
      instagram: [''],
      facebook: [''],
      tiktok: [''],
      supportEmail: ['', [Validators.email]],
      website: ['']
    });
  }

  hasActiveLinks(): boolean {
    const values = this.contactForm.value;
    return Object.values(values).some(val => val && val.toString().trim().length > 0);
  }

  saveChannels(): void {
    if (this.contactForm.invalid) {
      alert('⚠️ Por favor verifica que los datos ingresados sean válidos.');
      return;
    }

    const payload = this.contactForm.value;
    console.log('🚀 [CANALES DE CONTACTO - PAYLOAD]:', JSON.stringify(payload, null, 2));
    alert('¡Canales de contacto y redes sociales guardados con éxito! 📱💈');
  }
}