import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonSearchbar, IonSpinner, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, chevronForwardOutline, cubeOutline, locationOutline, logOutOutline, moonOutline, peopleOutline, personOutline, searchOutline, sunnyOutline } from 'ionicons/icons';
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
              <a href="#/lugares"><span><ion-icon name="location-outline"></ion-icon></span><b>Explorar ubicaciones</b><small>Casa, habitación, cajones</small><ion-icon name="chevron-forward-outline"></ion-icon></a>
              <a href="#/cajas?nuevo=1"><span><ion-icon name="archive-outline"></ion-icon></span><b>Añadir caja</b><small>Algo movible</small><ion-icon name="add"></ion-icon></a>
            </div>
          </section>

          @if (hasOverview()) {
            <section>
              <div class="section-title"><h2>Resumen</h2><span>Ahora mismo</span></div>
              <div class="stats-grid">
                <a href="#/objetos" class="fi-card stat-card"><ion-icon name="cube-outline"/><strong>{{itemsCount()}}</strong><span>Objetos</span></a>
                <a href="#/lugares" class="fi-card stat-card"><ion-icon name="location-outline"/><strong>{{locationsCount()}}</strong><span>Ubicaciones</span></a>
                <a href="#/cajas" class="fi-card stat-card"><ion-icon name="archive-outline"/><strong>{{boxesCount()}}</strong><span>Cajas</span></a>
              </div>
            </section>

            @if (topLocations().length) {
              <section>
                <div class="section-title"><h2>Mapa de casa</h2><span>{{topLocations().length}} principales</span></div>
                <div class="map-list">
                  @for (x of topLocations(); track x.id) {
                    <a class="fi-card map-row" [href]="'#/lugares?parent=' + x.id">
                      <span><ion-icon name="location-outline"/></span>
                      <div><b>{{x.name}}</b><small>{{locationSummary(x.id)}}</small></div>
                      <ion-icon name="chevron-forward-outline"/>
                    </a>
                  }
                </div>
              </section>
            }

            @if (recentItems().length) {
              <section>
                <div class="section-title"><h2>Últimos objetos</h2><span>{{recentItems().length}}</span></div>
                <div class="fi-grid">
                  @for (x of recentItems(); track x.id) {
                    <a class="fi-card entity-card compact editable-card" [href]="itemHref(x)">
                      <div class="visual">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="cube-outline"/>}</div>
                      <div class="body"><h3>{{x.name}}</h3><p>{{placeName(x)}}</p>
                        <div class="meta-row"><span class="fi-chip">{{x.category || 'Otros'}}</span><span class="fi-chip">{{x.owner}}</span></div>
                      </div>
                    </a>
                  }
                </div>
              </section>
            }
          } @else {
            <app-empty-state title="Todo listo para encontrarlo"
              message="Busca algo arriba o crea tu primera ubicación para empezar a organizar cajas y objetos."
              action="Crear primera ubicación" icon="location-outline" href="#/lugares?nuevo=1"/>
          }
        } @else if (!loading() && !items().length && !boxes().length) {
          <app-empty-state title="No hemos encontrado nada" message="Prueba con otro nombre, categoría o palabra de la descripción." icon="search-outline"/>
        }

        @if (items().length) {
          <div class="section-title"><h2>Objetos</h2><span>{{ items().length }} resultados</span></div>
          <div class="fi-grid">
            @for (x of items(); track x.id) {
              <a class="fi-card entity-card editable-card" [href]="itemHref(x)">
                <div class="visual">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="cube-outline"/>}</div>
                <div class="body"><h3>{{x.name}}</h3><p class="result-place"><ion-icon name="location-outline"/>{{placeName(x)}}</p><p>{{x.description || 'Sin descripción'}}</p>
                  <div class="meta-row"><span class="fi-chip"><ion-icon [name]="x.owner==='Compartido'?'people-outline':'person-outline'"/>{{x.owner}}</span><span class="fi-chip">{{x.category || 'Otros'}}</span></div>
                </div>
              </a>
            }
          </div>
        }
        @if (boxes().length) {
          <div class="section-title"><h2>Cajas</h2><span>{{ boxes().length }} resultados</span></div>
          <div class="fi-grid">
            @for (x of boxes(); track x.id) {
              <article class="fi-card entity-card">
                <div class="visual">@if(x.url){<img [src]="x.url" [alt]="x.name"/>}@else{<ion-icon name="archive-outline"/>}</div>
                <div class="body"><h3>{{x.name}}</h3><p class="result-place"><ion-icon name="location-outline"/>{{boxPlaceName(x)}}</p><p>{{x.description || 'Sin descripción del contenido'}}</p>
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
    .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stat-card{display:grid;gap:3px;padding:16px;color:var(--fi-text);text-decoration:none}.stat-card ion-icon{width:34px;height:34px;padding:8px;border-radius:13px;background:var(--fi-primary-soft);color:var(--fi-primary);font-size:19px}.stat-card strong{margin-top:8px;font-size:1.7rem;line-height:1}.stat-card span{color:var(--fi-muted);font-size:.78rem;font-weight:750}.map-list{display:grid;gap:9px}.map-row{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:12px;padding:13px;color:var(--fi-text);text-decoration:none}.map-row>span{width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:var(--fi-primary-soft);color:var(--fi-primary)}.map-row b{display:block;font-size:.92rem}.map-row small{display:block;margin-top:3px;color:var(--fi-muted);font-size:.76rem}.map-row>ion-icon{color:var(--fi-primary)}.editable-card{color:var(--fi-text);text-decoration:none}.entity-card.compact{min-height:130px}.entity-card.compact .visual{height:100%}.entity-card.compact .body h3{margin-top:0}.result-place{display:flex;align-items:center;gap:6px;height:auto!important;margin:4px 0 6px!important;color:var(--fi-primary)!important;font-weight:800}.result-place ion-icon{flex:0 0 auto;font-size:15px}
    @media(max-width:680px){.quick-grid{grid-template-columns:1fr;gap:8px}.stats-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.stat-card{padding:12px}.stat-card strong{font-size:1.35rem}.stat-card ion-icon{width:30px;height:30px;padding:7px}.hero{padding-top:4px}.hero h1{margin-bottom:12px}.home ::ng-deep .empty-state{padding:24px 18px}.home ::ng-deep .empty-state .empty-icon{width:54px;height:54px;margin-bottom:12px;border-radius:18px}.home ::ng-deep .empty-state .empty-icon ion-icon{font-size:1.7rem}.home ::ng-deep .empty-state h2{font-size:1.05rem}.home ::ng-deep .empty-state p{margin-bottom:14px;font-size:.82rem;line-height:1.35}}
  `]
})
export class HomePage {
  data = inject(DataService); auth = inject(AuthService); theme = inject(ThemeService);
  term = ''; scope: 'mine'|'all' = 'mine'; items = signal<any[]>([]); boxes = signal<any[]>([]); allItems = signal<any[]>([]); allBoxes = signal<any[]>([]); locations = signal<any[]>([]); loading = signal(false);
  constructor() { addIcons({moonOutline,sunnyOutline,logOutOutline,personOutline,peopleOutline,cubeOutline,archiveOutline,locationOutline,searchOutline,chevronForwardOutline,add}); this.loadOverview(); }
  greeting() { const hour = new Date().getHours(); return hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'; }
  initial() { return this.auth.profile()?.display_name?.charAt(0) || '?'; }
  setScope(scope: 'mine'|'all') { this.scope = scope; this.run(); }
  async loadOverview() {
    const [locations, items, boxes] = await Promise.all([this.data.locations(), this.data.items(), this.data.boxes()]);
    this.locations.set(locations);
    this.allBoxes.set(boxes);
    this.allItems.set(await Promise.all(items.map(async x => ({...x, url: await this.data.signed(x.photo_path)}))));
  }
  hasOverview(){return this.locationsCount()+this.itemsCount()+this.boxesCount()>0;}
  locationsCount(){return this.locations().length;}
  itemsCount(){return this.allItems().length;}
  boxesCount(){return this.allBoxes().length;}
  topLocations(){return this.locations().filter(x=>!x.parent_id).slice(0,4);}
  recentItems(){return [...this.allItems()].sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||'')).slice(0,6);}
  placeName(x:any){return x.location_id?this.locationPath(x.location_id):x.box_id?this.itemBoxPath(x.box_id):'Sin ubicación';}
  boxPlaceName(x:any){return x.location_id?this.locationPath(x.location_id):x.parent_box_id?this.itemBoxPath(x.parent_box_id):'Sin ubicación';}
  itemBoxPath(id:string): string {const box=this.allBoxes().find(x=>x.id===id)||this.boxes().find(x=>x.id===id);if(!box)return 'En una caja';const place: string=box.location_id?this.locationPath(box.location_id):box.parent_box_id?this.itemBoxPath(box.parent_box_id):'Sin ubicación';return `${place} / ${box.name}`;}
  itemLocationId(x:any): string|null {if(x.location_id)return x.location_id;let box=this.allBoxes().find(b=>b.id===x.box_id)||this.boxes().find(b=>b.id===x.box_id);while(box){if(box.location_id)return box.location_id;box=this.allBoxes().find(b=>b.id===box.parent_box_id)||this.boxes().find(b=>b.id===box.parent_box_id);}return null;}
  itemHref(x:any){const location=this.itemLocationId(x);return location?`#/lugares?parent=${location}&editarObjeto=${x.id}`:`#/lugares?editarObjeto=${x.id}`;}
  locationSummary(id:string){const locs=this.locations().filter(x=>x.parent_id===id).length;const items=this.allItems().filter(x=>x.location_id===id).length;const boxes=this.allBoxes().filter(x=>x.location_id===id).length;return [locs?`${locs} ubicaciones`:null,items?`${items} objetos`:null,boxes?`${boxes} cajas`:null].filter(Boolean).join(' · ')||'Vacío';}
  locationPath(id:string){const out:string[]=[];let current=this.locations().find(x=>x.id===id);while(current){out.unshift(current.name);current=this.locations().find(x=>x.id===current.parent_id);}return out.slice(-2).join(' / ')||'Ubicación';}
  async run() {
    if (!this.term.trim()) { this.items.set([]); this.boxes.set([]); this.loading.set(false); return; }
    this.loading.set(true);
    try {
      const r = await this.data.search(this.term, this.scope);
      const [items, boxes] = await Promise.all([
        Promise.all(r.items.map(async x => ({...x, url: await this.data.signed(x.photo_path)}))),
        Promise.all(r.boxes.map(async x => ({...x, url: await this.data.signed(x.exterior_photo_path)})))
      ]);
      this.items.set(items); this.boxes.set(boxes); this.allBoxes.set(this.mergeById(this.allBoxes(), boxes));
    } finally { this.loading.set(false); }
  }
  mergeById(a:any[],b:any[]){return [...new Map([...a,...b].map(x=>[x.id,x])).values()];}
}
