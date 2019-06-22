import { environment } from './../../environments/environment';
import { HttpService } from './../http/http.service';
import { Injectable } from '@angular/core';
import { Post } from 'src/modals/post/post';
// import { LanguageTable } from 'src/modals/languages/languages';

@Injectable()
export class PostService {
    private POST_API: string;

    constructor(private http: HttpService) {
        this.POST_API = environment.POST_API;
    }

    getAllPost() {
        return this.http.get<Post[]>(`${environment.POST_API}/post`);
    }

    getPostById(id: number) {
        return this.http.get(`${environment.POST_API}/post/` + id);
    }

    createPost(post: any) {
        return this.http.post(`${environment.POST_API}/post/`, post);
    }

    updatePost(post: Post) {
        return this.http.put(`${environment.POST_API}/post/` + post.id, post);
    }

    deletePost(id: number) {
        return this.http.delete(`${environment.POST_API}/post/` + id);
    }
}