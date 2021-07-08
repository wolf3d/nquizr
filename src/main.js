(function () {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    console.time("nquizr");
    console.log("nquizr: started");

    try {
    var SipHash13=function(){"use strict";function r(r,n){var t=r.l+n.l,h={h:r.h+n.h+(t/2>>>31)>>>0,l:t>>>0};r.h=h.h,r.l=h.l}function n(r,n){r.h^=n.h,r.h>>>=0,r.l^=n.l,r.l>>>=0}function t(r,n){var t={h:r.h<<n|r.l>>>32-n,l:r.l<<n|r.h>>>32-n};r.h=t.h,r.l=t.l}function h(r){var n=r.l;r.l=r.h,r.h=n}function e(e,l,o,u){r(e,l),r(o,u),t(l,13),t(u,16),n(l,e),n(u,o),h(e),r(o,l),r(e,u),t(l,17),t(u,21),n(l,o),n(u,e),h(o)}function l(r,n){return r[n+3]<<24|r[n+2]<<16|r[n+1]<<8|r[n]}function o(r,t){"string"==typeof t&&(t=u(t));var h={h:r[1]>>>0,l:r[0]>>>0},o={h:r[3]>>>0,l:r[2]>>>0},i={h:h.h,l:h.l},a=h,f={h:o.h,l:o.l},c=o,s=t.length,v=s-7,g=new Uint8Array(new ArrayBuffer(8));n(i,{h:1936682341,l:1886610805}),n(f,{h:1685025377,l:1852075885}),n(a,{h:1819895653,l:1852142177}),n(c,{h:1952801890,l:2037671283});for(var y=0;y<v;){var d={h:l(t,y+4),l:l(t,y)};n(c,d),e(i,f,a,c),n(i,d),y+=8}g[7]=s;for(var p=0;y<s;)g[p++]=t[y++];for(;p<7;)g[p++]=0;var w={h:g[7]<<24|g[6]<<16|g[5]<<8|g[4],l:g[3]<<24|g[2]<<16|g[1]<<8|g[0]};n(c,w),e(i,f,a,c),n(i,w),n(a,{h:0,l:255}),e(i,f,a,c),e(i,f,a,c),e(i,f,a,c);var _=i;return n(_,f),n(_,a),n(_,c),_}function u(r){if("function"==typeof TextEncoder)return(new TextEncoder).encode(r);r=unescape(encodeURIComponent(r));for(var n=new Uint8Array(r.length),t=0,h=r.length;t<h;t++)n[t]=r.charCodeAt(t);return n}return{hash:o,hash_hex:function(r,n){var t=o(r,n);return("0000000"+t.h.toString(16)).substr(-8)+("0000000"+t.l.toString(16)).substr(-8)},hash_uint:function(r,n){var t=o(r,n);return 4294967296*(2097151&t.h)+t.l},string16_to_key:function(r){var n=u(r);if(16!==n.length)throw Error("Key length must be 16 bytes");var t=new Uint32Array(4);return t[0]=l(n,0),t[1]=l(n,4),t[2]=l(n,8),t[3]=l(n,12),t},string_to_u8:u}}(),module=module||{},exports=module.exports=SipHash13;
    } catch (error) {
    console.error(`nquizr: error during SipHash initialization: ${error}`);
    }        

    /**
     * @class WebPageMapper
     *
     * abstracts away decisions related to where to put stuff
     * on actuall webpage depending on the page user currently is on
     */

    class WebPageMapper {
        // spaghetti mapper :)
        constructor() {
            let app1 = document.querySelector(
                "article.article.widget.rich.surrogate-content.container-widget.cf" // nrk.no article
            );
            let app2 = document.querySelector(
                "article.post.type-post.status-publish.format-standard" // nrkbeta.no and p3.no article
            );
            this.root = app1 == null ? app2 : app1;
            this.pageId;
            this.paragraphs = [];
            this.headerParagraph;
            let dataId = null;
            try {
                if (this.root !== null) {
                    let dataId1 = null;
                    let dataId2 = null;
                    //console.debug(`nquizr: "id" in this.root ${"id" in this.root}`);
                    dataId1 = this.root.getAttribute("id");
                    dataId2 = this.root.getAttribute("data-id");
                    console.debug(`nquizr: dataId2 ${dataId2}`);

                    dataId = dataId1 == null ? dataId2 : dataId1;

                    this.headerParagraph =
                        this.root.querySelector(".article-header") != null
                            ? this.root.querySelector(".article-header")
                            : this.root.querySelector(".article__head") != null
                            ? this.root.querySelector(".article__head")
                            : this.root.querySelector(".entry-excerpt");

                    if (this.headerParagraph !== null) {
                        this.paragraphs.push(this.headerParagraph);
                    }

                    // map paragraphs that will have textarea
                    let articleBody = this.root.querySelector(".article-body");
                    if (articleBody !== null) {
                        let elements = articleBody.children;
                        let contiguousElementCount = 0;
                        for (let elem of elements) {
                            let lastParagraph = null;
                            if (elem.nodeName == "P" && elem.innerHTML != "") {
                                this.paragraphs.push(elem);
                            }
                        }
                    }
                    //console.debug(this.paragraphs);
                } else {
                    dataId = "0000";
                    this.root = document.createElement("div");
                }
            } catch (error) {
                console.error(`nquizr: ${error}`);
            }

            console.debug(`nquizr: data-id: ${dataId}`);

            try {
                let key = SipHash13.string16_to_key("This is the key!"),
                    hash = SipHash13.hash_hex(key, dataId);
                this.pageId = "nquizr-" + hash;
                console.debug(`nquizr: pageId: ${this.pageId}`);
            } catch (error) {
                //todo probably need to provide sensible pageId in case of failure to init SipHash
                console.error(error);
            }
        }
    }

    /**
     * @class Model
     *
     * Manages the data of the application.
     */
    class Model {
        constructor() {
            this.items = new Map(); //[{ id: 1, text: "Run a marathon", type: "text" }];

            // console.debug(
            //     `nquizr: localStorage.length ${localStorage.length}`
            // );

            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key.slice(0, 7) === "nquizr-") {
                    if (!this.items.has(key)) {
                        this.items.set(
                            key,
                            JSON.parse(localStorage.getItem(key))
                        );
                    }
                }
            }
        }

        bindItemChanged(callback) {
            this.onItemChanged = callback;
        }

        bindItemsChanged(callback) {
            this.onItemsChanged = callback;
        }

        _commit(item) {
            this.onItemsChanged([item]);
            localStorage.setItem(`${item.id}`, JSON.stringify(item));
        }

        editNoteItem(id, updatedText) {
            if (this.items.has(id)) {
                console.debug(`nquizr: editing note`);
                const item = this.items.get(id);
                item.text = updatedText;
                this.items.set(item.id, item);
                this._commit(item);
            } else {
                console.debug(`nquizr: adding new note`);
                const item = { id: id, text: updatedText, type: "text" };
                this.items.set(item.id, item);
                this._commit(item);
            }

            console.debug(`nquizr: editItem`);
        }
        editWordListItem(itemObj) {
            //handler({id: view.id, itemId: id, key: key, text: this._temporaryText});
            console.debug(`nquizr: editWordListItem`);
            console.debug(itemObj);
            if (this.items.has(itemObj.id)) {
                const item = this.items.get(itemObj.id);
                console.debug(`nquizr: editItem __`);
                console.debug(item);
                const editItem = item.wordlist.splice(itemObj.itemId, 1);
                console.debug(editItem);
                if (itemObj.key === "wlItemA") {
                    editItem[0][0] = itemObj.text;
                } else if (itemObj.key === "wlItemB") {
                    editItem[0][1] = itemObj.text;
                }
                console.debug(item.wordlist);
                item.wordlist.splice(itemObj.itemId, 0, editItem[0]);
                console.debug(item.wordlist);
                this.items.set(itemObj.id, item);
                this._commit(item);
            }
        }

        addVocabItem(vocabItem) {
            // id, word1, word2
            // const newItem = {
            //     id: vocabItem.id,
            //     word1: vocabItem.wordlist[0][0],
            //     word2: vocabItem.wordlist[0][1],
            //     type: "vocabulary",
            // };

            if (this.items.has(vocabItem.id)) {
                const item = this.items.get(vocabItem.id);
                item.wordlist.push([
                    vocabItem.wordlist[0][0],
                    vocabItem.wordlist[0][1],
                ]);

                this.items.set(vocabItem.id, item);

                console.debug(`nquizr: after adding vocabItem`);
                console.debug(item);
                this._commit(item);
            } else {
                console.debug(
                    `nquizr: vocabItem.id ${vocabItem.id} , item ${vocabItem}`
                );
                console.debug(`nquizr: after adding vocabItem else branch`);

                this.items.set(vocabItem.id, vocabItem);
                const newItem = {
                    id: vocabItem.id,
                    wordlist: [vocabItem.wordlist[0]],
                    type: "vocabulary",
                };
                this._commit(newItem);
            }
        }

        deleteVocabItem(viewId, itemId) {
            console.debug(
                `nquizr: deleteVocabItem viewId ${viewId} , itemId ${itemId}`
            );

            if (this.items.has(viewId)) {
                const item = this.items.get(viewId);
                item.wordlist.splice(itemId, 1);

                this.items.set(viewId, item);

                console.debug(`nquizr: after removing vocabItem`);
                console.debug(item);
                this._commit(item);
            }
        }
    }

    /**
     * @class ViewItem
     *
     * class
     */
    class ViewItem {
        //todo probably needs different constructor for each type of item
        constructor(id) {
            this.viewShell = this.createElement("div");
            this.viewShell.setAttribute("id", id);
            this.id = id;
            // this.viewShell.setAttribute(
            //     "class",
            //     "g100 col fc s10 sl12 sl18 sg6 sg9 fact-reference"
            // );
        }

        createElement(tag, className) {
            const element = document.createElement(tag);

            if (className) element.classList.add(className);

            return element;
        }

        getElement(selector) {
            const element = document.querySelector(selector);
            return element;
        }
    }

    /**
     * @class TranslationArea
     *
     * class
     */
    class TranslationArea extends ViewItem {
        constructor(id) {
            super(id);
            this.textarea = this.createElement("textarea", "translationText");
            this.textarea.placeholder = "Add translation";
            //todo probably pass view item name as constructor parameter
            this.textarea.name = "textareaName";
            this.viewShell.append(this.textarea);
        }

        addContent(contentItem) {
            this.textarea.value = contentItem.text;
        }
    }

    /**
     * @class WordListArea
     *
     * class
     */
    class WordListArea extends ViewItem {
        constructor(id) {
            super(`${id}-wa`);
            this.form = this.createElement("form");
            this.form.setAttribute("id", `REMOVEME${id}-wa`);
            this.input1 = this.createElement("input", "worda");
            this.input2 = this.createElement("input", "wordb");
            this.input1.type = "text";
            this.input2.type = "text";
            this.input1.placeholder = "Add word";
            this.input2.placeholder = "Add translation";
            this.input1.name = "worda";
            this.input2.name = "wordb";
            this.submitButton = this.createElement("button");
            this.submitButton.textContent = "Submit";
            this.wordList = this.createElement("ul", "wordList");
            this.form.append(this.input1, this.input2, this.submitButton);
            this.viewShell.append(this.form, this.wordList);
            this.listItemCount = 0;
        }

        get _inputValues() {
            return { input1: this.input1.value, input2: this.input2.value };
        }

        get _itemCount() {
            return this.listItemCount;
        }

        _resetInput() {
            this.input1.value = "";
            this.input2.value = "";
        }

        addVocabularyItem(item) {
            const listItem = this.createElement("li");
            listItem.setAttribute("id", this._itemCount);
            this.listItemCount++;
            const span1 = this.createElement("span");
            span1.contentEditable = true;
            span1.classList.add("editable");
            span1.classList.add("wlItemA");
            const span2 = this.createElement("span");
            span2.contentEditable = true;
            span2.classList.add("editable");
            span2.classList.add("wlItemB");

            span1.textContent = item[0];
            span2.textContent = item[1];

            const deleteButton = this.createElement("button", "delete");
            deleteButton.textContent = "Delete";

            listItem.append(span1, span2, deleteButton);

            this.wordList.append(listItem);
        }

        addContent(contentItem) {
            while (this.wordList.firstChild) {
                this.wordList.removeChild(this.wordList.firstChild);
            }
            this.listItemCount = 0;
            // console.debug(`nquizr: adding content`);
            // console.debug(contentItem);
            contentItem.wordlist.forEach((wItem) => {
                console.debug(`nquizr: adding content ${wItem}`);
                this.addVocabularyItem(wItem);
            });
        }
    }

    /**
     * @class ViewGroup
     *
     * group of views visually representing the model.
     */
    class ViewGroup {
        constructor(webPageMapper) {
            this.app = webPageMapper.root;
            this.views = [];
            this.viewsMap = new Map();
            this.paragraphs = webPageMapper.paragraphs;
            this.pageId = webPageMapper.pageId;

            if (this.app !== null) {
                this._ViewGroup();
            } else {
                console.debug(
                    "nquizr: app has null value, not initializing viewGroup"
                );
            }
        }

        _ViewGroup() {
            this.paragraphs.forEach((para, index) => {
                let translationArea = new TranslationArea(
                    `${this.pageId}-${index}-ta`
                );
                let wordListArea = new WordListArea(`${this.pageId}-${index}`);
                this.viewsMap.set(
                    `${this.pageId}-${index}-ta`,
                    translationArea
                );
                this.viewsMap.set(`${this.pageId}-${index}-wa`, wordListArea);
                this.views.push(translationArea);
                this.views.push(wordListArea);
                para.insertAdjacentElement("afterend", wordListArea.viewShell);
                para.insertAdjacentElement(
                    "afterend",
                    translationArea.viewShell
                );
            });

            this._temporaryText = "";
            this._initLocalListeners();
        }

        _initLocalListeners() {
            try {
                this.views.forEach((view) => {
                    if (view instanceof TranslationArea) {
                        view.viewShell.addEventListener("input", (event) => {
                            if (event.target.className === "translationText") {
                                this._temporaryText = event.target.value;
                                console.debug(
                                    `nquizr: _initLocalListeners: ${this._temporaryText}`
                                );
                            }
                        });
                    }
                    if (view instanceof WordListArea) {
                        view.viewShell.addEventListener("input", (event) => {
                            if (event.target.className.includes("wlItemA")) {
                                this._temporaryText = event.target.innerText;
                                console.debug(
                                    `nquizr: _initLocalListeners: ${this._temporaryText}`
                                );
                            } else if (
                                event.target.className.includes("wlItemB")
                            ) {
                                this._temporaryText = event.target.innerText;
                                console.debug(
                                    `nquizr: _initLocalListeners: ${this._temporaryText}`
                                );
                            }
                        });
                    }
                });
            } catch (error) {
                console.error(`_initLocalListeners ${error}`);
            }
        }

        bindAddVocabItem(handler) {
            try {
                this.views.forEach((view) => {
                    if (view instanceof WordListArea) {
                        view.form.addEventListener("submit", (event) => {
                            event.preventDefault();
                            if (
                                view._inputValues["input1"] &&
                                view._inputValues["input2"]
                            ) {
                                console.debug(
                                    `nquizr: ${view._inputValues["input1"]}, ${view._inputValues["input2"]}`
                                );
                                const newItem = {
                                    id: view.id,
                                    wordlist: [
                                        [
                                            view._inputValues["input1"],
                                            view._inputValues["input2"],
                                        ],
                                    ],
                                };
                                console.debug(`nquizr: adding word pair`);
                                handler(newItem);
                                view._resetInput();
                            }
                        });
                    }
                });
            } catch (error) {
                console.error(`bindAddVocabItem ${error}`);
            }
        }

        bindDeleteVocabItem(handler) {
            try {
                this.views.forEach((view) => {
                    if (view instanceof WordListArea) {
                        view.wordList.addEventListener("click", (event) => {
                            if (event.target.className === "delete") {
                                const id = parseInt(
                                    event.target.parentElement.id
                                );
                                handler(view.id, id);
                            }
                        });
                    }
                });
            } catch (error) {
                console.error(`bindAddVocabItem ${error}`);
            }
        }

        displayItems(items) {
            console.debug(`nquizr: calling displayItems`);
            //console.debug(items);
            items.forEach((item) => {
                if (this.viewsMap.has(item.id)) {
                    const vi = this.viewsMap.get(item.id);
                    vi.addContent(item);
                } else {
                    //console.debug(`nquizr: item with key ${item.id} not found`);
                }
            });
        }

        displayItem(item) {
            console.debug(`nquizr: di ${this.viewsMap.get(item.id)}`);
        }

        bindEditNoteItem(handler) {
            this.views.forEach((view) => {
                if (view instanceof TranslationArea) {
                    view.viewShell.addEventListener("focusout", (event) => {
                        const id = event.target.parentElement.id.replace(
                            "REMOVEME",
                            ""
                        );
                        if (this._temporaryText) {
                            console.debug(
                                `nquizr: bindEditItem: ${this._temporaryText}, id: ${id}`
                            );
                            handler(id, this._temporaryText);
                            this._temporaryText = "";
                        }
                    });
                }
            });
        }

        bindEditWordListItem(handler) {
            this.views.forEach((view) => {
                if (view instanceof WordListArea) {
                    view.viewShell.addEventListener("focusout", (event) => {
                        let key = "";
                        if (event.target.className.includes("wlItemA")) {
                            key = "wlItemA";
                        } else if (event.target.className.includes("wlItemB")) {
                            key = "wlItemB";
                        }

                        const id = event.target.parentElement.id.replace(
                            "REMOVEME",
                            ""
                        );
                        if (this._temporaryText) {
                            console.debug(
                                `nquizr: bindEditWordListItem: ${this._temporaryText}, view id ${view.id}, itemId: ${id}`
                            );
                            handler({
                                id: view.id,
                                itemId: id,
                                key: key,
                                text: this._temporaryText,
                            });
                            this._temporaryText = "";
                        }
                    });
                }
            });
        }
    }

    /**
     * @class Controller
     *
     * Links the user input and the view output.
     *
     * @param model
     * @param viewGroup
     */
    class Controller {
        constructor(model, viewGroup) {
            this.model = model;
            if (viewGroup.app !== null) {
                this.viewGroup = viewGroup;
                this.viewGroup.bindAddVocabItem(this.handleAddVocabItem);
                this.viewGroup.bindDeleteVocabItem(this.handleDeleteVocabItem);
                this.model.bindItemChanged(this.onItemChanged);
                this.model.bindItemsChanged(this.onItemsChanged);
                this.viewGroup.bindEditNoteItem(this.handleEditNoteItem);
                this.viewGroup.bindEditWordListItem(
                    this.handleEditWordListItem
                );

                this.onItemsChanged(this.model.items);
            }
        }

        handleEditNoteItem = (id, text) => {
            this.model.editNoteItem(id, text);
        };

        handleEditWordListItem = (itemObj) => {
            this.model.editWordListItem(itemObj);
        };

        onItemsChanged = (items) => {
            this.viewGroup.displayItems(items);
        };

        onItemChanged = (item) => {
            this.viewGroup.displayItem(item);
        };

        handleAddVocabItem = (vocabItem) => {
            this.model.addVocabItem(vocabItem);
        };

        handleDeleteVocabItem = (viewId, itemId) => {
            this.model.deleteVocabItem(viewId, itemId);
        };
    }

    try {
        const app = new Controller(
            new Model(),
            new ViewGroup(new WebPageMapper())
        );
    } catch (error) {
        console.error(`nquizr: main app error ${error}`);
    }

    console.timeEnd("nquizr");
    console.log("nquizr: last line");
})();
