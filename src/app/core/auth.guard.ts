import { inject } from '@angular/core'; import { CanActivateFn, Router } from '@angular/router'; import { AuthService } from './auth.service';
export const authGuard:CanActivateFn=async()=>{const a=inject(AuthService),r=inject(Router); try{await a.initialize();}catch{return r.parseUrl('/login');} return a.profile()?true:r.parseUrl('/login');};
