import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsurfViewComponent } from '../consurf-view/consurf-view.component';

const routes: Routes = [
  { path: ':accid', component: ConsurfViewComponent },
  { path: '', component: ConsurfViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualizationRoutingModule { }
