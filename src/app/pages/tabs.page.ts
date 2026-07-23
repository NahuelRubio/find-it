import { Component } from '@angular/core';
import { IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, cubeOutline, homeOutline, locationOutline, trashOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  imports: [IonRouterOutlet, IonIcon],
  template: `
    <ion-router-outlet></ion-router-outlet>
    <nav class="bottom-nav" aria-label="Navegación principal">
      <a href="#/inicio"><ion-icon name="home-outline"></ion-icon><span>Inicio</span></a>
      <a href="#/lugares"><ion-icon name="location-outline"></ion-icon><span>Ubicaciones</span></a>
      <a class="add-link" href="#/objetos"><span><ion-icon name="add"></ion-icon></span><em>Añadir</em></a>
      <a href="#/cajas"><ion-icon name="archive-outline"></ion-icon><span>Cajas</span></a>
      <a href="#/papelera"><ion-icon name="trash-outline"></ion-icon><span>Papelera</span></a>
    </nav>`,
  styles: [`
    .bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:1000;display:grid;grid-template-columns:repeat(5,1fr);height:88px;padding:8px max(10px,env(safe-area-inset-left)) max(8px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-right));border-top:1px solid var(--fi-border);background:var(--fi-surface);box-shadow:0 -10px 28px rgba(25,67,61,.08)}
    .bottom-nav a{display:grid;place-items:center;align-content:center;gap:4px;color:var(--fi-muted);font-size:12px;text-decoration:none}.bottom-nav ion-icon{font-size:24px}.bottom-nav a:active,.bottom-nav a:hover{color:var(--fi-primary)}
    .add-link span{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--fi-primary);color:white;box-shadow:0 7px 18px rgba(36,101,91,.25)}.add-link span ion-icon{font-size:28px}.add-link em{color:var(--fi-muted);font-style:normal}
  `]
})
export class TabsPage {
  constructor() { addIcons({homeOutline, locationOutline, archiveOutline, cubeOutline, trashOutline, add}); }
}
