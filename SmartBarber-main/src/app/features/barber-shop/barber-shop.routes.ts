import { Routes } from '@angular/router';

export const BARBER_SHOP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/branch-register/branch-register.component')
        .then(m => m.BranchRegisterComponent)
  }
];