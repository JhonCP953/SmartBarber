import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionFaqComponent } from './subscription-faq.component';

describe('SubscriptionFaqComponent', () => {
  let component: SubscriptionFaqComponent;
  let fixture: ComponentFixture<SubscriptionFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionFaqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
