import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Layout components
import { HeaderComponent } from './layout/header/header.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const PRIMENG_MODULES = [
  TableModule,
  MessagesModule,
  MessageModule,
  BreadcrumbModule,
  ButtonModule,
  RippleModule,
  TagModule,
  CardModule,
  ToastModule,
];

@NgModule({
  imports: [CommonModule, RouterModule, ...PRIMENG_MODULES],
  declarations: [HeaderComponent, MainLayoutComponent],
  exports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    MainLayoutComponent,
    ...PRIMENG_MODULES,
  ],
  providers: [MessageService],
})
export class SharedModule {}
