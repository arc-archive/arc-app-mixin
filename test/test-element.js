import {PolymerElement} from '../../../@polymer/polymer/polymer-element.js';
import {ArcAppMixin} from '../arc-app-mixin.js';
import {html} from '../../../@polymer/polymer/lib/utils/html-tag.js';
function noop() {}
/**
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @appliesMixin ArcAppMixin
 */
class TestElement extends ArcAppMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
    }
    </style>
`;
  }

  static get is() {
    return 'test-element';
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.$) {
      this.$ = {};
    }
    this.$.workspace = {
      saveOpened: noop,
      removeRequest: noop,
      clearWorkspace: noop,
      activeRequests: [{_id: 1}, {_id: 2}, {_id: 3}, {_id: 4}],
      addEmptyRequest: noop,
      selected: 0,
      sendCurrent: noop,
      duplicateTab: noop,
      updateRequestObject: noop,
      updateRequestTab: noop
    };
  }
}
window.customElements.define(TestElement.is, TestElement);
