import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonSelect,IonSelectOption,IonTextarea,IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, cameraOutline, createOutline, peopleOutline, personOutline, trashOutline } from 'ionicons/icons';
import { DataService } from '../core/data.service';
import { Box, Location, Owner } from '../core/models';
import { EmptyStateComponent, OwnerSelectorComponent } from '../shared/ui.components';

@Component({
  standalone:true,
  imports:[FormsModule,IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonSelect,IonSelectOption,IonTextarea,IonToolbar,EmptyStateComponent,OwnerSelectorComponent],
  template:`
  <ion-header><ion-toolbar><div class="toolbar-title"><div><p class="eyebrow">Contenedores</p><h1>Cajas</h1></div><span>{{rows().length}}</span></div></ion-toolbar></ion-header>
  <ion-content><main class="page-shell">
    @if(rows().length){<div class="fi-grid">@for(x of rows();track x.id){<article class="fi-card box-card">
      <div class="box-photo">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<div><ion-icon name="archive-outline"/><small>Sin fotografía</small></div>}<span class="fi-chip"><ion-icon [name]="x.owner==='Compartido'?'people-outline':'person-outline'"/>{{x.owner}}</span></div>
      <div class="box-body"><small>{{x.category||'Otros'}}</small><h2>{{x.name}}</h2><p>{{x.description||'Aún no has descrito el contenido.'}}</p><div class="box-meta"><span>{{locationName(x.location_id)}}</span><span class="actions"><ion-button type="button" fill="clear" (click)="edit(x)" [disabled]="busy()" aria-label="Editar caja"><ion-icon name="create-outline"/></ion-button><ion-button type="button" class="danger-quiet" fill="clear" (click)="del(x.id)" [disabled]="busy()" aria-label="Enviar a papelera"><ion-icon name="trash-outline"/></ion-button></span></div></div>
    </article>}</div>}@else{<app-empty-state title="Todavía no tienes cajas" message="Crea una caja, añade una foto exterior y escribe qué has guardado dentro." action="Añadir primera caja" icon="archive-outline" (pressed)="newBox()"/>}
    <ion-fab class="fi-fab" slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button (click)="newBox()"><ion-icon name="add"/></ion-fab-button></ion-fab>
  </main>
    <ion-modal [isOpen]="open" (didDismiss)="close()"><ng-template><ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="close()">Cancelar</ion-button></ion-buttons><b>{{editingId ? 'Editar caja' : 'Nueva caja'}}</b><span></span></div></ion-toolbar></ion-header>
    <ion-content><div class="form-sheet">
      <div class="form-section"><h3>Información</h3><ion-input label="Nombre" labelPlacement="stacked" placeholder="Ej. Caja de cables" [(ngModel)]="name"/><ion-textarea label="Qué contiene" labelPlacement="stacked" autoGrow="true" placeholder="Describe el contenido para encontrarlo al buscar" [(ngModel)]="description"/><ion-select label="Categoría" labelPlacement="stacked" [(ngModel)]="category">@for(c of d.categories;track c){<ion-select-option [value]="c">{{c}}</ion-select-option>}</ion-select></div>
      <div class="form-section"><h3>Ubicación</h3><ion-select label="Lugar" labelPlacement="stacked" [(ngModel)]="location"><ion-select-option [value]="null">Sin ubicación</ion-select-option>@for(l of locations();track l.id){<ion-select-option [value]="l.id">{{l.name}}</ion-select-option>}</ion-select><ion-select label="Dentro de otra caja" labelPlacement="stacked" [(ngModel)]="parentBox"><ion-select-option [value]="null">No</ion-select-option>@for(b of parentBoxOptions();track b.id){<ion-select-option [value]="b.id">{{b.name}}</ion-select-option>}</ion-select></div>
      <div class="form-section"><h3>Fotografía exterior</h3><label class="photo-input"><ion-icon name="camera-outline"/> {{file?.name||'Hacer foto o elegir archivo'}}<input hidden type="file" accept="image/*" capture="environment" (change)="pick($event)"></label></div>
      <div class="form-section"><h3>Propiedad</h3><app-owner-selector [value]="owner" (valueChange)="owner=$event"/></div>
      @if(error()) { <p class="error-note">{{ error() }}</p> }
      <ion-button type="button" class="primary-action" expand="block" (click)="save()" [disabled]="busy() || !name.trim()">{{ busy() ? 'Guardando...' : (editingId ? 'Guardar cambios' : 'Guardar caja') }}</ion-button>
    </div></ion-content>
  </ng-template></ion-modal></ion-content>`,
  styles:[`
    .toolbar-title{width:min(100% - 32px,920px);height:82px;margin:auto;display:flex;align-items:center;justify-content:space-between}.toolbar-title p,.toolbar-title h1{margin:0}.toolbar-title h1{font-size:1.6rem}.toolbar-title>span{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary);font-weight:800}
    .box-card{min-width:0}.box-photo{position:relative;height:190px;background:var(--fi-primary-soft);overflow:hidden}.box-photo img{width:100%;height:100%;object-fit:cover}.box-photo>div{height:100%;display:grid;place-items:center;align-content:center;gap:8px;color:var(--fi-primary)}.box-photo>div ion-icon{font-size:45px}.box-photo>span{position:absolute;left:13px;bottom:13px;background:color-mix(in srgb,var(--fi-surface) 90%,transparent);backdrop-filter:blur(10px)}
    .box-body{padding:17px}.box-body>small{color:var(--fi-primary);font-weight:800}.box-body h2{margin:4px 0 7px;font-size:1.1rem}.box-body p{min-height:38px;margin:0;color:var(--fi-muted);font-size:.82rem;line-height:1.45}.box-meta{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--fi-border)}.box-meta>span:first-child{color:var(--fi-muted);font-size:.75rem}.actions{display:flex;align-items:center}.actions ion-button{margin:-8px}.modal-title{height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.photo-input ion-icon{vertical-align:-2px;margin-right:7px}
  `]
})
export class BoxesPage{
  d=inject(DataService);private route=inject(ActivatedRoute);rows=signal<any[]>([]);locations=signal<Location[]>([]);busy=signal(false);error=signal('');open=false;editingId:string|null=null;name='';description='';category='Otros';owner:Owner='Compartido';location:string|null=null;parentBox:string|null=null;file?:File;
  constructor(){addIcons({add,trashOutline,archiveOutline,cameraOutline,createOutline,personOutline,peopleOutline});this.route.queryParamMap.subscribe(params=>{if(params.get('nuevo')==='1')this.newBox();});this.load();}
  locationName(id:string|null){return id?this.locations().find(x=>x.id===id)?.name||'Ubicación':'Sin ubicación';}
  parentBoxOptions(){return this.rows().filter(b=>b.id!==this.editingId);}
  async load(){const[b,l]=await Promise.all([this.d.boxes(),this.d.locations()]);this.locations.set(l);this.rows.set(await Promise.all(b.map(async x=>({...x,url:await this.d.signed(x.exterior_photo_path)}))));}
  pick(e:Event){this.file=(e.target as HTMLInputElement).files?.[0];}
  newBox(){this.reset();this.open=true;}
  edit(x:Box){this.editingId=x.id;this.name=x.name;this.description=x.description||'';this.category=x.category||'Otros';this.owner=x.owner;this.location=x.location_id;this.parentBox=x.parent_box_id;this.file=undefined;this.error.set('');this.open=true;}
  close(){this.open=false;this.reset();}
  reset(){this.editingId=null;this.name='';this.description='';this.category='Otros';this.owner='Compartido';this.location=null;this.parentBox=null;this.file=undefined;this.error.set('');}
  async save(){this.busy.set(true);this.error.set('');try{const v={name:this.name,description:this.description,category:this.category,owner:this.owner,location_id:this.location,parent_box_id:this.parentBox};if(this.editingId)await this.d.updateBox(this.editingId,v,this.file);else await this.d.addBox(v,this.file);this.close();await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo guardar la caja.');}finally{this.busy.set(false);}}
  async del(id:string){this.busy.set(true);this.error.set('');try{await this.d.remove('boxes',id);await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo enviar a la papelera.');}finally{this.busy.set(false);}}
}
