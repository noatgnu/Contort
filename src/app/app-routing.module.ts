import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ConsurfViewComponent} from "./consurf-view/consurf-view.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {path: 'consurf-view/:accid', component: ConsurfViewComponent},
  {path: 'consurf-view', component: ConsurfViewComponent},
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/consurf-view', pathMatch: 'full'}
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, bindToComponentInputs: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
