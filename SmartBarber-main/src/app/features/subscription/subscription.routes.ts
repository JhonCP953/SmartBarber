import { Routes } from '@angular/router';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { MySubscriptionComponent } from './components/my-subscription/my-subscription.component';
// Si tienes un componente para la lista de planes, impórtalo aquí (ej: ListPlansComponent)
// O si prefieres mantener los planes en un componente propio:

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    component: SubscriptionComponent, // Contenedor principal con <router-outlet>
    children: [
      {
        path: '', 
        component: MySubscriptionComponent // O el componente que muestra la lista de planes por defecto en /subscription
      },
      {
        path: 'my-subscription', 
        component: MySubscriptionComponent // Muestra tu panel de suscripción en /subscription/my-subscription
      }
    ]
  }
];