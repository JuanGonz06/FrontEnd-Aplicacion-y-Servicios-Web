import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { Product } from './pages/producto/producto';
import { Mascotas } from './pages/mascota/mascota';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: 'productos', component: Product },
      { path: 'mascotas', component: Mascotas },
      { path: '', redirectTo: 'productos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];