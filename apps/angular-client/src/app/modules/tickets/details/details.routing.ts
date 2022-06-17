import { Route } from '@angular/router';
import { DetailsComponent } from './details.component';

export const detailsRoutes: Route[] = [
  {
    path: ':id',
    component: DetailsComponent,
  },
  {
    path: '',
    redirectTo: '/list',
  },
];
