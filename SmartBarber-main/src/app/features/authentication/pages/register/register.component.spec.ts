import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';

import { FirebaseAuthService } from '../../../../core/auth/services/firebase-auth.service';

import { RegisterClientUseCase } from '../../application/use-cases/register-client.use-case';

describe('RegisterComponent', () => {

  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const firebaseAuthMock = {
    getCurrentUser: jasmine.createSpy('getCurrentUser'),
    signInWithGoogle: jasmine.createSpy('signInWithGoogle')
  };

  const registerClientMock = {
    execute: jasmine.createSpy('execute')
  };

  beforeEach(async () => {

    firebaseAuthMock.getCurrentUser.and.returnValue(null);

    await TestBed.configureTestingModule({

      imports: [
        RegisterComponent
      ],

      providers: [

        {
          provide: FirebaseAuthService,
          useValue: firebaseAuthMock
        },

        {
          provide: RegisterClientUseCase,
          useValue: registerClientMock
        }

      ]

    }).compileComponents();

    fixture =
      TestBed.createComponent(RegisterComponent);

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

  it('should start without an authenticated user', () => {

    expect(component.currentUser()).toBeNull();

  });

  it('should not allow client registration without Google authentication', () => {

    component.submitClientRegistration();

    expect(
      registerClientMock.execute
    ).not.toHaveBeenCalled();

    expect(
      component.errorMessage()
    ).toContain('Google');

  });

  it('should mark the form as invalid when required fields are missing', () => {

    component.clientForm.reset();

    expect(
      component.clientForm.invalid
    ).toBeTrue();

  });

});