import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionComponent } from './subscription.component';
import { SubscriptionWsService } from '../../infrastructure/subscription-ws.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jasmine: any;

describe('SubscriptionComponent', () => {
  let component: SubscriptionComponent;
  let fixture: ComponentFixture<SubscriptionComponent>;
  let mockSubscriptionWsService: any;

  beforeEach(async () => {
    mockSubscriptionWsService = {
      getMessages: jasmine.createSpy('getMessages').and.returnValue(of({})),
      sendSubscription: jasmine.createSpy('sendSubscription')
    };

    await TestBed.configureTestingModule({
      imports: [SubscriptionComponent, FormsModule],
      providers: [
        { provide: SubscriptionWsService, useValue: mockSubscriptionWsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});