import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonModal, IonSelect, IonSelectOption, IonTextarea, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, bedOutline, businessOutline, cameraOutline, chevronBackOutline, chevronForwardOutline, createOutline, cubeOutline, fileTrayStackedOutline, homeOutline, locationOutline, peopleOutline, personOutline, trashOutline } from 'ionicons/icons';
import { DataService } from '../core/data.service';
import { Item, Location, Owner } from '../core/models';
import { EmptyStateComponent, LocationPickerComponent, OptionPickerComponent, OwnerSelectorComponent } from '../shared/ui.components';

@Component({
  standalone: true,
  imports: [FormsModule,IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonSelect,IonSelectOption,IonTextarea,IonToolbar,EmptyStateComponent,LocationPickerComponent,OptionPickerComponent,OwnerSelectorComponent],
  template: `
    <ion-header><ion-toolbar><div class="toolbar-title"><div><p class="eyebrow">Tu mapa de casa</p><h1>{{current()?.name || 'Ubicaciones'}}</h1></div><span>{{totalHere()}}</span></div></ion-toolbar></ion-header>
    <ion-content><main class="page-shell">
      <nav class="crumbs" aria-label="Ruta de ubicación">
        @if(current()){<button type="button" class="back" (click)="go(parentOf(current()))"><ion-icon name="chevron-back-outline"/>Atrás</button>}
        @for(x of trail(); track x.id){<button type="button" (click)="go(x.id)">{{x.name}}</button><ion-icon name="chevron-forward-outline"/>}
        <strong>{{current()?.name || 'Inicio'}}</strong>
      </nav>
      <div class="intro fi-card"><ion-icon [name]="current()?iconFor(current()!.type):'home-outline'"/><div><strong>{{current() ? 'Contenido de esta ubicación' : 'Navega de lo general a lo concreto'}}</strong><p>{{summaryText()}}</p></div></div>
      @if(childLocations().length){<div class="section-title"><h2>Ubicaciones dentro</h2><span>{{childLocations().length}}</span></div><div class="fi-grid locations">
        @for(x of childLocations();track x.id){<article class="fi-card location-card" (click)="go(x.id)">
          <div class="location-icon"><ion-icon [name]="iconFor(x.type)"/></div>
          <div><span>{{x.type || 'Ubicación'}} · {{x.owner}}</span><h2>{{x.name}}</h2><p>{{contentsFor(x.id)}}</p></div>
          <ion-icon class="chevron" name="chevron-forward-outline"/>
          <span class="card-actions"><ion-button type="button" fill="clear" (click)="edit($event,x)" [disabled]="busy()" aria-label="Editar ubicación"><ion-icon name="create-outline"/></ion-button><ion-button type="button" class="danger-quiet" fill="clear" (click)="del($event,x.id)" [disabled]="busy()" aria-label="Enviar a la papelera"><ion-icon name="trash-outline"/></ion-button></span>
        </article>}
      </div>}
      @if(localItems().length){<div class="section-title"><h2>Objetos aquí</h2><span>{{localItems().length}}</span></div><div class="fi-grid">
        @for(x of localItems();track x.id){<article class="fi-card item-card editable-card" (click)="editItem(x)">
          <div class="item-photo">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="cube-outline"/>}</div>
          <div class="item-body"><div class="meta-row"><span class="fi-chip">{{x.category||'Otros'}}</span><span class="fi-chip"><ion-icon [name]="x.owner==='Compartido'?'people-outline':'person-outline'"/>{{x.owner}}</span></div><h2>{{x.name}}</h2><p>{{x.description||'Sin descripción'}}</p></div>
        </article>}
      </div>}
      @if(localBoxes().length){<div class="section-title"><h2>Cajas aquí</h2><span>{{localBoxes().length}}</span></div><div class="fi-grid">
        @for(x of localBoxes();track x.id){<article class="fi-card box-card">
          <div class="box-photo">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="archive-outline"/>}</div>
          <div><span>{{x.category||'Otros'}}</span><h2>{{x.name}}</h2><p>{{x.description||'Sin descripción del contenido'}}</p></div>
        </article>}
      </div>}
      @if(!childLocations().length && !localItems().length && !localBoxes().length){<app-empty-state title="Nada guardado aquí" message="Crea una ubicación dentro o añade objetos usando esta ubicación." action="Crear ubicación dentro" icon="location-outline" (pressed)="openForCurrent()"/>}
      <ion-fab class="fi-fab" slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button (click)="newLocation()"><ion-icon name="add"/></ion-fab-button></ion-fab>
    </main>
    <ion-modal [isOpen]="open" (didDismiss)="close()"><ng-template>
      <ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="close()">Cancelar</ion-button></ion-buttons><b>{{editingId ? 'Editar ubicación' : 'Nueva ubicación'}}</b><span></span></div></ion-toolbar></ion-header>
      <ion-content><div class="form-sheet"><div class="form-section"><h3>Información</h3><ion-input label="Nombre" labelPlacement="stacked" placeholder="Ej. Armario blanco" [(ngModel)]="name"/><ion-select label="Tipo" labelPlacement="stacked" [(ngModel)]="type">@for(t of types;track t){<ion-select-option [value]="t">{{t}}</ion-select-option>}</ion-select></div>
      <div class="form-section"><h3>Ubicación</h3><app-location-picker label="Dentro de" emptyLabel="Nivel principal" [locations]="parentOptions()" [value]="parent" (valueChange)="parent=$event"/></div>
      <div class="form-section"><h3>Propiedad</h3><app-owner-selector [value]="owner" (valueChange)="owner=$event"/></div>
      @if(error()) { <p class="error-note">{{ error() }}</p> }
      <ion-button type="button" class="primary-action" expand="block" (click)="save()" [disabled]="busy() || !name.trim()">{{ busy() ? 'Guardando...' : (editingId ? 'Guardar cambios' : 'Guardar ubicación') }}</ion-button></div></ion-content>
    </ng-template></ion-modal>
    <ion-modal [isOpen]="itemOpen" (didDismiss)="closeItem()"><ng-template>
      <ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="closeItem()">Cancelar</ion-button></ion-buttons><b>Editar objeto</b><span></span></div></ion-toolbar></ion-header>
      <ion-content><div class="form-sheet">
        <div class="form-section"><h3>Información</h3><ion-input label="Nombre" labelPlacement="stacked" [(ngModel)]="itemName"/><ion-textarea label="Descripción" labelPlacement="stacked" autoGrow="true" [(ngModel)]="itemDescription"/><app-option-picker label="Categoría" icon="cube-outline" [options]="categoryOptions()" [value]="itemCategory" (valueChange)="itemCategory=$event || 'Otros'"/></div>
        <div class="form-section"><h3>Ubicación</h3><app-option-picker label="Caja" emptyLabel="Sin caja" icon="archive-outline" [allowEmpty]="true" [options]="boxOptions()" [value]="itemBox" (valueChange)="itemBox=$event"/><app-location-picker label="Ubicación directa" emptyLabel="Sin ubicación directa" [locations]="rows()" [value]="itemLocation" [disabled]="!!itemBox" (valueChange)="itemLocation=$event"/></div>
        <div class="form-section"><h3>Fotografía</h3><label class="photo-input"><ion-icon name="camera-outline"/> {{itemFile?.name||'Hacer foto o elegir archivo'}}<input hidden type="file" accept="image/*" capture="environment" (change)="pickItem($event)"></label></div>
        <div class="form-section"><h3>Propiedad</h3><app-owner-selector [value]="itemOwner" (valueChange)="itemOwner=$event"/></div>
        @if(error()) { <p class="error-note">{{ error() }}</p> }
        <ion-button type="button" class="primary-action" expand="block" (click)="saveItem()" [disabled]="busy() || !itemName.trim()">{{ busy() ? 'Guardando...' : 'Guardar cambios' }}</ion-button>
      </div></ion-content>
    </ng-template></ion-modal></ion-content>`,
  styles: [`
    .toolbar-title{width:min(100% - 32px,920px);height:82px;margin:auto;display:flex;align-items:center;justify-content:space-between}.toolbar-title p,.toolbar-title h1{margin:0}.toolbar-title h1{font-size:1.6rem}.toolbar-title span{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary);font-weight:800}
    .crumbs{display:flex;align-items:center;gap:7px;margin:2px 0 14px;overflow:auto;color:var(--fi-muted);font-size:.78rem}.crumbs button{border:0;background:transparent;color:var(--fi-primary);font:inherit;font-weight:800;white-space:nowrap}.crumbs .back{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;border-radius:12px;background:var(--fi-primary-soft)}.crumbs ion-icon{flex:0 0 auto;font-size:14px}.crumbs strong{color:var(--fi-text);white-space:nowrap}
    .intro{display:flex;gap:14px;align-items:center;margin-bottom:18px;padding:18px}.intro>ion-icon{padding:12px;border-radius:15px;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:24px}.intro p{margin:4px 0 0;color:var(--fi-muted);font-size:.82rem}
    .location-card{position:relative;display:grid;grid-template-columns:58px 1fr auto;align-items:center;gap:14px;padding:16px;cursor:pointer}.location-icon{width:58px;height:58px;display:grid;place-items:center;border-radius:18px;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:26px}.location-card span,.box-card span{color:var(--fi-primary);font-size:.68rem;font-weight:800;text-transform:uppercase}.location-card h2,.box-card h2{margin:3px 0;font-size:1rem}.location-card p,.box-card p{margin:0;color:var(--fi-muted);font-size:.76rem;line-height:1.35}.chevron{color:var(--fi-muted)}.card-actions{position:absolute;right:3px;top:1px;display:flex;align-items:center}.card-actions ion-button{margin:-6px}.location-card:hover .chevron{opacity:0}.modal-title{height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.modal-title span{display:block}
    .item-card{display:grid;grid-template-columns:92px 1fr;min-height:132px}.editable-card{color:var(--fi-text);text-decoration:none}.item-photo,.box-photo{display:grid;place-items:center;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:34px;overflow:hidden}.item-photo img,.box-photo img{width:100%;height:100%;object-fit:cover}.item-body{min-width:0;padding:14px}.item-body h2{margin:8px 0 5px;font-size:1rem}.item-body p{height:34px;margin:0;color:var(--fi-muted);font-size:.78rem;line-height:1.35;overflow:hidden}.box-card{display:grid;grid-template-columns:92px 1fr;gap:14px;align-items:center;padding-right:14px;min-height:118px}.box-photo{height:100%;min-height:118px}
    @media(max-width:560px){.item-card,.box-card{grid-template-columns:78px 1fr}.location-card{grid-template-columns:50px 1fr auto}.location-icon{width:50px;height:50px;border-radius:16px}.toolbar-title h1{font-size:1.35rem}}
  `]
})
export class LocationsPage {
  d=inject(DataService); private route=inject(ActivatedRoute); private router=inject(Router); rows=signal<Location[]>([]); items=signal<any[]>([]); boxes=signal<any[]>([]); currentId=signal<string|null>(null); busy=signal(false); error=signal(''); open=false; editingId:string|null=null; name=''; type='Habitación'; owner:Owner='Nahuel'; parent:string|null=null;
  itemOpen=false; itemEditingId:string|null=null; requestedItemEditId:string|null=null; itemName=''; itemDescription=''; itemCategory='Otros'; itemOwner:Owner='Compartido'; itemLocation:string|null=null; itemBox:string|null=null; itemFile?:File;
  types=['Casa','Habitación','Armario','Estantería','Cajonera','Cajón','Trastero','Garaje','Personalizada'];
  constructor(){addIcons({add,trashOutline,homeOutline,locationOutline,bedOutline,businessOutline,fileTrayStackedOutline,chevronForwardOutline,chevronBackOutline,createOutline,cubeOutline,archiveOutline,cameraOutline,personOutline,peopleOutline});this.route.queryParamMap.subscribe(async params=>{this.currentId.set(params.get('parent'));this.requestedItemEditId=params.get('editarObjeto');this.parent=this.currentId();await this.load();if(params.get('nuevo')==='1')this.newLocation();if(this.requestedItemEditId)this.openRequestedItemEdit();});}
  iconFor(type:string){const t=type.toLowerCase();return t.includes('casa')?'home-outline':t.includes('habitación')?'bed-outline':t.includes('caj')?'file-tray-stacked-outline':t.includes('armario')||t.includes('estant')?'business-outline':'location-outline';}
  current(){return this.currentId()?this.rows().find(x=>x.id===this.currentId())||null:null;}
  childLocations(){return this.rows().filter(x=>x.parent_id===this.currentId()).sort((a,b)=>a.name.localeCompare(b.name,'es'));}
  localItems(){return this.items().filter(x=>x.location_id===this.currentId());}
  localBoxes(){return this.boxes().filter(x=>x.location_id===this.currentId());}
  parentOf(x:Location|null){return x?.parent_id||null;}
  totalHere(){return this.childLocations().length+this.localItems().length+this.localBoxes().length;}
  contentsFor(id:string){const l=this.rows().filter(x=>x.parent_id===id).length;const i=this.items().filter(x=>x.location_id===id).length;const b=this.boxes().filter(x=>x.location_id===id).length;return [l?`${l} ubicaciones`:null,i?`${i} objetos`:null,b?`${b} cajas`:null].filter(Boolean).join(' · ')||'Vacío';}
  summaryText(){const parts=[this.childLocations().length?`${this.childLocations().length} ubicaciones`:null,this.localItems().length?`${this.localItems().length} objetos`:null,this.localBoxes().length?`${this.localBoxes().length} cajas`:null].filter(Boolean);return parts.length?parts.join(' · '):'Casa -> habitación -> cajonera -> cajón -> objetos';}
  trail(){const out:Location[]=[];let id=this.current()?.parent_id||null;while(id){const x=this.rows().find(r=>r.id===id);if(!x)break;out.unshift(x);id=x.parent_id;}return out;}
  pathFor(x:Location){return [...this.ancestors(x),x].map(p=>p.name).join(' / ');}
  categoryOptions(){return this.d.categories.map(c=>({value:c,label:c}));}
  boxOptions(){return this.boxes().map(b=>({value:b.id,label:b.name}));}
  ancestors(x:Location){const out:Location[]=[];let id=x.parent_id;while(id){const p=this.rows().find(r=>r.id===id);if(!p)break;out.unshift(p);id=p.parent_id;}return out;}
  parentOptions(){const descendants=new Set<string>();const collect=(id:string)=>{for(const child of this.rows().filter(x=>x.parent_id===id)){descendants.add(child.id);collect(child.id);}};if(this.editingId)collect(this.editingId);return this.rows().filter(x=>x.id!==this.editingId&&!descendants.has(x.id));}
  go(parent:string|null){this.router.navigate(['/lugares'],{queryParams:parent?{parent}:null});}
  openForCurrent(){this.newLocation();}
  newLocation(){this.reset();this.parent=this.currentId();this.open=true;}
  edit(e:Event,x:Location){e.stopPropagation();this.editingId=x.id;this.name=x.name;this.type=x.type;this.owner=x.owner;this.parent=x.parent_id;this.error.set('');this.open=true;}
  close(){this.open=false;this.reset();}
  reset(){this.editingId=null;this.name='';this.type='Habitación';this.owner='Nahuel';this.parent=this.currentId();this.error.set('');}
  async load(){const scope=this.requestedItemEditId?'all':'visible';const[l,i,b]=await Promise.all([this.d.locations(false,scope),this.d.items(false,scope),this.d.boxes(false,scope)]);this.rows.set(l);this.boxes.set(await Promise.all(b.map(async x=>({...x,url:await this.d.signed(x.exterior_photo_path)}))));this.items.set(await Promise.all(i.map(async x=>({...x,url:await this.d.signed(x.photo_path)}))));}
  async save(){this.busy.set(true);this.error.set('');try{const v={name:this.name,type:this.type,parent_id:this.parent,owner:this.owner};if(this.editingId)await this.d.updateLocation(this.editingId,v);else await this.d.addLocation(v);this.close();await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo guardar la ubicación.');}finally{this.busy.set(false);}}
  async del(e:Event,id:string){e.stopPropagation();this.busy.set(true);this.error.set('');try{await this.d.remove('locations',id);await this.load();}catch(err){this.error.set((err as Error).message||'No se pudo enviar a la papelera.');}finally{this.busy.set(false);}}
  openRequestedItemEdit(){const x=this.requestedItemEditId?this.items().find(r=>r.id===this.requestedItemEditId):null;if(x)this.editItem(x);else this.error.set('No se pudo cargar ese objeto para editar.');}
  editItem(x:Item){this.itemEditingId=x.id;this.itemName=x.name;this.itemDescription=x.description||'';this.itemCategory=x.category||'Otros';this.itemOwner=x.owner;this.itemLocation=x.location_id;this.itemBox=x.box_id;this.itemFile=undefined;this.error.set('');this.itemOpen=true;}
  closeItem(){this.itemOpen=false;this.resetItem();}
  resetItem(){this.itemEditingId=null;this.itemName='';this.itemDescription='';this.itemCategory='Otros';this.itemOwner='Compartido';this.itemLocation=null;this.itemBox=null;this.itemFile=undefined;this.error.set('');}
  pickItem(e:Event){this.itemFile=(e.target as HTMLInputElement).files?.[0];}
  async saveItem(){if(!this.itemEditingId)return;this.busy.set(true);this.error.set('');try{await this.d.updateItem(this.itemEditingId,{name:this.itemName,description:this.itemDescription,category:this.itemCategory,owner:this.itemOwner,location_id:this.itemBox?null:this.itemLocation,box_id:this.itemBox},this.itemFile);this.closeItem();await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo guardar el objeto.');}finally{this.busy.set(false);}}
}
