import { Component } from "@angular/core";
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    this.initStatusBar();
  }

  private async initStatusBar() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (err) {
      console.log('StatusBar plugin not available', err);
    }
  }
}
