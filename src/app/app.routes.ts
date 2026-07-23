import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
export const routes: Routes = [
 {path:'login',loadComponent:()=>import('./pages/login.page').then(m=>m.LoginPage)},
 {path:'',canActivate:[authGuard],loadComponent:()=>import('./pages/tabs.page').then(m=>m.TabsPage),children:[
  {path:'inicio',loadComponent:()=>import('./pages/home.page').then(m=>m.HomePage)},
  {path:'lugares',loadComponent:()=>import('./pages/locations.page').then(m=>m.LocationsPage)},
  {path:'cajas',loadComponent:()=>import('./pages/boxes.page').then(m=>m.BoxesPage)},
  {path:'objetos',loadComponent:()=>import('./pages/items.page').then(m=>m.ItemsPage)},
  {path:'papelera',loadComponent:()=>import('./pages/trash.page').then(m=>m.TrashPage)},
  {path:'',pathMatch:'full',redirectTo:'inicio'}
 ]},
 {path:'**',redirectTo:''}
];
