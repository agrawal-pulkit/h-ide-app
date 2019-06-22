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

    public getAllSuppurtedLangs() {
        console.log('getAllSuppurtedLangs()');
        const queryUrl = this.baseUrl + 'langs/';
        return this.http.get<{ langs: any }>(queryUrl)
            .pipe( map((body) => body.langs) );
    }

    public postCodeToRun(code: string, language: { id: string, version: string }) {
        console.log('postCodeToRun()');
        const queryUrl = this.baseUrl + 'run/';
        const requestBody = { program: code, lang: language.id, version: language.version };
        return this.http.post<{ runResult: any }>(queryUrl, requestBody)
            .pipe( map((body) => body.runResult) );
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