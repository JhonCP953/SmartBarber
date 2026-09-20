import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionHeroComponent } from './subscription-hero.component';

describe('SubscriptionHeroComponent', () => {
  let component: SubscriptionHeroComponent;
  let fixture: ComponentFixture<SubscriptionHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
