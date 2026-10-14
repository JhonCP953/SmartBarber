import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cancellation-policies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cancellation-policies.component.html',
  styleUrls: ['./cancellation-policies.component.css']
})
export class CancellationPoliciesComponent implements OnInit {
  policyForm!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.policyForm = this.fb.group({
      minCancellationHours: [2, [Validators.required, Validators.min(0)]],
      applyNoShowFee: [false],
      penaltyPercentage: [0, [Validators.min(0), Validators.max(100)]],
      allowReschedule: [true],
      rescheduleLimitHours: [4, [Validators.required, Validators.min(0)]]
    });
  }

  savePolicies(): void {
    if (this.policyForm.invalid) {
      alert('⚠️ Por favor completa los campos requeridos correctamente.');
      return;
    }

    const payload = this.policyForm.value;
    console.log('🚀 [POLÍTICAS CANCELACIÓN - PAYLOAD]:', JSON.stringify(payload, null, 2));
    alert('¡Políticas de cancelación guardadas con éxito! 🎉');
  }
}