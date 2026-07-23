import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonSelect,IonSelectOption,IonTextarea,IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cameraOutline, cubeOutline, peopleOutline, personOutline, trashOutline } from 'ionicons/icons';
import { DataService } from '../core/data.service';
import { Box, Location, Owner } from '../core/models';
import { EmptyStateComponent, OwnerSelectorComponent } from '../shared/ui.components';

@Component({
  standalone:true,
  imports:[FormsModule,IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonSelect,IonSelectOption,IonTextarea,IonToolbar,EmptyStateComponent,OwnerSelectorComponent],
  template:`
  <ion-header><ion-toolbar><div class="toolbar-title"><div><p class="eyebrow">Todo lo que guardas</p><h1>Objetos</h1></div><span>{{rows().length}}</span></div></ion-toolbar></ion-header>
  <ion-content><main class="page-shell">
    @if(rows().length){<div class="fi-grid">@for(x of rows();track x.id){<article class="fi-card item-card">
      <div class="item-photo">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="cube-outline"/>}</div>
      <div class="item-body"><div class="meta-row"><span class="fi-chip">{{x.category||'Otros'}}</span><span class="fi-chip"><ion-icon [name]="x.owner==='Compartido'?'people-outline':'person-outline'"/>{{x.owner}}</span></div><h2>{{x.name}}</h2><p>{{x.description||'Sin descripción'}}</p><div class="path">{{placeName(x)}}<ion-button type="button" class="danger-quiet" fill="clear" (click)="del(x.id)" [disabled]="busy()" aria-label="Enviar a papelera"><ion-icon name="trash-outline"/></ion-button></div></div>
    </article>}</div>}@else{<app-empty-state title="Añade tu primer objeto" message="Ponle nombre, indica dónde está y la próxima vez lo encontrarás en segundos." action="Añadir objeto" icon="cube-outline" (pressed)="open=true"/>}
    <ion-fab class="fi-fab" slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button (click)="open=true"><ion-icon name="add"/></ion-fab-button></ion-fab>
  </main>
  <ion-modal [isOpen]="open" (didDismiss)="open=false"><ng-template><ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="open=false">Cancelar</ion-button></ion-buttons><b>Nuevo objeto</b><span></span></div></ion-toolbar></ion-header>
    <ion-content><div class="form-sheet">
      <div class="form-section"><h3>Información</h3><ion-input label="Nombre" labelPlacement="stacked" placeholder="Ej. Adaptador HDMI" [(ngModel)]="name"/><ion-textarea label="Descripción" labelPlacement="stacked" autoGrow="true" placeholder="Detalles que te ayuden a reconocerlo" [(ngModel)]="description"/><ion-select label="Categoría" labelPlacement="stacked" [(ngModel)]="category">@for(c of d.categories;track c){<ion-select-option [value]="c">{{c}}</ion-select-option>}</ion-select></div>
      <div class="form-section"><h3>Ubicación</h3><ion-select label="Caja" labelPlacement="stacked" [(ngModel)]="box"><ion-select-option [value]="null">Sin caja</ion-select-option>@for(b of boxes();track b.id){<ion-select-option [value]="b.id">{{b.name}}</ion-select-option>}</ion-select><ion-select label="Ubicación directa" labelPlacement="stacked" [(ngModel)]="location" [disabled]="!!box"><ion-select-option [value]="null">Sin ubicación directa</ion-select-option>@for(l of locations();track l.id){<ion-select-option [value]="l.id">{{l.name}}</ion-select-option>}</ion-select></div>
      <div class="form-section"><h3>Fotografía</h3><label class="photo-input"><ion-icon name="camera-outline"/> {{file?.name||'Hacer foto o elegir archivo'}}<input hidden type="file" accept="image/*" capture="environment" (change)="pick($event)"></label></div>
      <div class="form-section"><h3>Propiedad</h3><app-owner-selector [value]="owner" (valueChange)="owner=$event"/></div>
      @if(error()) { <p class="error-note">{{ error() }}</p> }
      <ion-button type="button" class="primary-action" expand="block" (click)="save()" [disabled]="busy() || !name.trim()">{{ busy() ? 'Guardando...' : 'Guardar objeto' }}</ion-button>
    </div></ion-content>
  </ng-template></ion-modal></ion-content>`,
  styles:[`
    .toolbar-title{width:min(100% - 32px,920px);height:82px;margin:auto;display:flex;align-items:center;justify-content:space-between}.toolbar-title p,.toolbar-title h1{margin:0}.toolbar-title h1{font-size:1.6rem}.toolbar-title>span{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary);font-weight:800}
    .item-card{display:grid;grid-template-columns:118px 1fr;min-height:176px}.item-photo{display:grid;place-items:center;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:40px;overflow:hidden}.item-photo img{width:100%;height:100%;object-fit:cover}.item-body{min-width:0;padding:16px}.item-body h2{margin:10px 0 5px;font-size:1.05rem}.item-body>p{height:38px;margin:0;color:var(--fi-muted);font-size:.8rem;line-height:1.45;overflow:hidden}.path{display:flex;align-items:center;justify-content:space-between;margin-top:7px;color:var(--fi-primary);font-size:.73rem;font-weight:700}.path ion-button{margin:-8px}.modal-title{height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.photo-input ion-icon{vertical-align:-2px;margin-right:7px}
  `]
})
export class ItemsPage{
  d=inject(DataService);private route=inject(ActivatedRoute);rows=signal<any[]>([]);locations=signal<Location[]>([]);boxes=signal<Box[]>([]);busy=signal(false);error=signal('');open=false;name='';description='';category='Otros';owner:Owner='Compartido';location:string|null=null;box:string|null=null;file?:File;
  constructor(){addIcons({add,trashOutline,cubeOutline,cameraOutline,personOutline,peopleOutline});this.route.queryParamMap.subscribe(params=>{this.open=params.get('nuevo')==='1';});this.load();}
  placeName(x:any){return x.box_id?'En '+(this.boxes().find(b=>b.id===x.box_id)?.name||'una caja'):x.location_id?this.locations().find(l=>l.id===x.location_id)?.name||'Ubicación':'Sin ubicación';}
  async load(){const[i,l,b]=await Promise.all([this.d.items(),this.d.locations(),this.d.boxes()]);this.locations.set(l);this.boxes.set(b);this.rows.set(await Promise.all(i.map(async x=>({...x,url:await this.d.signed(x.photo_path)}))));}
  pick(e:Event){this.file=(e.target as HTMLInputElement).files?.[0];}
  async save(){this.busy.set(true);this.error.set('');try{await this.d.addItem({name:this.name,description:this.description,category:this.category,owner:this.owner,location_id:this.box?null:this.location,box_id:this.box},this.file);this.open=false;this.name='';this.description='';this.file=undefined;await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo guardar el objeto.');}finally{this.busy.set(false);}}
  async del(id:string){this.busy.set(true);this.error.set('');try{await this.d.remove('items',id);await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo enviar a la papelera.');}finally{this.busy.set(false);}}
}
