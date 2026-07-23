import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonSearchbar, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, checkmarkCircle, chevronForwardOutline, cubeOutline, locateOutline, locationOutline, personOutline, peopleOutline } from 'ionicons/icons';
import { Location, Owner } from '../core/models';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="brand" [class.compact]="compact()">
      <div class="mark"><ion-icon name="archive-outline"/><span><ion-icon name="locate-outline"/></span></div>
      @if (!compact()) { <div><strong>Find it</strong><small>Todo en su sitio</small></div> }
    </div>`,
  styles: [`
    .brand{display:flex;align-items:center;gap:14px}.mark{position:relative;width:54px;height:54px;display:grid;place-items:center;border-radius:18px;background:var(--fi-primary);color:white;box-shadow:0 10px 25px rgba(45,114,104,.25)}
    .mark>ion-icon{font-size:27px}.mark span{position:absolute;right:-5px;bottom:-5px;width:25px;height:25px;display:grid;place-items:center;border:3px solid var(--fi-surface);border-radius:50%;background:var(--fi-mint);color:#173531}.mark span ion-icon{font-size:13px}
    strong{display:block;font-size:1.35rem;letter-spacing:-.04em}small{display:block;margin-top:2px;color:var(--fi-muted);font-size:.72rem}.compact .mark{width:40px;height:40px;border-radius:13px}
  `]
})
export class AppLogoComponent {
  compact = input(false);
  constructor() { addIcons({archiveOutline, locateOutline}); }
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon, IonButton],
  template: `
    <div class="empty-state fi-card">
      <div class="empty-icon"><ion-icon [name]="icon()"/></div>
      <h2>{{ title() }}</h2><p>{{ message() }}</p>
      @if (action() && href()) {
        <ion-button class="primary-action" [href]="href()">{{ action() }}</ion-button>
      } @else if (action()) {
        <ion-button type="button" class="primary-action" (click)="pressed.emit()">{{ action() }}</ion-button>
      }
    </div>`
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
  action = input('');
  href = input('');
  icon = input('cube-outline');
  pressed = output<void>();
  constructor() { addIcons({cubeOutline, archiveOutline, locateOutline}); }
}

@Component({
  selector: 'app-owner-selector',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="owners" role="radiogroup" aria-label="Propiedad">
      @for (person of owners; track person) {
        <button type="button" [class.active]="value() === person" (click)="valueChange.emit(person)">
          <span><ion-icon [name]="person === 'Compartido' ? 'people-outline' : 'person-outline'"/></span>
          {{ person }}
        </button>
      }
    </div>`,
  styles: [`
    .owners{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}button{min-height:74px;padding:9px;border:1px solid var(--fi-border);border-radius:15px;background:var(--fi-surface-2);color:var(--fi-muted);font:inherit;font-size:.76rem;font-weight:750;transition:.18s ease}button span{width:28px;height:28px;display:grid;place-items:center;margin:0 auto 5px;border-radius:50%;background:var(--fi-surface);font-size:15px}button.active{border-color:var(--fi-primary);background:var(--fi-primary-soft);color:var(--fi-primary-strong);box-shadow:inset 0 0 0 1px var(--fi-primary)}
  `]
})
export class OwnerSelectorComponent {
  value = input.required<Owner>();
  valueChange = output<Owner>();
  owners: Owner[] = ['Nahuel', 'ML', 'lili', 'Compartido'];
  constructor() { addIcons({personOutline, peopleOutline}); }
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [FormsModule, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonSearchbar, IonToolbar],
  template: `
    <button type="button" class="picker-trigger" [disabled]="disabled()" (click)="open.set(true)">
      <span><ion-icon name="location-outline"/></span>
      <div><small>{{ label() }}</small><strong>{{ selectedName() }}</strong></div>
      <ion-icon name="chevron-forward-outline"/>
    </button>
    <ion-modal [isOpen]="open()" (didDismiss)="open.set(false)"><ng-template>
      <ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="open.set(false)">Cancelar</ion-button></ion-buttons><b>{{ label() }}</b><span></span></div></ion-toolbar></ion-header>
      <ion-content><div class="tree-sheet">
        <ion-searchbar placeholder="Buscar ubicación" [(ngModel)]="term" debounce="120" show-clear-button="focus"/>
        <button type="button" class="tree-row none" [class.active]="value() === null" (click)="choose(null)"><span><ion-icon name="location-outline"/></span><strong>{{ emptyLabel() }}</strong>@if(value() === null){<ion-icon name="checkmark-circle"/>}</button>
        <div class="tree-list">
          @for (x of visibleTree(); track x.id) {
            <button type="button" class="tree-row" [class.active]="value() === x.id" [style.--depth]="x.depth" (click)="choose(x.id)">
              <i></i><span><ion-icon name="location-outline"/></span><div><strong>{{ x.location.name }}</strong><small>{{ pathFor(x.location) }}</small></div>@if(value() === x.id){<ion-icon name="checkmark-circle"/>}
            </button>
          }
        </div>
      </div></ion-content>
    </ng-template></ion-modal>
  `,
  styles: [`
    .picker-trigger{width:100%;min-height:62px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:11px;margin:10px 0;padding:10px 13px;border:1px solid transparent;border-radius:14px;background:var(--fi-surface-2);color:var(--fi-text);font:inherit;text-align:left}.picker-trigger:disabled{opacity:.55}.picker-trigger>span{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary)}.picker-trigger small{display:block;color:var(--fi-muted);font-size:.7rem;font-weight:750}.picker-trigger strong{display:block;margin-top:3px;font-size:.92rem}.picker-trigger>ion-icon{color:var(--fi-primary)}
    .modal-title{height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.modal-title span{display:block}.tree-sheet{padding:8px 16px 32px}ion-searchbar{padding:0 0 12px;--background:var(--fi-surface);--border-radius:15px;--box-shadow:none}
    .tree-list{display:grid;gap:8px}.tree-row{position:relative;width:100%;min-height:58px;display:grid;grid-template-columns:calc(var(--depth,0) * 18px) 38px 1fr auto;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--fi-border);border-radius:16px;background:var(--fi-surface);color:var(--fi-text);font:inherit;text-align:left}.tree-row.none{grid-template-columns:38px 1fr auto;margin-bottom:10px;background:var(--fi-primary-soft);border-color:transparent}.tree-row>span{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary)}.tree-row strong{display:block;font-size:.9rem}.tree-row small{display:block;margin-top:2px;color:var(--fi-muted);font-size:.72rem}.tree-row.active{border-color:var(--fi-primary);box-shadow:inset 0 0 0 1px var(--fi-primary)}.tree-row>ion-icon{color:var(--fi-primary);font-size:20px}
  `]
})
export class LocationPickerComponent {
  locations = input.required<Location[]>();
  value = input.required<string|null>();
  label = input('Ubicación');
  emptyLabel = input('Sin ubicación');
  disabled = input(false);
  valueChange = output<string|null>();
  open = signal(false);
  term = '';
  tree = computed(() => this.buildTree(this.locations()));
  constructor() { addIcons({locationOutline, chevronForwardOutline, checkmarkCircle}); }
  selectedName(){const x=this.locations().find(l=>l.id===this.value());return x?this.pathFor(x):this.emptyLabel();}
  choose(id:string|null){this.valueChange.emit(id);this.open.set(false);}
  visibleTree(){const q=this.term.trim().toLowerCase();return q?this.tree().filter(x=>this.pathFor(x.location).toLowerCase().includes(q)):this.tree();}
  pathFor(x:Location){return [...this.ancestors(x),x].map(p=>p.name).join(' / ');}
  ancestors(x:Location){const out:Location[]=[];let id=x.parent_id;while(id){const p=this.locations().find(r=>r.id===id);if(!p)break;out.unshift(p);id=p.parent_id;}return out;}
  buildTree(source:Location[]){const out:{id:string;location:Location;depth:number}[]=[];const allowed=new Set(source.map(x=>x.id));const walk=(parent:string|null,depth:number)=>{source.filter(x=>x.parent_id===parent||parent===null&&x.parent_id&&!allowed.has(x.parent_id)).sort((a,b)=>a.name.localeCompare(b.name,'es')).forEach(x=>{out.push({id:x.id,location:x,depth});walk(x.id,depth+1);});};walk(null,0);return out;}
}

@Component({
  selector: 'app-option-picker',
  standalone: true,
  imports: [FormsModule, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonSearchbar, IonToolbar],
  template: `
    <button type="button" class="picker-trigger" [disabled]="disabled()" (click)="open.set(true)">
      <span><ion-icon [name]="icon()"/></span>
      <div><small>{{ label() }}</small><strong>{{ selectedName() }}</strong></div>
      <ion-icon name="chevron-forward-outline"/>
    </button>
    <ion-modal [isOpen]="open()" (didDismiss)="open.set(false)"><ng-template>
      <ion-header><ion-toolbar><div class="modal-title"><ion-buttons><ion-button type="button" (click)="open.set(false)">Cancelar</ion-button></ion-buttons><b>{{ label() }}</b><span></span></div></ion-toolbar></ion-header>
      <ion-content><div class="tree-sheet">
        <ion-searchbar placeholder="Buscar" [(ngModel)]="term" debounce="120" show-clear-button="focus"/>
        @if (allowEmpty()) {
          <button type="button" class="tree-row none" [class.active]="value() === null" (click)="choose(null)"><span><ion-icon [name]="icon()"/></span><strong>{{ emptyLabel() }}</strong>@if(value() === null){<ion-icon name="checkmark-circle"/>}</button>
        }
        <div class="tree-list">
          @for (x of visibleOptions(); track x.value) {
            <button type="button" class="tree-row option-row" [class.active]="value() === x.value" (click)="choose(x.value)">
              <span><ion-icon [name]="icon()"/></span><div><strong>{{ x.label }}</strong></div>@if(value() === x.value){<ion-icon name="checkmark-circle"/>}
            </button>
          }
        </div>
      </div></ion-content>
    </ng-template></ion-modal>
  `,
  styles: [`
    .picker-trigger{width:100%;min-height:62px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:11px;margin:10px 0;padding:10px 13px;border:1px solid transparent;border-radius:14px;background:var(--fi-surface-2);color:var(--fi-text);font:inherit;text-align:left}.picker-trigger:disabled{opacity:.55}.picker-trigger>span{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary)}.picker-trigger small{display:block;color:var(--fi-muted);font-size:.7rem;font-weight:750}.picker-trigger strong{display:block;margin-top:3px;font-size:.92rem}.picker-trigger>ion-icon{color:var(--fi-primary)}
    .modal-title{height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.modal-title span{display:block}.tree-sheet{padding:8px 16px 32px}ion-searchbar{padding:0 0 12px;--background:var(--fi-surface);--border-radius:15px;--box-shadow:none}
    .tree-list{display:grid;gap:8px}.tree-row{position:relative;width:100%;min-height:58px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--fi-border);border-radius:16px;background:var(--fi-surface);color:var(--fi-text);font:inherit;text-align:left}.tree-row.none{margin-bottom:10px;background:var(--fi-primary-soft);border-color:transparent}.tree-row>span{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary)}.tree-row strong{display:block;font-size:.9rem}.tree-row.active{border-color:var(--fi-primary);box-shadow:inset 0 0 0 1px var(--fi-primary)}.tree-row>ion-icon{color:var(--fi-primary);font-size:20px}
  `]
})
export class OptionPickerComponent {
  options = input.required<{value:string;label:string}[]>();
  value = input.required<string|null>();
  label = input('Seleccionar');
  emptyLabel = input('Ninguno');
  allowEmpty = input(false);
  disabled = input(false);
  icon = input('cube-outline');
  valueChange = output<string|null>();
  open = signal(false);
  term = '';
  constructor() { addIcons({cubeOutline, archiveOutline, checkmarkCircle, chevronForwardOutline}); }
  selectedName(){if(this.value()===null)return this.emptyLabel();return this.options().find(x=>x.value===this.value())?.label||this.emptyLabel();}
  choose(value:string|null){this.valueChange.emit(value);this.open.set(false);}
  visibleOptions(){const q=this.term.trim().toLowerCase();return q?this.options().filter(x=>x.label.toLowerCase().includes(q)):this.options();}
}
