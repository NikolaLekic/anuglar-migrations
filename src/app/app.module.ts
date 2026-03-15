import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Nora from '@primeng/themes/nora';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// Override Nora's default Emerald primary with our Indigo palette (#4f46e5 at 500),
// and align surface tokens with the project's $surface-* SCSS variables.
// Severity colors (success/info/warn/danger) are NOT overridden here — they are
// per-component in PrimeNG 18's token structure and handled by resources.min.scss.
const AppPreset = definePreset(Nora, {
  semantic: {
    primary: {
      50:  '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',   // #4f46e5 — $primary
      600: '{indigo.600}',   // #4338ca
      700: '{indigo.700}',   // #3730a3 — $primary-dark
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color:         '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor:    '{primary.700}',
          activeColor:   '{primary.700}',
        },
        surface: {
          0:   '#ffffff',
          50:  '{slate.50}',    // #f8fafc  = $surface-b
          100: '{slate.100}',   // #f1f5f9  = $surface-c / $surface-ground
          200: '{slate.200}',   // #e2e8f0  = $surface-d / $surface-border
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',   // #64748b  = $text-secondary
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',   // #1e293b  = $text-color
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  providers: [
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: false,
          // Wraps all PrimeNG component styles in @layer primeng { }.
          // CSS layers lose to non-layered rules, so resources.min.scss
          // wins unconditionally regardless of runtime injection order.
          cssLayer: {
            name: 'primeng',
            order: 'primeng',
          },
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

