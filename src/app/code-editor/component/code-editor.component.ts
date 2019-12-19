import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import * as ace from 'ace-builds';

// extensions :
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
// import webpack resolver to dynamically load modes & themes
import 'ace-builds/webpack-resolver';

import { languageModuleMap } from './../consts/language-module-table';
import { themeModuleMap } from '../consts/theme-module-table';


const DEFAULT_INIT_CONTENT = '';
const DEFAULT_THEME = 'github';
const DEFAULT_LANG_MODE = 'nodejs';

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


    constructor() { }

    ngOnInit() {
        ace.require('ace/ext/language_tools'); // require extention module for autocompletion
        this.editorBeautify = ace.require('ace/ext/beautify'); // hold reference to beautify extension

        const element = this.codeEditorElmRef.nativeElement;
        const editorOptions = this.getEditorOptions();
        this.codeEditor = this.createCodeEditor(element, editorOptions);

        this.setLanguageMode(this.initOptions.languageMode || DEFAULT_LANG_MODE);
        this.setEditorTheme(this.initOptions.theme || DEFAULT_THEME);
        this.setContent(this.initOptions.content || DEFAULT_INIT_CONTENT);
    }


    // #region - private
    private createCodeEditor(element: Element, options: any): ace.Ace.Editor {
        const editor = ace.edit(element, options);
        editor.setShowFoldWidgets(true);
        return editor;
    }
    // missing propery on EditorOptions 'enableBasicAutocompletion' so this is a workaround still using ts
    private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { [key: string]: boolean; } {
        const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
            highlightActiveLine: true,
            minLines: 14,
            maxLines: 500,
            autoScrollEditorIntoView: true
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


}
