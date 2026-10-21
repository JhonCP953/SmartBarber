import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SubscriptionStatusComponent } from './subscription-status.component';

describe('SubscriptionStatusComponent', () => {
  let component: SubscriptionStatusComponent;
  let fixture: ComponentFixture<SubscriptionStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionStatusComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should explain that the current subscription endpoint is unavailable', () => {
    expect(fixture.nativeElement.textContent).toContain(
      'El backend aún no expone la consulta de suscripción actual'
    );
  });
});
