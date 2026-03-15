import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ShowcaseRoutingModule } from './showcase-routing.module';
import { ShowcaseComponent } from './showcase.component';

@NgModule({
  declarations: [ShowcaseComponent],
  imports: [CommonModule, SharedModule, ShowcaseRoutingModule],
})
export class ShowcaseModule {}
