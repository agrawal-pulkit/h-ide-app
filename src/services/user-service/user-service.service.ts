import { environment } from './../../environments/environment';
import { HttpService } from './../http/http.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { User } from 'src/modals/users/users';
// import { LanguageTable } from 'src/modals/languages/languages';

@Injectable()
export class UserService {
    private baseUrl: string;

    constructor(private http: HttpService) {
        this.baseUrl = environment.BASE_URL;
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/`);
    }

    getById(id: number) {
        return this.http.get(`${environment.apiUrl}/users/` + id);
    }

    register(user: User) {
        return this.http.post(`${environment.apiUrl}/user/signUp`, user);
    }

    update(user: User) {
        return this.http.put(`${environment.apiUrl}/users/` + user.id, user);
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/users/` + id);
    }
}