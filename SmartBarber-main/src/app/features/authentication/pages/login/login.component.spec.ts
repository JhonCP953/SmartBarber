import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { LoginUseCase } from
    '../../application/use-cases/login.use-case';

describe('LoginComponent', () => {

    let fixture: ComponentFixture<LoginComponent>;

    const loginUseCaseMock = {
        execute: jasmine.createSpy()
    };

    const routerMock = {
        navigate: jasmine.createSpy()
    };

    beforeEach(async () => {

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                {
                    provide: LoginUseCase,
                    useValue: loginUseCaseMock
                },
                {
                    provide: Router,
                    useValue: routerMock
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        fixture.detectChanges();

        loginUseCaseMock.execute.calls.reset();
        routerMock.navigate.calls.reset();
    });

    it('should create the component', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should show an error when login fails', async () => {

        loginUseCaseMock.execute.and.rejectWith(
            new Error('USER_BLOCKED')
        );

        await fixture.componentInstance.loginWithGoogle();

        expect(fixture.componentInstance.errorMessage)
            .toContain('bloqueada');
    });

    it('should navigate after a successful client login', async () => {

        loginUseCaseMock.execute.and.resolveTo({
            userId: 'user-1',
            firebaseUid: 'firebase-1',
            email: 'client@test.com',
            displayName: 'Client',
            role: 'CLIENT',
            status: 'ACTIVE',
            tenantId: null,
            photoUrl: null
        });

        await fixture.componentInstance.loginWithGoogle();

        expect(routerMock.navigate)
            .toHaveBeenCalledWith(['/']);
    });

});