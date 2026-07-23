import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonModal, IonSelect, IonSelectOption, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, bedOutline, businessOutline, chevronForwardOutline, fileTrayStackedOutline, homeOutline, locationOutline, trashOutline } from 'ionicons/icons';
import { DataService } from '../core/data.service';
import { Location } from '../core/models';
import { EmptyStateComponent } from '../shared/ui.components';

@Component({
  standalone: true,
  imports: [FormsModule,IonButton,IonButtons,IonContent,IonFab,IonFabButton,IonHeader,IonIcon,IonInput,IonModal,IonSelect,IonSelectOption,IonToolbar,EmptyStateComponent],
  template: `
    <ion-header><ion-toolbar><div class="toolbar-title"><div><p class="eyebrow">Tu mapa de casa</p><h1>Ubicaciones</h1></div><span>{{rows().length}}</span></div></ion-toolbar></ion-header>
    <ion-content><main class="page-shell">
      <div class="intro fi-card"><ion-icon name="home-outline"/><div><strong>Navega de lo general a lo concreto</strong><p>Casa → habitación → armario → estante</p></div></div>
      @if(rows().length){<div class="fi-grid locations">
        @for(x of rows();track x.id){<article class="fi-card location-card">
          <div class="location-icon"><ion-icon [name]="iconFor(x.type)"/></div>
          <div><span>{{x.type || 'Ubicación'}}</span><h2>{{x.name}}</h2><p>{{parentName(x.parent_id)}}</p></div>
          <ion-icon class="chevron" name="chevron-forward-outline"/>
          <ion-button type="button" class="delete danger-quiet" fill="clear" (click)="del(x.id)" [disabled]="busy()" aria-label="Enviar a la papelera"><ion-icon name="trash-outline"/></ion-button>
        </article>}
      </div>}@else{<app-empty-state title="Crea el mapa de tu casa" message="Empieza por una habitación y añade dentro armarios, estantes o cajones." action="Crear primera ubicación" icon="location-outline" (pressed)="open=true"/>}
      <ion-fab class="fi-fab" slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button (click)="open=true"><ion-icon name="add"/></ion-fab-button></ion-fab>
    </main>
    <ion-modal [isOpen]="open" (didDismiss)="open=false"><ng-template>
      <ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="open=false">Cancelar</ion-button></ion-buttons><b>Nueva ubicación</b><span></span></div></ion-toolbar></ion-header>
      <ion-content><div class="form-sheet"><div class="form-section"><h3>Información</h3><ion-input label="Nombre" labelPlacement="stacked" placeholder="Ej. Armario blanco" [(ngModel)]="name"/><ion-select label="Tipo" labelPlacement="stacked" [(ngModel)]="type">@for(t of types;track t){<ion-select-option [value]="t">{{t}}</ion-select-option>}</ion-select></div>
      <div class="form-section"><h3>Ubicación</h3><ion-select label="Dentro de" labelPlacement="stacked" [(ngModel)]="parent"><ion-select-option [value]="null">Nivel principal</ion-select-option>@for(x of rows();track x.id){<ion-select-option [value]="x.id">{{x.name}}</ion-select-option>}</ion-select></div>
      @if(error()) { <p class="error-note">{{ error() }}</p> }
      <ion-button type="button" class="primary-action" expand="block" (click)="save()" [disabled]="busy() || !name.trim()">{{ busy() ? 'Guardando...' : 'Guardar ubicación' }}</ion-button></div></ion-content>
    </ng-template></ion-modal></ion-content>`,
  styles: [`
    .toolbar-title{width:min(100% - 32px,920px);height:82px;margin:auto;display:flex;align-items:center;justify-content:space-between}.toolbar-title p,.toolbar-title h1{margin:0}.toolbar-title h1{font-size:1.6rem}.toolbar-title span{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary);font-weight:800}
    .intro{display:flex;gap:14px;align-items:center;margin-bottom:18px;padding:18px}.intro>ion-icon{padding:12px;border-radius:15px;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:24px}.intro p{margin:4px 0 0;color:var(--fi-muted);font-size:.82rem}
    .location-card{position:relative;display:grid;grid-template-columns:58px 1fr auto;align-items:center;gap:14px;padding:16px}.location-icon{width:58px;height:58px;display:grid;place-items:center;border-radius:18px;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:26px}.location-card span{color:var(--fi-primary);font-size:.68rem;font-weight:800;text-transform:uppercase}.location-card h2{margin:3px 0;font-size:1rem}.location-card p{margin:0;color:var(--fi-muted);font-size:.76rem}.chevron{color:var(--fi-muted)}.delete{position:absolute;right:3px;top:1px;opacity:1}.location-card:hover .chevron{opacity:0}.modal-title{height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.modal-title span{display:block}
  `]
})
export class LocationsPage {
  d=inject(DataService); private route=inject(ActivatedRoute); rows=signal<Location[]>([]); busy=signal(false); error=signal(''); open=false; name=''; type='Habitación'; parent:string|null=null;
  types=['Casa','Habitación','Armario','Estantería','Cajón','Trastero','Garaje','Personalizada'];
  constructor(){addIcons({add,trashOutline,homeOutline,locationOutline,bedOutline,businessOutline,fileTrayStackedOutline,chevronForwardOutline});this.route.queryParamMap.subscribe(params=>{this.open=params.get('nuevo')==='1';});this.load();}
  iconFor(type:string){const t=type.toLowerCase();return t.includes('casa')?'home-outline':t.includes('habitación')?'bed-outline':t.includes('caj')?'file-tray-stacked-outline':t.includes('armario')||t.includes('estant')?'business-outline':'location-outline';}
  parentName(id:string|null){return id?'Dentro de '+(this.rows().find(x=>x.id===id)?.name||'otra ubicación'):'Nivel principal';}
  async load(){this.rows.set(await this.d.locations());}
  async save(){this.busy.set(true);this.error.set('');try{await this.d.addLocation({name:this.name,type:this.type,parent_id:this.parent});this.open=false;this.name='';this.type='Habitación';this.parent=null;await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo guardar la ubicación.');}finally{this.busy.set(false);}}
  async del(id:string){this.busy.set(true);this.error.set('');try{await this.d.remove('locations',id);await this.load();}catch(e){this.error.set((e as Error).message||'No se pudo enviar a la papelera.');}finally{this.busy.set(false);}}
}
