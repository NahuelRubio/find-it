import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonTextarea,IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, cameraOutline, chevronBackOutline, chevronForwardOutline, createOutline, cubeOutline, peopleOutline, personOutline, trashOutline } from 'ionicons/icons';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { Box, Location, Owner } from '../core/models';
import { EmptyStateComponent, LocationPickerComponent, OptionPickerComponent, OwnerSelectorComponent } from '../shared/ui.components';

@Component({
  standalone:true,
  imports:[FormsModule,IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonTextarea,IonToolbar,EmptyStateComponent,LocationPickerComponent,OptionPickerComponent,OwnerSelectorComponent],
  template:`
  <ion-header><ion-toolbar><div class="toolbar-title"><div><p class="eyebrow">Contenedores</p><h1>{{current()?.name || 'Cajas'}}</h1></div><span>{{visibleBoxes().length + childItems().length}}</span></div></ion-toolbar></ion-header>
  <ion-content><main class="page-shell">
    <nav class="crumbs" aria-label="Ruta de caja">
      @if(current()){<button type="button" class="back" (click)="go(parentOf(current()))"><ion-icon name="chevron-back-outline"/>Atrás</button>}
      @for(x of trail(); track x.id){<button type="button" (click)="go(x.id)">{{x.name}}</button><ion-icon name="chevron-forward-outline"/>}
      <strong>{{current()?.name || 'Todas las cajas'}}</strong>
    </nav>
    <div class="scope-toggle" role="group" aria-label="Filtro de propietario">
      <button type="button" [class.active]="scope==='visible'" (click)="setScope('visible')"><ion-icon name="person-outline"></ion-icon><span>Mis cosas</span></button>
      <button type="button" [class.active]="scope==='shared'" (click)="setScope('shared')"><ion-icon name="people-outline"></ion-icon><span>Compartido</span></button>
    </div>
    @if(current()){<div class="intro fi-card">
      <div class="intro-photo">@if(current()!.url){<img [src]="current()!.url" [alt]="current()!.name"/>}@else{<ion-icon name="archive-outline"/>}</div>
      <div><strong>{{boxPlaceName(current()!)}}</strong><p>{{current()!.description || 'Sin descripción del contenido'}}</p></div>
    </div>}
    @if(visibleBoxes().length){<div class="section-title"><h2>{{current() ? 'Cajas dentro' : 'Cajas'}}</h2><span>{{visibleBoxes().length}}</span></div><div class="fi-grid">@for(x of visibleBoxes();track x.id){<article class="fi-card box-card" (click)="go(x.id)">
      <div class="box-photo">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<div><ion-icon name="archive-outline"/><small>Sin fotografía</small></div>}<span class="fi-chip"><ion-icon [name]="x.owner==='Compartido'?'people-outline':'person-outline'"/>{{x.owner}}</span></div>
      <div class="box-body"><small>{{x.category||'Otros'}}</small><h2>{{x.name}}</h2><p>{{x.description||'Aún no has descrito el contenido.'}}</p><div class="box-meta"><span>{{boxPlaceName(x)}}</span><span class="actions"><ion-button type="button" fill="clear" (click)="edit(x,$event)" [disabled]="busy()" aria-label="Editar caja"><ion-icon name="create-outline"/></ion-button><ion-button type="button" class="danger-quiet" fill="clear" (click)="del(x.id,$event)" [disabled]="busy()" aria-label="Enviar a papelera"><ion-icon name="trash-outline"/></ion-button></span></div></div>
    </article>}</div>}
    @if(childItems().length){<div class="section-title"><h2>Objetos dentro</h2><span>{{childItems().length}}</span></div><div class="fi-grid">@for(x of childItems();track x.id){<article class="fi-card item-card">
      <div class="item-photo">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="cube-outline"/>}</div>
      <div class="item-body"><div class="meta-row"><span class="fi-chip">{{x.category||'Otros'}}</span><span class="fi-chip"><ion-icon [name]="x.owner==='Compartido'?'people-outline':'person-outline'"/>{{x.owner}}</span></div><h2>{{x.name}}</h2><p>{{x.description||'Sin descripción'}}</p></div>
    </article>}</div>}
    @if(!visibleBoxes().length && !childItems().length){<app-empty-state [title]="current() ? 'Esta caja está vacía' : 'Todavía no tienes cajas'" [message]="current() ? 'Añade una caja dentro o guarda objetos usando esta caja.' : 'Crea una caja, añade una foto exterior y escribe qué has guardado dentro.'" [action]="current() ? 'Añadir caja dentro' : 'Añadir primera caja'" icon="archive-outline" (pressed)="newBox()"/>}
    <ion-fab class="fi-fab" slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button (click)="newBox()"><ion-icon name="add"/></ion-fab-button></ion-fab>
  </main>
    <ion-modal [isOpen]="open" (didDismiss)="close()"><ng-template><ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="close()">Cancelar</ion-button></ion-buttons><b>{{editingId ? 'Editar caja' : 'Nueva caja'}}</b><span></span></div></ion-toolbar></ion-header>
    <ion-content><div class="form-sheet">
      <div class="form-section"><h3>Información</h3><ion-input label="Nombre" labelPlacement="stacked" placeholder="Ej. Caja de cables" [(ngModel)]="name"/>
        @if(advanced){<ion-textarea label="Qué contiene" labelPlacement="stacked" autoGrow="true" placeholder="Describe el contenido para encontrarlo al buscar" [(ngModel)]="description"/><app-option-picker label="Categoría" icon="archive-outline" [options]="categoryOptions()" [value]="category" (valueChange)="category=$event || 'Otros'"/>}
      </div>
      <div class="form-section"><h3>Ubicación</h3><app-location-picker label="Lugar" emptyLabel="Sin ubicación" [locations]="locations()" [value]="location" (valueChange)="location=$event"/><app-option-picker label="Dentro de otra caja" emptyLabel="No" icon="archive-outline" [allowEmpty]="true" [options]="parentBoxPickerOptions()" [value]="parentBox" (valueChange)="parentBox=$event"/></div>
      <div class="form-section"><h3>Fotografía exterior</h3><label class="photo-input"><ion-icon name="camera-outline"/> {{file?.name||'Hacer foto o elegir archivo'}}<input hidden type="file" accept="image/*" capture="environment" (change)="pick($event)"></label></div>
      @if(advanced){<div class="form-section"><h3>Propiedad</h3><app-owner-selector [value]="owner" (valueChange)="owner=$event"/></div>}
      @if(error()) { <p class="error-note">{{ error() }}</p> }
      <ion-button type="button" fill="clear" expand="block" class="advanced-toggle" (click)="advanced=!advanced">{{ advanced ? 'Modo rápido' : 'Avanzado' }}</ion-button>
      <ion-button type="button" class="primary-action" expand="block" (click)="save()" [disabled]="busy() || !name.trim()">{{ busy() ? 'Guardando...' : (editingId ? 'Guardar cambios' : 'Guardar caja') }}</ion-button>
    </div></ion-content>
  </ng-template></ion-modal></ion-content>`,
  styles:[`
    .toolbar-title{width:min(100% - 32px,920px);height:82px;margin:auto;display:flex;align-items:center;justify-content:space-between}.toolbar-title p,.toolbar-title h1{margin:0}.toolbar-title h1{font-size:1.6rem}.toolbar-title>span{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary);font-weight:800}
    .crumbs{display:flex;align-items:center;gap:7px;margin:2px 0 14px;overflow:auto;color:var(--fi-muted);font-size:.78rem}.crumbs button{border:0;background:transparent;color:var(--fi-primary);font:inherit;font-weight:800;white-space:nowrap}.crumbs .back{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;border-radius:12px;background:var(--fi-primary-soft)}.crumbs ion-icon{flex:0 0 auto;font-size:14px}.crumbs strong{color:var(--fi-text);white-space:nowrap}
    .scope-toggle{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:0 0 16px;padding:6px;border:1px solid var(--fi-border);border-radius:18px;background:var(--fi-surface-2)}.scope-toggle button{display:grid;grid-template-columns:auto auto;justify-content:center;align-items:center;gap:7px;min-height:46px;border:0;border-radius:13px;background:transparent;color:var(--fi-muted);font:inherit;font-size:.8rem;font-weight:750}.scope-toggle button.active{background:var(--fi-surface);color:var(--fi-primary-strong);box-shadow:0 8px 20px rgba(30,67,61,.08)}.scope-toggle ion-icon{font-size:16px}.advanced-toggle{margin-top:6px;--color:var(--fi-primary)}
    .intro{display:grid;grid-template-columns:92px 1fr;gap:14px;align-items:center;margin-bottom:18px;padding-right:16px}.intro-photo{height:96px;display:grid;place-items:center;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:34px;overflow:hidden}.intro-photo img{width:100%;height:100%;object-fit:cover}.intro p{margin:4px 0 0;color:var(--fi-muted);font-size:.82rem}
    .box-card{min-width:0;cursor:pointer}.box-card:hover{border-color:color-mix(in srgb,var(--fi-primary) 38%,var(--fi-border))}.box-photo{position:relative;height:190px;background:var(--fi-primary-soft);overflow:hidden}.box-photo img{width:100%;height:100%;object-fit:cover}.box-photo>div{height:100%;display:grid;place-items:center;align-content:center;gap:8px;color:var(--fi-primary)}.box-photo>div ion-icon{font-size:45px}.box-photo>span{position:absolute;left:13px;bottom:13px;background:color-mix(in srgb,var(--fi-surface) 90%,transparent);backdrop-filter:blur(10px)}
    .box-body{padding:17px}.box-body>small{color:var(--fi-primary);font-weight:800}.box-body h2{margin:4px 0 7px;font-size:1.1rem}.box-body p{min-height:38px;margin:0;color:var(--fi-muted);font-size:.82rem;line-height:1.45}.box-meta{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--fi-border)}.box-meta>span:first-child{color:var(--fi-muted);font-size:.75rem}.actions{display:flex;align-items:center}.actions ion-button{margin:-8px}.modal-title{height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.photo-input ion-icon{vertical-align:-2px;margin-right:7px}
    .item-card{display:grid;grid-template-columns:92px 1fr;min-height:132px}.item-photo{display:grid;place-items:center;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:34px;overflow:hidden}.item-photo img{width:100%;height:100%;object-fit:cover}.item-body{min-width:0;padding:14px}.item-body h2{margin:8px 0 5px;font-size:1rem}.item-body p{height:34px;margin:0;color:var(--fi-muted);font-size:.78rem;line-height:1.35;overflow:hidden}
  `]
})
export class BoxesPage{
  d=inject(DataService);private auth=inject(AuthService);private route=inject(ActivatedRoute);private router=inject(Router);rows=signal<any[]>([]);items=signal<any[]>([]);locations=signal<Location[]>([]);currentId=signal<string|null>(null);busy=signal(false);error=signal('');open=false;advanced=false;scope:'visible'|'shared'='visible';editingId:string|null=null;name='';description='';category='Otros';owner:Owner='Compartido';location:string|null=null;parentBox:string|null=null;file?:File;
  constructor(){addIcons({add,trashOutline,archiveOutline,cameraOutline,createOutline,personOutline,peopleOutline,chevronBackOutline,chevronForwardOutline,cubeOutline});this.route.queryParamMap.subscribe(async params=>{this.currentId.set(params.get('parentBox'));await this.load();if(params.get('nuevo')==='1')this.newBox();});}
  locationName(id:string|null){return id?this.locations().find(x=>x.id===id)?.name||'Ubicación':'Sin ubicación';}
  current(){return this.currentId()?this.rows().find(x=>x.id===this.currentId())||null:null;}
  visibleBoxes(){return this.rows().filter(x=>x.parent_box_id===this.currentId());}
  childItems(){return this.items().filter(x=>x.box_id===this.currentId());}
  parentOf(x:Box|null){return x?.parent_box_id||null;}
  trail(){const out:Box[]=[];let id=this.current()?.parent_box_id||null;while(id){const x=this.rows().find(r=>r.id===id);if(!x)break;out.unshift(x);id=x.parent_box_id;}return out;}
  go(parentBox:string|null){this.router.navigate(['/cajas'],{queryParams:parentBox?{parentBox}:null});}
  boxPlaceName(x:Box){if(x.parent_box_id){const p=this.rows().find(b=>b.id===x.parent_box_id);return p?`Dentro de ${p.name}`:'Dentro de otra caja';}return this.locationName(x.location_id);}
  categoryOptions(){return this.d.categories.map(c=>({value:c,label:c}));}
  parentBoxPickerOptions(){return this.parentBoxOptions().map(b=>({value:b.id,label:b.name}));}
  parentBoxOptions(){return this.rows().filter(b=>b.id!==this.editingId);}
  setScope(scope:'visible'|'shared'){this.scope=scope;this.load();}
  async load(){const scope=this.scope==='shared'?'all':this.scope;const[b,l,i]=await Promise.all([this.d.boxes(false,scope),this.d.locations(false,scope),this.d.items(false,scope)]);this.locations.set(l);const boxes=this.scope==='shared'?b.filter(x=>x.owner==='Compartido'):b;const items=this.scope==='shared'?i.filter(x=>x.owner==='Compartido'):i;this.rows.set(await Promise.all(boxes.map(async x=>({...x,url:await this.d.signed(x.exterior_photo_path)}))));this.items.set(await Promise.all(items.map(async x=>({...x,url:await this.d.signed(x.photo_path)}))));}
  pick(e:Event){this.file=(e.target as HTMLInputElement).files?.[0];}
  newBox(){this.reset();this.parentBox=this.currentId();this.open=true;}
  edit(x:Box,e?:Event){e?.stopPropagation();this.advanced=true;this.editingId=x.id;this.name=x.name;this.description=x.description||'';this.category=x.category||'Otros';this.owner=x.owner;this.location=x.location_id;this.parentBox=x.parent_box_id;this.file=undefined;this.error.set('');this.open=true;}
  close(){this.open=false;this.reset();}
  reset(){this.editingId=null;this.advanced=false;this.name='';this.description='';this.category='Otros';this.owner=this.auth.profile()?.display_name||'Compartido';this.location=null;this.parentBox=null;this.file=undefined;this.error.set('');}
  async save(){this.busy.set(true);this.error.set('');try{const v={name:this.name,description:this.description,category:this.category,owner:this.owner,location_id:this.location,parent_box_id:this.parentBox};if(this.editingId)await this.d.updateBox(this.editingId,v,this.file);else await this.d.addBox(v,this.file);this.close();await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo guardar la caja.');}finally{this.busy.set(false);}}
  async del(id:string,e?:Event){e?.stopPropagation();if(!confirm('¿Enviar esta caja a la papelera?'))return;this.busy.set(true);this.error.set('');try{await this.d.remove('boxes',id);await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo enviar a la papelera.');}finally{this.busy.set(false);}}
}
