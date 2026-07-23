import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonInput, IonNote, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, contrastOutline, eyeOffOutline, eyeOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { AuthService } from '../core/auth.service';
import { PersonName } from '../core/models';
import { ThemePreference, ThemeService } from '../core/theme.service';
import { AppLogoComponent } from '../shared/ui.components';

@Component({
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonIcon, IonInput, IonNote, IonSpinner, AppLogoComponent],
  template: `
    <ion-content>
      <main class="login-shell">
        <div class="orb one"></div><div class="orb two"></div>
        <section class="welcome">
          <app-logo/>
          <div>
            <p class="eyebrow">Tu casa, organizada</p>
            <h1>Encuentra lo que guardaste, justo cuando lo necesitas.</h1>
            <p class="subtitle">Todo en su sitio, siempre localizable.</p>
          </div>
          <div class="home-sketch" aria-hidden="true"><span>⌂</span><i></i><b></b></div>
        </section>
        <section class="login-card fi-card">
          <div class="mobile-brand"><app-logo/></div>
          <div class="card-title"><div><p class="eyebrow">Bienvenido de nuevo</p><h2>¿Quién busca hoy?</h2></div>
            <div class="themes" aria-label="Tema">
              @for (option of themeOptions; track option.value) {
                <button type="button" [class.active]="theme.preference() === option.value" (click)="theme.set(option.value)" [attr.aria-label]="option.label">
                  <ion-icon [name]="option.icon"/>
                </button>
              }
            </div>
          </div>
          <div class="people">
            @for (person of people; track person.name) {
              <button type="button" [class.active]="name === person.name" (click)="name=person.name">
                <span>{{ person.initials }}</span><strong>{{ person.name }}</strong>
                @if (name === person.name) { <ion-icon name="checkmark-circle"/> }
              </button>
            }
          </div>
          <label>Contraseña de la casa</label>
          <div class="password">
            <ion-input [type]="showPassword ? 'text' : 'password'" placeholder="Tu contraseña compartida" [(ngModel)]="password" (keyup.enter)="enter()"/>
            <button type="button" (click)="showPassword=!showPassword" aria-label="Mostrar u ocultar contraseña"><ion-icon [name]="showPassword?'eye-off-outline':'eye-outline'"/></button>
          </div>
          @if (error()) { <ion-note class="error-note">{{ error() }}</ion-note> }
          <ion-button type="button" expand="block" class="primary-action" (click)="enter()" [disabled]="loading() || !password">
            @if (loading()) { <ion-spinner name="crescent"/> } @else { Entrar en Find it }
          </ion-button>
          <label class="remember"><input type="checkbox" [(ngModel)]="remember"> Recordar este dispositivo</label>
        </section>
      </main>
    </ion-content>`,
  styles: [`
    .login-shell{position:relative;min-height:100%;display:grid;grid-template-columns:1.05fr .8fr;gap:clamp(30px,7vw,100px);align-items:center;width:min(1120px,calc(100% - 48px));margin:auto;padding:48px 0;overflow:hidden}
    .welcome{position:relative;z-index:1;display:flex;min-height:560px;flex-direction:column;justify-content:space-between;padding:10px}.welcome h1{max-width:650px;margin:10px 0 16px;font-size:clamp(2.5rem,5vw,4.7rem);line-height:.98;letter-spacing:-.065em}.subtitle{color:var(--fi-muted);font-size:1.08rem}
    .home-sketch{position:relative;width:210px;height:100px;color:var(--fi-primary);opacity:.5}.home-sketch span{font-size:100px;line-height:1}.home-sketch i,.home-sketch b{position:absolute;bottom:12px;width:70px;height:50px;border:2px solid currentColor;border-radius:14px}.home-sketch i{left:92px}.home-sketch b{left:146px;bottom:30px}
    .orb{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none}.orb.one{width:420px;height:420px;left:-230px;top:-140px;background:var(--fi-primary-soft)}.orb.two{width:280px;height:280px;right:-190px;bottom:-110px;background:var(--fi-primary-soft)}
    .login-card{position:relative;z-index:2;padding:30px}.mobile-brand{display:none}.card-title{display:flex;justify-content:space-between;align-items:start;gap:16px}.card-title h2{margin:0 0 24px;font-size:1.55rem;letter-spacing:-.035em}
    .themes{display:flex;padding:3px;border-radius:12px;background:var(--fi-surface-2)}.themes button{width:34px;height:34px;border:0;border-radius:9px;background:transparent;color:var(--fi-muted)}.themes button.active{background:var(--fi-surface);color:var(--fi-primary);box-shadow:0 3px 8px rgba(0,0,0,.08)}
    .people{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}.people button{position:relative;min-height:104px;border:1px solid var(--fi-border);border-radius:18px;background:var(--fi-surface-2);color:var(--fi-text);font:inherit}.people span{display:grid;place-items:center;width:48px;height:48px;margin:0 auto 7px;border-radius:17px;background:var(--fi-primary-soft);color:var(--fi-primary);font-weight:800}.people strong{font-size:.9rem}.people ion-icon{position:absolute;right:9px;top:9px;color:var(--fi-primary);opacity:0}.people button.active{border-color:var(--fi-primary);box-shadow:inset 0 0 0 1px var(--fi-primary)}.people button.active ion-icon{opacity:1}
    label{display:block;margin:0 4px 8px;font-size:.78rem;font-weight:750;color:var(--fi-muted)}.password{display:flex;align-items:center;border:1px solid var(--fi-border);border-radius:15px;background:var(--fi-surface-2);overflow:hidden}.password ion-input{--padding-start:15px;min-height:54px}.password button{width:50px;height:50px;border:0;background:transparent;color:var(--fi-muted);font-size:20px}.remember{margin-top:15px;text-align:center;font-weight:500}.remember input{accent-color:var(--fi-primary);vertical-align:-1px}
    @media(max-width:760px){.login-shell{display:block;width:min(100% - 28px,460px);padding:30px 0}.welcome{display:none}.login-card{padding:24px}.mobile-brand{display:block;margin-bottom:36px}.card-title{align-items:center}}
  `]
})
export class LoginPage {
  private auth = inject(AuthService);
  theme = inject(ThemeService);
  name: PersonName = 'Nahuel';
  password = '';
  remember = true;
  showPassword = false;
  loading = signal(false);
  error = signal('');
  people: {name: PersonName; initials: string}[] = [{name: 'Nahuel', initials: 'N'}, {name: 'ML', initials: 'ML'}, {name: 'lili', initials: 'L'}];
  themeOptions: {value: ThemePreference; label: string; icon: string}[] = [
    {value:'light', label:'Claro', icon:'sunny-outline'}, {value:'dark', label:'Oscuro', icon:'moon-outline'}, {value:'system', label:'Sistema', icon:'contrast-outline'}
  ];
  constructor() { addIcons({checkmarkCircle, contrastOutline, eyeOffOutline, eyeOutline, moonOutline, sunnyOutline}); }
  async enter() {
    if (!this.password) return;
    this.loading.set(true); this.error.set('');
    try { await this.auth.login(this.name, this.password, this.remember); }
    catch (e: any) { this.error.set(e?.message || 'No hemos podido entrar. Comprueba la contraseña.'); }
    finally { this.loading.set(false); }
  }
}
