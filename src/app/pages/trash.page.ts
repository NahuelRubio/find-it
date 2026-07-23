import { Component, inject, signal } from '@angular/core';
import { IonButton, IonContent, IonHeader, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, cubeOutline, locationOutline, refreshOutline, trashOutline } from 'ionicons/icons';
import { DataService } from '../core/data.service';
import { EmptyStateComponent } from '../shared/ui.components';

@Component({
  standalone:true,
  imports:[IonButton,IonContent,IonHeader,IonIcon,IonToolbar,EmptyStateComponent],
  template:`
    <ion-header><ion-toolbar><div class="toolbar-title"><div><p class="eyebrow">Recuperable 30 días</p><h1>Papelera</h1></div></div></ion-toolbar></ion-header>
    <ion-content><main class="page-shell">
      @if(rows().length){<div class="notice"><ion-icon name="trash-outline"/><p>Estos elementos se eliminarán automáticamente al cumplir 30 días.</p></div><div class="fi-list">
        @for(x of rows();track x.table+x.id){<article class="fi-card trash-card"><span><ion-icon [name]="x.table==='items'?'cube-outline':x.table==='boxes'?'archive-outline':'location-outline'"/></span><div><small>{{x.kind}}</small><h2>{{x.name}}</h2><p>{{daysLeft(x.deleted_at)}} días restantes</p></div><ion-button fill="outline" (click)="restore(x.table,x.id)"><ion-icon name="refresh-outline" slot="start"/>Recuperar</ion-button></article>}
      </div>}@else{<app-empty-state title="La papelera está vacía" message="Los elementos que descartes aparecerán aquí y podrás recuperarlos durante 30 días." icon="trash-outline"/>}
    </main></ion-content>`,
  styles:[`
    .toolbar-title{width:min(100% - 32px,920px);height:82px;margin:auto;display:flex;align-items:center}.toolbar-title p,.toolbar-title h1{margin:0}.toolbar-title h1{font-size:1.6rem}.notice{display:flex;align-items:center;gap:12px;margin-bottom:18px;padding:13px 16px;border-radius:15px;background:color-mix(in srgb,var(--fi-warning) 12%,transparent);color:var(--fi-warning)}.notice p{margin:0;font-size:.8rem}
    .trash-card{display:grid;grid-template-columns:52px 1fr auto;align-items:center;gap:14px;padding:15px}.trash-card>span{width:52px;height:52px;display:grid;place-items:center;border-radius:16px;background:var(--fi-surface-2);color:var(--fi-muted);font-size:23px}.trash-card small{color:var(--fi-primary);font-weight:800}.trash-card h2{margin:2px 0;font-size:1rem}.trash-card p{margin:0;color:var(--fi-muted);font-size:.76rem}.trash-card ion-button{--border-radius:12px}
  `]
})
export class TrashPage{
  d=inject(DataService);rows=signal<any[]>([]);
  constructor(){addIcons({trashOutline,cubeOutline,archiveOutline,locationOutline,refreshOutline});this.load();}
  daysLeft(date:string){return Math.max(0,30-Math.floor((Date.now()-new Date(date).getTime())/86400000));}
  async load(){const[l,b,i]=await Promise.all([this.d.locations(true),this.d.boxes(true),this.d.items(true)]);this.rows.set([...l.filter(x=>x.deleted_at).map(x=>({...x,table:'locations',kind:'Ubicación'})),...b.filter(x=>x.deleted_at).map(x=>({...x,table:'boxes',kind:'Caja'})),...i.filter(x=>x.deleted_at).map(x=>({...x,table:'items',kind:'Objeto'}))]);}
  async restore(t:'locations'|'boxes'|'items',id:string){await this.d.restore(t,id);await this.load();}
}
