import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { ConsurfJobComponent } from "./consurf-job/consurf-job.component";
import { DashboardComponent } from "./dashboard/dashboard.component";

const routes: Routes = [
  {
    path: 'consurf-view',
    loadChildren: () => import('./visualization/visualization.module').then(m => m.VisualizationModule)
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'consurf-job/:jobid', component: ConsurfJobComponent },
  { path: 'consurf-job', component: ConsurfJobComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
