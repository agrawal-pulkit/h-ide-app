import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { LanguageTable, Language } from './../../../modals/languages/languages';
import { CodeEditorComponent } from './../../code-editor';
import { ServerHandlerService } from './../../../services/server-handler/server-handler.service';
import {
    DEFAULT_INIT_EDITOR_OPTIONS,
    DEFAULT_SUPPORTED_EDITOR_THEMES,
    DEFAULT_RUN_ERROR_MESSAGE
} from './default-options';
import { PostService }  from './../../../services/post-service/post-service.service';
import { AlertService } from './../../../services/user-service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
}) export class MainPageComponent implements OnInit {

    public activatedTheme: string;
    // indicate if the initial languages api request failed or not.
    public cantReachServer = false;
    // options to init the editor with.
    public initEditorOptions = DEFAULT_INIT_EDITOR_OPTIONS;
    // array of the supported themes names.
    public supportedThemes = DEFAULT_SUPPORTED_EDITOR_THEMES;
    // code editor conponent reference
    @ViewChild(CodeEditorComponent, {static: true}) codeEditor: CodeEditorComponent;
    // languages select element reference.
    @ViewChild('languagesSelect', {static: false}) languagesSelect: ElementRef;
    // array of the supported languages, to simplify the usage in the component code
    private languagesArray: Language[] = [];
    // observable of the supported languages.
    public languagesArray$: Observable<Language[]>;
    // observable of the run request output.
    public output$: Observable<string>;
    isLoggedIn: boolean = false;
    codeOutput: any;

    constructor(private handler: ServerHandlerService, 
        private postService: PostService,
        private alertService: AlertService) { }

    ngOnInit() {
        this.languagesArray$ = this.pipeSuppurtedLanguages();
        this.activatedTheme = this.initEditorOptions.theme;
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            this.isLoggedIn = true;
          }
    }

    // #region - private
    private pipeSuppurtedLanguages() {
        return this.handler.getAllSuppurtedLangs()
            .pipe(
                // reduce the incoming table to languages array.
                map((languages: LanguageTable) => {
                    console.log(languages);
                    return languages.reduce<Language[]>((langsArray, entry) => {
                        return langsArray.concat(entry[1]);
                    }, []);
                }),
                // store the array in a member.
                tap((languages: Language[]) => this.languagesArray = languages ),
                // console log any error and returning an empty array.
                catchError((err) => {
                    console.log(err);
                    this.cantReachServer = true;
                    this.languagesArray = [];
                    return of(this.languagesArray);
                })
            );
    }
    // #endregion

    // #region - public
    public onClearContent() { this.codeEditor.setContent(''); }

    public onBeautifyContent() { this.codeEditor.beautifyContent(); }

    public onRunContent() {
        const code = this.codeEditor.getContent();
        console.log(code)
        if (this.languagesSelect && code && code.length > 0) {
            console.log(this.languagesSelect)
            const languagesSelectElement = this.languagesSelect.nativeElement as HTMLSelectElement;
            const inedx = languagesSelectElement.selectedIndex;

            const language = this.languagesArray[inedx];
            console.log(language, inedx)
            this.output$ = this.handler.postCodeToRun(code, {
                id: language.lang, version: language.version
            }).pipe(
                // returning the output content.
                map((response: RunResult) => {
                    this.codeOutput = response
                    return response.output }),
                // console log any error and returning an error message.
                catchError((err) => {
                    console.log(err);
                    return of(DEFAULT_RUN_ERROR_MESSAGE);
                })
            );
            
        }
    }

    public onSaveContent() {
        console.log("this.output:: ", this.codeOutput)
        this.codeOutput.code = this.codeEditor.getContent()
        let post: any = this.createPostRequest()
        post.content = this.codeOutput
        this.postService.createPost(post)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Post successfully saved in your profile', true);
                },
                error => {
                    this.alertService.error(error);
                });
    }

    public onChangeTheme(theme: string) {
        if (this.supportedThemes.includes(theme)) {
            this.codeEditor.setEditorTheme(theme);
        }
    }

    public onChangeLanguageMode(event: any) {
        const selectedIndex = event.target.selectedIndex;
        const language = this.languagesArray[selectedIndex];
        const langMode = language.lang;
        this.codeEditor.setLanguageMode(langMode);
    }
    // #endregion

    private logout(event: any) {
        localStorage.removeItem('currentUser');
        this.isLoggedIn = false
    }

    createPostRequest(){
        const user: any = localStorage.getItem('currentUser')
        return {
            "userName": user.userName,
            "userEmail": user.userEmail,
            "postTitle": Math.random(),
            "postDescription": "demo post",
            "content": {},
            "postType": "test",
            "likes": {
                "count" :0 
            },
            "share": {
                "count" :0
            },
            "comments": {
                "count" :0
            }
        }
    }
}

interface RunResult {
    output: string;
    statusCode: number;
    memory: string;
    cpuTime: string;
}


