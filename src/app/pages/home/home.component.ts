import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { Post } from './../../../modals/post/post';
import { PostService } from './../../../services/post-service/post-service.service';
import { User } from 'src/modals/users/users';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
    currentUser: User;
    posts: any;

    constructor(private postService: PostService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.loadAllPosts();
    }

    private loadAllPosts() {
        this.postService.getAllPost().pipe(first()).subscribe(posts => { 
            this.posts = posts; 
        });
    }
}