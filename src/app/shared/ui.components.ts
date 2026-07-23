import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, cubeOutline, locateOutline, personOutline, peopleOutline } from 'ionicons/icons';
import { Owner } from '../core/models';

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
