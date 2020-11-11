console.debug("nquiz: main.js started");

class Model {
  constructor() {}

  addItem() {}

  editItem() {}

  deleteItem() {}
}

class View {
  constructor() {
    let app1 = document.querySelector(
      "article.article.widget.rich.surrogate-content.container-widget.cf"
    );
    let app2 = document.querySelector(
      "article.post.type-post.status-publish.format-standard"
    );
    this.app = app1 == null ? app2 : app1;
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);

    return element;
  }

  // Retrieve an element from the DOM
  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}

//let app = document.querySelector('article.article.widget.rich.surrogate-content.container-widget.cf');
//let app2 = document.querySelector('article.post.type-post.status-publish.format-standard');

//console.debug(app);
//console.debug(app2);

const v = new View();

console.debug(v.app);
