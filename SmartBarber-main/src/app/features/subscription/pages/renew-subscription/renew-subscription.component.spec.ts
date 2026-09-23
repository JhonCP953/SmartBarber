import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RenewSubscriptionComponent } from './renew-subscription.component';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

import { GetCurrentSubscriptionUseCase } from '../../application/use-cases/get-current-subscription.use-case';
import { RenewSubscriptionUseCase } from '../../application/use-cases/renew-subscription.use-case';

import {
    CurrentSubscription
} from '../../domain/models/current-subscription.model';

import {
    RenewSubscriptionResponse
} from '../../domain/models/renew-subscription.model';

describe('RenewSubscriptionComponent', () => {

    let component: RenewSubscriptionComponent;
    let fixture: ComponentFixture<RenewSubscriptionComponent>;

    let repositoryMock: jasmine.SpyObj<SubscriptionRepository>;

    const subscriptionMock: CurrentSubscription = {
        id: 'sub-001',
        status: 'ACTIVE',
        startDate: '2026-08-01',
        renewalDate: '2026-09-30',
        plan: {
            id: 'basic',
            name: 'Basic',
            price: 60000,
            currency: 'COP',
            features: [
                'Basic subscription management',
                'Reservation management'
            ]
        }
    };

    beforeEach(async () => {

        repositoryMock = jasmine.createSpyObj(
            'SubscriptionRepository',
            [
                'getCurrentSubscription',
                'getAvailablePlans',
                'changePlan',
                'cancelSubscription',
                'renewSubscription'
            ]
        );

        repositoryMock.getCurrentSubscription.and.returnValue(
            of(subscriptionMock)
        );

        await TestBed.configureTestingModule({
            imports: [RenewSubscriptionComponent],

            providers: [
                {
                    provide: SubscriptionRepository,
                    useValue: repositoryMock
                },

                GetCurrentSubscriptionUseCase,
                RenewSubscriptionUseCase
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(
            RenewSubscriptionComponent
        );

        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should load the current subscription', () => {

        expect(
            component.currentSubscription()
        ).toEqual(subscriptionMock);

        expect(
            repositoryMock.getCurrentSubscription
        ).toHaveBeenCalled();
    });

    it('should display the current plan information', () => {

        expect(
            component.planName()
        ).toBe('Basic');

        expect(
            component.renewalCost()
        ).toBe(60000);

        expect(
            component.expirationDate()
        ).toBe('2026-09-30');
    });

    it('should allow renewal for an active subscription', () => {

        expect(
            component.renewalAvailable()
        ).toBeTrue();
    });

    it('should change to processing state when renewal starts', () => {

        const response: RenewSubscriptionResponse = {
            subscriptionId: 'sub-001',
            paymentUrl: 'https://payment.example/checkout',
            status: 'PENDING_PAYMENT',
            message: 'Renewal payment initiated.'
        };

        repositoryMock.renewSubscription.and.returnValue(
            of(response)
        );

        spyOn(window.location, 'assign')
            .and.stub();

        component.renewSubscription();

        expect(
            component.processStatus()
        ).toBe('REDIRECTING');

        expect(
            window.location.assign
        ).toHaveBeenCalledWith(
            'https://payment.example/checkout'
        );
    });

    it('should show success when renewal is confirmed', () => {

        const renewedSubscription: CurrentSubscription = {
            ...subscriptionMock,
            renewalDate: '2027-09-30'
        };

        const response: RenewSubscriptionResponse = {
            subscriptionId: 'sub-001',
            paymentUrl: '',
            status: 'RENEWED',
            subscription: renewedSubscription,
            paymentReference: 'PAY-001',
            message: 'Subscription renewed successfully.'
        };

        repositoryMock.renewSubscription.and.returnValue(
            of(response)
        );

        component.renewSubscription();

        expect(
            component.processStatus()
        ).toBe('SUCCESS');

        expect(
            component.currentSubscription()
        ).toEqual(renewedSubscription);

        expect(
            component.paymentReference()
        ).toBe('PAY-001');

        expect(
            component.confirmationMessage()
        ).toBe(
            'Subscription renewed successfully.'
        );
    });

    it('should handle renewal errors', () => {

        repositoryMock.renewSubscription.and.returnValue(
            throwError(() => ({
                error: {
                    message: 'The payment could not be completed.'
                }
            }))
        );

        component.renewSubscription();

        expect(
            component.processStatus()
        ).toBe('ERROR');

        expect(
            component.errorMessage()
        ).toBe(
            'The payment could not be completed.'
        );
    });

    it('should not renew when there is no subscription', () => {

        component.currentSubscription.set(null);

        component.renewSubscription();

        expect(
            repositoryMock.renewSubscription
        ).not.toHaveBeenCalled();
    });

});