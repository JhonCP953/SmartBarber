import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationPoliciesComponent } from './cancellation-policies.component';

describe('CancellationPoliciesComponent', () => {
  let component: CancellationPoliciesComponent;
  let fixture: ComponentFixture<CancellationPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancellationPoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancellationPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
