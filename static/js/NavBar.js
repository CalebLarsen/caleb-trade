fetch("/static/html/NavBar.html")
    .then(stream => stream.text())
    .then(text => define(text));

function define(html){
    class NavBar extends HTMLElement {
        constructor() {
            super();
            var shadowRoot = this.attachShadow({mode: 'open'});
            shadowRoot.innerHTML = html;
        }
    }
    customElements.define('nav-bar', NavBar);
}
