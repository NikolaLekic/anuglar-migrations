import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'employees', pathMatch: 'full' },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.module').then(
            (m) => m.EmployeesModule
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'employees' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
