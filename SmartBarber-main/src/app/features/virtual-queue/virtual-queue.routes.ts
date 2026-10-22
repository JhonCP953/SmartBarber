import {Routes} from '@angular/router';

export const VIRTUAL_QUEUE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/virtual-quee.component')
        .then(m => m.VirtualQueueComponent)
  }
];