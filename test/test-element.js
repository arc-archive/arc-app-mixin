import { LitElement, html, css } from 'lit-element';
import { ArcAppMixin } from '../arc-app-mixin.js';
function noop() {}
/**
 * @customElement
 * @demo demo/index.html
 * @appliesMixin ArcAppMixin
 */
class TestElement extends ArcAppMixin(LitElement) {
  static get styles() {
    return css`:host {
      display: block;
    }`;
  }

  render() {
    return html`<app-workspace id="workspace"></app-workspace>`;
  }

  get workspace() {
    if (!this._workspace) {
      this._workspace = {
        saveOpened: noop,
        removeRequest: noop,
        clearWorkspace: noop,
        activeRequests: [{ _id: 1 }, { _id: 2 }, { _id: 3 }, { _id: 4 }],
        addEmptyRequest: noop,
        selected: 0,
        sendCurrent: noop,
        duplicateTab: noop,
        updateRequestObject: noop,
        updateRequestTab: noop
      };
    }
    return this._workspace;
  }
}
window.customElements.define('test-element', TestElement);
