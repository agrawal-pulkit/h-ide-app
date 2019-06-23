
import { Routes, RouterModule } from '@angular/router';

import { MainPageComponent } from './pages/main-page/main-page.component';
import { HomeComponent } from './pages/home';
import { LoginComponent } from './pages/login';
import { RegisterComponent } from './pages/register';
import { AuthGuard } from './_guards';

const appRoutes: Routes = [
    // { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'post', component: HomeComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', component: MainPageComponent},

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
