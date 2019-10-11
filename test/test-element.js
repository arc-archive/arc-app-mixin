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

  _platformHelpersTemplate() {
    return html`
    ${this.importExportTemplate({ electron: true })}
    ${this.appMessagesLogicTemplate('electron')}
    `;
  }

  render() {
    return html`
    ${this.applicationTemplate()}
    `;
  }
  //
  // render() {
  //   return html`
  //   ${this.modelsTemplate()}
  //   ${this.importExportTemplate({ electron: true })}
  //   ${this.requestLogicTemplate()}
  //   ${this.variablesLogicTemplate()}
  //   ${this.appMessagesLogicTemplate('electron')}
  //   ${this.menuTemplate()}
  //   ${this.mainToolbarTemplate()}
  //   ${this._pageTemplate()}
  //   ${this.variablesDrawerTemplate()}
  //   ${this._analyticsTemplate()}
  //   ${this.licenseTemplate()}
  //   ${this.settingsViewTemplate({})}
  //   ${this.restApisViewTemplate({})}
  //   <arc-info-messages></arc-info-messages>
  //   <arc-request-workspace id="workspace"></arc-request-workspace>
  //   `;
  // }

  get workspace() {
    if (!this._workspace) {
      this._workspace = {
        localName: 'arc-request-workspace',
        saveOpened: noop,
        removeRequest: noop,
        clearWorkspace: noop,
        activeRequests: [{ _id: 1 }, { _id: 2 }, { _id: 3 }, { _id: 4 }],
        addEmptyRequest: () => { this._workspace.activeRequests.push({ _id: 5 }) },
        selected: 0,
        sendCurrent: noop,
        duplicateTab: noop,
        updateRequestObject: (r, i) => this._workspace.activeRequests[i] = r,
        updateRequestTab: noop,
        findRequestIndex: (id) => this._workspace.activeRequests.findIndex((item) => item._id === id),
        appendRequest: (r) => this._workspace.activeRequests.push(r),
        openWorkspaceDetails: noop,
        closeActiveTab: noop,
        addRequestById: noop
      };
    }
    return this._workspace;
  }
}
window.customElements.define('test-element', TestElement);
