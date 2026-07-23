import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, archiveOutline, cubeOutline, homeOutline, locationOutline, trashOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet],
  template: `
    <ion-tabs>
      <ion-router-outlet/>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="inicio" href="#/inicio"><ion-icon name="home-outline"/><ion-label>Inicio</ion-label></ion-tab-button>
        <ion-tab-button tab="lugares" href="#/lugares"><ion-icon name="location-outline"/><ion-label>Ubicaciones</ion-label></ion-tab-button>
        <ion-tab-button class="add-tab" tab="objetos" href="#/objetos"><span><ion-icon name="add"/></span><ion-label>Añadir</ion-label></ion-tab-button>
        <ion-tab-button tab="cajas" href="#/cajas"><ion-icon name="archive-outline"/><ion-label>Cajas</ion-label></ion-tab-button>
        <ion-tab-button tab="papelera" href="#/papelera"><ion-icon name="trash-outline"/><ion-label>Papelera</ion-label></ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>`,
  styles: [`
    ion-tab-bar{--background:color-mix(in srgb,var(--fi-surface) 94%,transparent);--border:0;position:absolute;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(560px,calc(100% - 20px));height:72px;padding:5px 6px;border:1px solid var(--fi-border);border-radius:24px;box-shadow:0 12px 38px rgba(25,67,61,.16);backdrop-filter:blur(18px)}
    ion-tab-button{--color:var(--fi-muted);--color-selected:var(--fi-primary);--background:transparent;font-size:10px}ion-tab-button ion-icon{font-size:21px}.add-tab span{display:grid;place-items:center;width:43px;height:43px;margin-top:-19px;border:5px solid var(--fi-bg);border-radius:15px;background:var(--fi-primary);color:white;box-sizing:content-box;box-shadow:0 7px 18px rgba(36,101,91,.25)}.add-tab span ion-icon{font-size:25px}.add-tab ion-label{margin-top:2px}
  `]
})
export class TabsPage {
  constructor() { addIcons({homeOutline, locationOutline, archiveOutline, cubeOutline, trashOutline, add}); }
}
