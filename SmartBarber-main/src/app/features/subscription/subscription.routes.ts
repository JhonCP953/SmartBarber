import { Routes } from '@angular/router';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { MySubscriptionComponent } from './components/my-subscription/my-subscription.component';


export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    component: SubscriptionComponent, 
    children: [
      {
        path: '', 
        component: MySubscriptionComponent  
      },
      {
        path: 'my-subscription', 
        component: MySubscriptionComponent 
      }
    ]
  }
];