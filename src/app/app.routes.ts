import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { Product } from './pages/producto/producto';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: 'productos', component: Product },
      { path: '', redirectTo: 'productos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];