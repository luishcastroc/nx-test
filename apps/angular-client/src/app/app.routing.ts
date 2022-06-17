import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  {
    path: '',
    children: [
      {
        path: 'list',
        loadChildren: () =>
          import('../app/modules/tickets/list/list.module').then(
            (m) => m.ListModule
          ),
      },
      {
        path: 'details',
        loadChildren: () =>
          import('../app/modules/tickets/details/details.module').then(
            (m) => m.DetailsModule
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'list' },
];
