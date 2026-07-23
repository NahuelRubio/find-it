import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonIcon, IonSearchbar, IonSegment, IonSegmentButton, IonSpinner, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, cubeOutline, locationOutline, logOutOutline, moonOutline, peopleOutline, personOutline, searchOutline, sunnyOutline } from 'ionicons/icons';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { ThemeService } from '../core/theme.service';
import { AppLogoComponent, EmptyStateComponent } from '../shared/ui.components';

@Component({
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonHeader, IonIcon, IonSearchbar, IonSegment, IonSegmentButton, IonSpinner, IonToolbar, AppLogoComponent, EmptyStateComponent],
  template: `
    <ion-header><ion-toolbar>
      <div class="topbar"><app-logo [compact]="true"/><div class="top-actions">
        <ion-button fill="clear" (click)="theme.toggle()" aria-label="Cambiar tema"><ion-icon [name]="theme.dark()?'sunny-outline':'moon-outline'"/></ion-button>
        <button class="avatar" (click)="auth.logout()" aria-label="Cerrar sesión">{{ initial() }}<ion-icon name="log-out-outline"/></button>
      </div></div>
    </ion-toolbar></ion-header>
    <ion-content>
      <main class="page-shell home">
        <section class="hero">
          <p>{{ greeting() }}, {{ auth.profile()?.display_name }}</p>
          <h1>¿Qué estás buscando?</h1>
          <div class="search-wrap">
            <ion-searchbar placeholder="Prueba «cargador», «pasaporte»…" [(ngModel)]="term" (ionInput)="run()" debounce="250" show-clear-button="focus"/>
            @if (loading()) { <ion-spinner name="crescent"/> }
          </div>
          <ion-segment [(ngModel)]="scope" (ionChange)="run()">
            <ion-segment-button value="mine"><ion-icon name="person-outline"/>Mis cosas y compartidas</ion-segment-button>
            <ion-segment-button value="all"><ion-icon name="people-outline"/>Todo lo de casa</ion-segment-button>
          </ion-segment>
        </section>

        @if (!term.trim()) {
          <section class="quick">
            <div class="section-title"><h2>Acciones rápidas</h2><span>Organiza en segundos</span></div>
            <div class="quick-grid">
              <button (click)="go('objetos')"><span><ion-icon name="cube-outline"/></span><b>Añadir objeto</b><small>Algo que quieras encontrar</small><ion-icon name="add"/></button>
              <button (click)="go('cajas')"><span><ion-icon name="archive-outline"/></span><b>Añadir caja</b><small>Agrupa tus cosas</small><ion-icon name="add"/></button>
              <button (click)="go('lugares')"><span><ion-icon name="location-outline"/></span><b>Añadir ubicación</b><small>Crea un nuevo lugar</small><ion-icon name="add"/></button>
            </div>
          </section>
          <app-empty-state title="Todo listo para encontrarlo"
            message="Busca algo arriba o crea tu primera ubicación para empezar a organizar cajas y objetos."
            action="Crear primera ubicación" icon="location-outline" (pressed)="go('lugares')"/>
        } @else if (!loading() && !items().length && !boxes().length) {
          <app-empty-state title="No hemos encontrado nada" message="Prueba con otro nombre, categoría o palabra de la descripción." icon="search-outline"/>
        }

        @if (items().length) {
          <div class="section-title"><h2>Objetos</h2><span>{{ items().length }} resultados</span></div>
          <div class="fi-grid">
            @for (x of items(); track x.id) {
              <article class="fi-card entity-card">
                <div class="visual">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="cube-outline"/>}</div>
                <div class="body"><h3>{{x.name}}</h3><p>{{x.description || 'Sin descripción'}}</p>
                  <div class="meta-row"><span class="fi-chip"><ion-icon [name]="x.owner==='Compartido'?'people-outline':'person-outline'"/>{{x.owner}}</span><span class="fi-chip">{{x.category || 'Otros'}}</span></div>
                </div>
              </article>
            }
          </div>
        }
        @if (boxes().length) {
          <div class="section-title"><h2>Cajas</h2><span>{{ boxes().length }} resultados</span></div>
          <div class="fi-grid">
            @for (x of boxes(); track x.id) {
              <article class="fi-card entity-card">
                <div class="visual">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="archive-outline"/>}</div>
                <div class="body"><h3>{{x.name}}</h3><p>{{x.description || 'Sin descripción del contenido'}}</p>
                  <div class="meta-row"><span class="fi-chip">{{x.category || 'Otros'}}</span><span class="fi-chip">{{x.owner}}</span></div>
                </div>
              </article>
            }
          </div>
        }
      </main>
    </ion-content>`,
  styles: [`
    .topbar{width:min(100% - 28px,920px);height:64px;margin:auto;display:flex;align-items:center;justify-content:space-between}.top-actions{display:flex;align-items:center}.avatar{position:relative;width:40px;height:40px;border:0;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary-strong);font-weight:800}.avatar ion-icon{position:absolute;right:-4px;bottom:-3px;padding:3px;border-radius:50%;background:var(--fi-surface);font-size:10px}
    .hero{padding:18px 0 8px}.hero>p{margin:0 0 5px;color:var(--fi-primary);font-weight:750}.hero h1{margin:0 0 24px;font-size:clamp(2.1rem,7vw,3.5rem);letter-spacing:-.055em}.search-wrap{position:relative}.search-wrap ion-spinner{position:absolute;right:20px;top:19px;z-index:2;width:20px;color:var(--fi-primary)}
    ion-searchbar{--background:var(--fi-surface);--color:var(--fi-text);--placeholder-color:var(--fi-muted);--icon-color:var(--fi-primary);--border-radius:20px;--box-shadow:var(--fi-shadow);padding:0;min-height:66px}
    ion-segment{margin-top:14px;padding:4px;border-radius:16px;background:var(--fi-surface-2)}ion-segment-button{--indicator-color:var(--fi-surface);--color:var(--fi-muted);--color-checked:var(--fi-primary-strong);min-height:44px;font-size:.74rem;text-transform:none}ion-segment-button ion-icon{margin-right:5px;font-size:14px}
    .quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px}.quick-grid button{position:relative;display:grid;grid-template-columns:42px 1fr auto;grid-template-rows:auto auto;gap:1px 12px;align-items:center;text-align:left;padding:15px;border:1px solid var(--fi-border);border-radius:18px;background:var(--fi-surface);color:var(--fi-text);box-shadow:0 5px 18px rgba(30,67,61,.05);font:inherit}.quick-grid button>span{grid-row:1/3;width:42px;height:42px;display:grid;place-items:center;border-radius:14px;background:var(--fi-primary-soft);color:var(--fi-primary)}.quick-grid b{font-size:.82rem}.quick-grid small{color:var(--fi-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.quick-grid button>ion-icon{grid-row:1/3;grid-column:3;color:var(--fi-primary)}
    @media(max-width:680px){.quick-grid{grid-template-columns:1fr}.hero{padding-top:8px}.hero h1{margin-bottom:18px}}
  `]
})
export class HomePage {
  data = inject(DataService); auth = inject(AuthService); theme = inject(ThemeService); private router = inject(Router);
  term = ''; scope: 'mine'|'all' = 'mine'; items = signal<any[]>([]); boxes = signal<any[]>([]); loading = signal(false);
  constructor() { addIcons({moonOutline,sunnyOutline,logOutOutline,personOutline,peopleOutline,cubeOutline,archiveOutline,locationOutline,searchOutline,add}); }
  greeting() { const hour = new Date().getHours(); return hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'; }
  initial() { return this.auth.profile()?.display_name?.charAt(0) || '?'; }
  go(path: string) { this.router.navigateByUrl('/' + path); }
  async run() {
    if (!this.term.trim()) { this.items.set([]); this.boxes.set([]); this.loading.set(false); return; }
    this.loading.set(true);
    try {
      const r = await this.data.search(this.term, this.scope);
      const [items, boxes] = await Promise.all([
        Promise.all(r.items.map(async x => ({...x, url: await this.data.signed(x.photo_path)}))),
        Promise.all(r.boxes.map(async x => ({...x, url: await this.data.signed(x.exterior_photo_path)})))
      ]);
      this.items.set(items); this.boxes.set(boxes);
    } finally { this.loading.set(false); }
  }
}
