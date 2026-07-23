import { Injectable } from '@angular/core'; import { createClient, SupabaseClient } from '@supabase/supabase-js'; import { environment } from '../../environments/environment';

const localAuthLock = async <T>(_name:string,_timeout:number,fn:()=>Promise<T>) => {
  return await fn();
};

@Injectable({providedIn:'root'}) export class SupabaseService { readonly client:SupabaseClient=createClient(environment.supabaseUrl,environment.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:localAuthLock,skipAutoInitialize:true}}); }
