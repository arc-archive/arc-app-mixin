import { LitElement, html } from 'lit-element';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import { ArcAppMixin } from '../arc-app-mixin.js';

class ArcApp extends ArcAppMixin(LitElement) {
  static get properties() {
    return {};
  }

  render() {
    const {
      appMessages
    } = this;
    return html`
    ${this.modelsTemplate()}
    ${this.importExportTemplate({ electron: true })}
    ${this.requestLogicTemplate()}
    ${this.variablesLogicTemplate()}
    ${this.appMessagesLogicTemplate('electron')}

    ${this.menuTemplate()}
    <arc-info-messages
      .messages="${appMessages}"
      @close="${this.closeInfoCenter}"
    ></arc-info-messages>
    ${this.mainToolbarTemplate()}
    ${this.workspaceTemplate()}
    ${this._pageTemplate()}
    ${this.variablesDrawerTemplate()}
    ${this._analyticsTemplate()}
    ${this.licenseTemplate()}`;
  }
}
window.customElements.define('arc-app', ArcApp);

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    // this.initObservableProperties([
    // ]);
    this._componentName = 'arc-app-mixin';
    this.demoStates = ['Default'];

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);

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

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      systemVariables
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the REST APIs menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <arc-app
            .sysVars="${systemVariables}"
            slot="content"
          ></arc-app>
        </arc-interactive-demo>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Exchange seatch panel</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
