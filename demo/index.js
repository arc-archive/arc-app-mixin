import { LitElement, html } from 'lit-element';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@advanced-rest-client/arc-local-store-preferences/arc-local-store-workspace.js';
import '@advanced-rest-client/arc-local-store-preferences/arc-local-store-preferences.js';
import { ArcAppMixin } from '../arc-app-mixin.js';
import { moreVert } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import styles from '../AppStyles.js';

class ArcApp extends ArcAppMixin(LitElement) {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {};
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
}
window.customElements.define('arc-app', ArcApp);

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    // this.initObservableProperties([
    // ]);
    this._componentName = 'arc-app-mixin';

    this._appActionHandler = this._appActionHandler.bind(this);

    this.systemVariables = {
      CHROME_DESKTOP: "Electron.desktop",
      CLUTTER_IM_MODULE: "xim",
      COLORTERM: "truecolor",
      GJS_DEBUG_OUTPUT: "stderr",
      GJS_DEBUG_TOPICS: "JS ERROR;JS LOG",
      GNOME_DESKTOP_SESSION_ID: "this-is-deprecated",
      GNOME_SHELL_SESSION_MODE: "ubuntu",
      GNOME_TERMINAL_SCREEN: "/org/gnome/Terminal/screen/f607eae9_d507_4a86_9d39_968679c41855",
      GNOME_TERMINAL_SERVICE: ":1.101",
      GPG_AGENT_INFO: "/run/user/1000/gnupg/S.gpg-agent:0:1",
      GPG_TTY: "/dev/pts/0",
      GTK_IM_MODULE: "ibus",
      GTK_MODULES: "gail:atk-bridge",
      HOME: "/home/pawel",
      IM_CONFIG_PHASE: "2",
      INIT_CWD: "/home/pawel/workspace/advanced-rest-client/arc-electron",
      LANG: "en_GB.UTF-8",
      LANGUAGE: "en_GB:en",
      LC_ADDRESS: "en_US.UTF-8",
      LC_IDENTIFICATION: "en_US.UTF-8",
      LC_MEASUREMENT: "en_US.UTF-8",
      LC_MONETARY: "en_US.UTF-8",
      LC_NAME: "en_US.UTF-8",
      LC_NUMERIC: "en_US.UTF-8",
      LC_PAPER: "en_US.UTF-8",
      LC_TELEPHONE: "en_US.UTF-8",
      LC_TIME: "en_US.UTF-8",
      LESSCLOSE: "/usr/bin/lesspipe %s %s",
      LESSOPEN: "| /usr/bin/lesspipe %s",
      LOGNAME: "pawel",
      MANDATORY_PATH: "/usr/share/gconf/ubuntu.mandatory.path",
      NODE: "/usr/bin/node",
      NO_AT_BRIDGE: "1",
      OLDPWD: "/home/pawel",
      PAPERSIZE: "letter"
    };
  }

  get app() {
    return document.querySelector('arc-app');
  }

  _appActionHandler(e) {
    const fn = e.target.selectedItem.dataset.function;
    document.querySelector('arc-app')[fn]();
  }

  _demoTemplate() {
    const {
      systemVariables
    } = this;
    return html`
    <arc-app
      .sysVars="${systemVariables}"
      slot="content"
    >
      <anypoint-menu-button
        verticalalign="top"
        horizontalalign="auto"
        slot="main-toolbar-icon-suffix"
      >
        <anypoint-icon-button slot="dropdown-trigger">
          <span class="icon web-app-nav">${moreVert}</span>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          @selected-changed="${this._appActionHandler}"
        >
          <anypoint-item data-function="openCookieManager">Cookie manager</anypoint-item>
          <anypoint-item data-function="openDrivePicker">Google Drive Browser</anypoint-item>
          <anypoint-item data-function="openSettings">Settings</anypoint-item>
          <anypoint-item data-function="openImport">Data import</anypoint-item>
          <anypoint-item data-function="openExport">Data export</anypoint-item>
          <anypoint-item data-function="openWebSocket">Websocket</anypoint-item>
          <anypoint-item data-function="openInfoCenter">Info center</anypoint-item>
          <anypoint-item data-function="openLicense">License</anypoint-item>
          <anypoint-item data-function="openWorkspaceDetails">Workspace details</anypoint-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </arc-app>
    `;
  }

  contentTemplate() {
    return html`
      <arc-local-store-workspace></arc-local-store-workspace>
      <arc-local-store-preferences></arc-local-store-preferences>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
setTimeout(() => {
  const node = document.querySelector('arc-app');
  node.initApplication();
}, 1000);
