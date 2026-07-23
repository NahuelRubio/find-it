import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonSearchbar, IonSpinner, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, cubeOutline, locationOutline, logOutOutline, moonOutline, peopleOutline, personOutline, searchOutline, sunnyOutline } from 'ionicons/icons';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { ThemeService } from '../core/theme.service';
import { AppLogoComponent, EmptyStateComponent } from '../shared/ui.components';

@Component({
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonHeader, IonIcon, IonSearchbar, IonSpinner, IonToolbar, AppLogoComponent, EmptyStateComponent],
  template: `
    <ion-header><ion-toolbar>
      <div class="topbar"><app-logo [compact]="true"/><div class="top-actions">
        <ion-button type="button" fill="clear" (click)="theme.toggle()" aria-label="Cambiar tema"><ion-icon [name]="theme.dark()?'sunny-outline':'moon-outline'"/></ion-button>
        <button type="button" class="avatar" (click)="auth.logout()" aria-label="Cerrar sesión">{{ initial() }}<ion-icon name="log-out-outline"/></button>
      </div></div>
    </ion-toolbar></ion-header>
    <ion-content>
      <main class="page-shell home">
        <section class="hero">
          <p>{{ greeting() }}, {{ auth.profile()?.display_name }}</p>
          <h1>¿Qué estás buscando?</h1>
          <div class="search-wrap">
            <ion-searchbar placeholder="Prueba «cargador», «pasaporte»…" [(ngModel)]="term" (ionInput)="run()" debounce="250" show-clear-button="focus"></ion-searchbar>
            @if (loading()) { <ion-spinner name="crescent"/> }
          </div>
          <div class="scope-toggle" role="group" aria-label="Alcance de búsqueda">
            <button type="button" [class.active]="scope==='mine'" (click)="setScope('mine')"><ion-icon name="person-outline"></ion-icon><span>Mis cosas y compartidas</span></button>
            <button type="button" [class.active]="scope==='all'" (click)="setScope('all')"><ion-icon name="people-outline"></ion-icon><span>Todo lo de casa</span></button>
          </div>
        </section>

        @if (!term.trim()) {
          <section class="quick">
            <div class="section-title"><h2>Acciones rápidas</h2><span>Organiza en segundos</span></div>
            <div class="quick-grid">
              <a href="#/objetos?nuevo=1"><span><ion-icon name="cube-outline"></ion-icon></span><b>Añadir objeto</b><small>Algo que quieras encontrar</small><ion-icon name="add"></ion-icon></a>
              <a href="#/cajas?nuevo=1"><span><ion-icon name="archive-outline"></ion-icon></span><b>Añadir caja</b><small>Agrupa tus cosas</small><ion-icon name="add"></ion-icon></a>
              <a href="#/lugares?nuevo=1"><span><ion-icon name="location-outline"></ion-icon></span><b>Añadir ubicación</b><small>Crea un nuevo lugar</small><ion-icon name="add"></ion-icon></a>
            </div>
          </section>
          <app-empty-state title="Todo listo para encontrarlo"
            message="Busca algo arriba o crea tu primera ubicación para empezar a organizar cajas y objetos."
            action="Crear primera ubicación" icon="location-outline" href="#/lugares?nuevo=1"/>
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
    .home{padding-bottom:128px}.hero{padding:10px 0 6px}.hero>p{margin:0 0 5px;color:var(--fi-primary);font-weight:750}.hero h1{margin:0 0 16px;font-size:clamp(1.85rem,7vw,3.5rem);letter-spacing:0}.search-wrap{position:relative}.search-wrap ion-spinner{position:absolute;right:20px;top:19px;z-index:2;width:20px;color:var(--fi-primary)}
    .search-wrap,.scope-toggle{width:min(100%,980px);margin-left:auto;margin-right:auto}
    ion-searchbar{--background:var(--fi-surface);--color:var(--fi-text);--placeholder-color:var(--fi-muted);--icon-color:var(--fi-primary);--border-radius:18px;--box-shadow:var(--fi-shadow);padding:0;min-height:58px}
    .scope-toggle{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px;padding:6px;border:1px solid var(--fi-border);border-radius:18px;background:var(--fi-surface-2)}
    .scope-toggle button{display:grid;grid-template-columns:auto auto;justify-content:center;align-items:center;gap:8px;min-height:54px;border:0;border-radius:13px;background:transparent;color:var(--fi-muted);font:inherit;font-size:.86rem;font-weight:750}
    .scope-toggle button.active{background:var(--fi-surface);color:var(--fi-primary-strong);box-shadow:0 8px 20px rgba(30,67,61,.08)}
    .scope-toggle ion-icon{font-size:17px}
    .quick .section-title{margin-top:18px}.quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}.quick-grid a{position:relative;display:grid;grid-template-columns:42px 1fr auto;grid-template-rows:auto auto;gap:1px 12px;align-items:center;text-align:left;padding:13px;border:1px solid var(--fi-border);border-radius:18px;background:var(--fi-surface);color:var(--fi-text);box-shadow:0 5px 18px rgba(30,67,61,.05);font:inherit;text-decoration:none}.quick-grid a>span{grid-row:1/3;width:42px;height:42px;display:grid;place-items:center;border-radius:14px;background:var(--fi-primary-soft);color:var(--fi-primary)}.quick-grid b{font-size:.82rem}.quick-grid small{color:var(--fi-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.quick-grid a>ion-icon{grid-row:1/3;grid-column:3;color:var(--fi-primary)}
    @media(max-width:680px){.quick-grid{grid-template-columns:1fr;gap:8px}.hero{padding-top:4px}.hero h1{margin-bottom:12px}.home ::ng-deep .empty-state{padding:24px 18px}.home ::ng-deep .empty-state .empty-icon{width:54px;height:54px;margin-bottom:12px;border-radius:18px}.home ::ng-deep .empty-state .empty-icon ion-icon{font-size:1.7rem}.home ::ng-deep .empty-state h2{font-size:1.05rem}.home ::ng-deep .empty-state p{margin-bottom:14px;font-size:.82rem;line-height:1.35}}
  `]
})
export class HomePage {
  data = inject(DataService); auth = inject(AuthService); theme = inject(ThemeService);
  term = ''; scope: 'mine'|'all' = 'mine'; items = signal<any[]>([]); boxes = signal<any[]>([]); loading = signal(false);
  constructor() { addIcons({moonOutline,sunnyOutline,logOutOutline,personOutline,peopleOutline,cubeOutline,archiveOutline,locationOutline,searchOutline,add}); }
  greeting() { const hour = new Date().getHours(); return hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'; }
  initial() { return this.auth.profile()?.display_name?.charAt(0) || '?'; }
  setScope(scope: 'mine'|'all') { this.scope = scope; this.run(); }
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
