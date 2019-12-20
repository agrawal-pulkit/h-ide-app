import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import * as ace from 'ace-builds';

// extensions :
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
// import webpack resolver to dynamically load modes & themes
import 'ace-builds/webpack-resolver';

import { languageModuleMap } from './../consts/language-module-table';
import { themeModuleMap } from '../consts/theme-module-table';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/services/http/http.service';
import { first } from 'rxjs/operators';
import { AlertService } from 'src/services/user-service';


const DEFAULT_INIT_CONTENT = '';
const DEFAULT_THEME = 'github';
const DEFAULT_LANG_MODE = 'python3';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
}) export class CodeEditorComponent implements OnInit {

  private codeEditor: ace.Ace.Editor;
  private editorBeautify; // beautify extension
  @ViewChild('codeEditor', { static: true }) private codeEditorElmRef: ElementRef;
  @Input() content: string;
  // injected init options for this editor component.
  @Input() initOptions: {
    languageMode?: string; theme?: string; content?: string;
  } = {};
  // currently used mode & theme editor config.
  private currentConfig: {
    langMode?: string, editorTheme?: string
  } = {};

  file: string = "";
  source: string = "";
  file_data: any = "";
  language: string = "";

  constructor(private route: ActivatedRoute, private http: HttpService,
    private alertService: AlertService) {
    this.route.queryParams.subscribe(params => {
      console.log('Called Constructor');
      this.file = params['file'];
      this.source = params['source'];
      this.language = params['lang'];
      this.content = params['content'];
      // this.getDataFromSourceFile(this.file, this.source)
    });
  }

  ngOnInit() {
    ace.require('ace/ext/language_tools'); // require extention module for autocompletion
    this.editorBeautify = ace.require('ace/ext/beautify'); // hold reference to beautify extension

    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();
    this.codeEditor = this.createCodeEditor(element, editorOptions);
    console.log("language: ", this.language)
    this.setLanguageMode(this.language || this.initOptions.languageMode || DEFAULT_LANG_MODE);
    this.setEditorTheme(this.initOptions.theme || DEFAULT_THEME);

    this.setContent(this.content || this.file_data || this.initOptions.content || DEFAULT_INIT_CONTENT);
  }


  // #region - private
  private createCodeEditor(element: Element, options: any): ace.Ace.Editor {
    const editor = ace.edit(element, options);
    editor.setShowFoldWidgets(true);
    editor.setShowPrintMargin(true);
    return editor;
  }
  // missing propery on EditorOptions 'enableBasicAutocompletion' so this is a workaround still using ts
  private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { [key: string]: boolean; } {
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 25,
      maxLines: 250,
      autoScrollEditorIntoView: false
    };
    const extraEditorOptions = {
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
    };
    return Object.assign(basicEditorOptions, extraEditorOptions);
  }
  // #endregion

  // #region - public - config control
  public setLanguageMode(langMode: string): void {
    try {
      if (languageModuleMap.has(langMode)) {
        const langModeModulePath = languageModuleMap.get(langMode);
        this.codeEditor.getSession().setMode(langModeModulePath, () => {
          this.currentConfig.langMode = langMode;
        });
      }
    } catch (error) {
      console.log(error);
    }

  }
  public setEditorTheme(theme: string): void {
    try {
      if (themeModuleMap.has(theme)) {
        const themeModulePath = themeModuleMap.get(theme);
        this.codeEditor.setTheme(themeModulePath, () => {
          this.currentConfig.editorTheme = theme;
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  public getCurrentConfig(): Readonly<{ langMode?: string; editorTheme?: string; }> {
    return Object.freeze(this.currentConfig);
  }
  // #endregion

  // #region - public - content manipulation
  /**
   * @returns - the current editor's content.
   */
  public getContent() {
    if (this.codeEditor) {
      const code = this.codeEditor.getValue();
      return code;
    }
  }
  /**
   * @param content - set as the editor's content.
   */
  public setContent(content: string): void {
    console.log("content:", content)
      if (this.codeEditor) {
        this.codeEditor.setValue(content);
      }
  }
  /**
   * @description
   *  beautify the editor content, rely on Ace Beautify extension.
   */
  public beautifyContent(): void {
    if (this.codeEditor && this.editorBeautify) {
      const session = this.codeEditor.getSession();
      this.editorBeautify.beautify(session);
    }
  }
  // #endregion

  // #region - public - events
  /**
   * @event OnContentChange - a proxy event to Ace 'change' event - adding additional data.
   * @param callback - recive the corrent content and 'change' event's original parameter.
   */
  public OnContentChange(callback: (content: string, delta: ace.Ace.Delta) => void): void {
    this.codeEditor.on('change', (delta) => {
      const content = this.codeEditor.getValue();
      callback(content, delta);
    });
  }

  //read github content and files. not used now. we can remove it.
  // public getDataFromSourceFile(file: string, source: string) {
  //   // let data = this.http.get(file)
  //   console.log("inside getDataFromSourceFile")
  //   if (this.file === "" && this.source === "") {
  //     console.log("simple case")
  //   } else {
  //     console.log("filename: ", file)
  //     this.http.get<any>(file).pipe(first())
  //       .subscribe(
  //         data => {
  //           this.file_data = atob(data.content);
  //           console.log("file data: ", this.language, this.file_data)
  //           this.setLanguageMode(this.language || DEFAULT_LANG_MODE)
  //           this.setContent(this.file_data)
  //         },
  //         error => {
  //           console.log("error alert")
  //           this.alertService.error(error);
  //         });
  //   }
  // }
}
