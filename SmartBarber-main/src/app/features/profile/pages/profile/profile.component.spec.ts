import {
    ComponentFixture,
    TestBed
} from '@angular/core/testing';

import {
    of,
    throwError
} from 'rxjs';

import {
    ProfileComponent
} from './profile.component';

import {
    GetProfileUseCase
} from '../../application/use-cases/get-profile.use-case';

import {
    UpdateProfileUseCase
} from '../../application/use-cases/update-profile.use-case';

import {
    SessionService
} from '../../../../core/auth/services/session.service';


const clientProfile = {

    userId: 'user-1',

    firebaseUid: 'firebase-1',

    email: 'client@test.com',

    displayName: 'Test Client',

    role: 'CLIENT' as const,

    status: 'ACTIVE' as const,

    tenantId: null,

    photoUrl: null,

    clientId: 'client-1',

    barberId: null,

    barbershopId: null,

    barbershopName: null,

    document: '1234567890',

    documentType: 'CC',

    name: 'Test Client',

    cell: '3001234567'
};


describe(
    'ProfileComponent',
    () => {

        let component:
            ProfileComponent;

        let fixture:
            ComponentFixture<ProfileComponent>;

        let getProfileUseCase:
            jasmine.SpyObj<GetProfileUseCase>;

        let updateProfileUseCase:
            jasmine.SpyObj<UpdateProfileUseCase>;


        beforeEach(
            async () => {

                getProfileUseCase =
                    jasmine.createSpyObj(
                        'GetProfileUseCase',
                        ['execute']
                    );


                updateProfileUseCase =
                    jasmine.createSpyObj(
                        'UpdateProfileUseCase',
                        ['execute']
                    );


                await TestBed
                    .configureTestingModule({

                        imports: [
                            ProfileComponent
                        ],

                        providers: [

                            {
                                provide:
                                    GetProfileUseCase,

                                useValue:
                                    getProfileUseCase
                            },

                            {
                                provide:
                                    UpdateProfileUseCase,

                                useValue:
                                    updateProfileUseCase
                            },

                            SessionService
                        ]

                    })
                    .compileComponents();


                fixture =
                    TestBed.createComponent(
                        ProfileComponent
                    );

                component =
                    fixture.componentInstance;
            }
        );


        it(
            'should create',
            () => {

                expect(
                    component
                ).toBeTruthy();
            }
        );


        it(
            'should load the authenticated profile',
            () => {

                getProfileUseCase
                    .execute
                    .and.returnValue(
                        of(clientProfile)
                    );


                component.ngOnInit();


                expect(
                    component.profile()
                ).toEqual(
                    clientProfile
                );


                expect(
                    component.loading()
                ).toBeFalse();


                expect(
                    component.errorMessage()
                ).toBe('');
            }
        );


        it(
            'should show an error when the profile cannot be loaded',
            () => {

                getProfileUseCase
                    .execute
                    .and.returnValue(
                        throwError(
                            () => ({
                                status: 500
                            })
                        )
                    );


                component.ngOnInit();


                expect(
                    component.profile()
                ).toBeNull();


                expect(
                    component.loading()
                ).toBeFalse();


                expect(
                    component.errorMessage()
                ).toContain(
                    'El servidor no pudo cargar tu perfil'
                );
            }
        );


        it(
            'should allow editing for a client',
            () => {

                component.profile.set(
                    clientProfile
                );


                component.startEditing();


                expect(
                    component.editing()
                ).toBeTrue();


                expect(
                    component
                        .profileForm
                        .controls
                        .name
                        .value
                ).toBe(
                    'Test Client'
                );


                expect(
                    component
                        .profileForm
                        .controls
                        .cell
                        .value
                ).toBe(
                    '3001234567'
                );
            }
        );


        it(
            'should not allow editing for an administrator',
            () => {

                component.profile.set({

                    ...clientProfile,

                    role: 'ADMIN',

                    clientId: null
                });


                component.startEditing();


                expect(
                    component.editing()
                ).toBeFalse();


                expect(
                    component.canEditProfile()
                ).toBeFalse();
            }
        );
    }
);