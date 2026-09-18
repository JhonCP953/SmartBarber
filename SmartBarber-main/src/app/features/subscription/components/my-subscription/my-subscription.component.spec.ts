import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionComponent } from './my-subscription.component';

declare const describe: (description: string, specDefinitions: () => void) => void;
declare const beforeEach: (action: () => void | Promise<void>) => void;
declare const it: (description: string, testFunction: () => void) => void;
declare const expect: (actual: unknown) => { toBeTruthy: () => void };

describe('MySubscriptionComponent', () => {
  let component: MySubscriptionComponent;
  let fixture: ComponentFixture<MySubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
