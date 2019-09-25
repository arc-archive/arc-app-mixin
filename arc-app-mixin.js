/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html } from 'lit-element/lit-element.js';
import { menu, arrowBack, infoOutline, fileDownload } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@advanced-rest-client/arc-models/project-model.js';
import '@advanced-rest-client/arc-models/rest-api-model.js';
import '@advanced-rest-client/arc-models/host-rules-model.js';
import '@advanced-rest-client/arc-models/request-model.js';
import '@advanced-rest-client/arc-models/auth-data-model.js';
import '@advanced-rest-client/arc-models/url-history-model.js';
import '@advanced-rest-client/arc-models/websocket-url-history-model.js';
import '@advanced-rest-client/arc-models/variables-model.js';
import '@advanced-rest-client/arc-models/url-indexer.js';
import '@advanced-rest-client/arc-data-export/arc-data-export.js';
import '@advanced-rest-client/arc-data-import/arc-data-import.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/request-hooks-logic/request-hooks-logic.js';
import '@advanced-rest-client/arc-request-logic/arc-request-logic.js';
import '@advanced-rest-client/response-history-saver/response-history-saver.js';
import '@advanced-rest-client/variables-manager/variables-manager.js';
import '@advanced-rest-client/variables-evaluator/variables-evaluator.js';
import '@advanced-rest-client/arc-messages-service/arc-messages-service.js';
import '@advanced-rest-client/app-analytics/app-analytics.js';
import '@advanced-rest-client/app-analytics/app-analytics-custom.js';
import '@advanced-rest-client/authorization-data-saver/authorization-data-saver.js';
import '@advanced-rest-client/environment-selector/environment-selector.js';
import '@advanced-rest-client/arc-request-workspace/arc-request-workspace.js';
import '@advanced-rest-client/arc-menu/arc-menu.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js'
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js'
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js'
import '@anypoint-web-components/anypoint-item/anypoint-item.js'
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js'
async function aTimout(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}
/**
 * A set of common functions to be shared between versions of ARC
 * on different platforms.
 *
 * This mixin contains methods platform independent. Platform dependent functions
 * should be implemented in the version of the app.
 *
 * ## DOM requirements
 *
 * The mixin requires the element to have `arc-request-workspace` (or similar)
 * to be placerd in the DOM with id set to "workspace".
 *
 * @mixinFunction
 * @memberof ArcComponents
 * @param {Class} base
 * @return {Class}
 */
export const ArcAppMixin = (base) => class extends base {
  get appMenuDisabled() {
    const { menuConfig } = this;
    if (!menuConfig) {
      return false;
    }
    if (menuConfig.menuDisabled) {
      return true;
    }
    if (menuConfig.hideHistory && menuConfig.hideSaved && menuConfig.hideProjects && menuConfig.hideApis) {
      return true;
    }
    return false;
  }

  get renderBackButton() {
    const { page } = this;
    return !page || page !== 'request';
  }

  get _oauth2redirectUri() {
    const config = this.config || {};
    return config.oauth2redirectUri || 'https://auth.advancedrestclient.com/oauth-popup.html';
  }

  get page() {
    return this._page;
  }

  set page(value) {
    const old = this._page;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._page = value;
    this.requestUpdate('page', old);
    this._pageChanged(value);
    this._routeDataChanged();
  }

  get routeParams() {
    return this._routeParams;
  }

  set routeParams(value) {
    const old = this._routeParams;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.requestUpdate('routeParams', old);
    this._routeParams = value;
    this._routeDataChanged();
  }

  get _variablesOverlayOpened() {
    return this.__variablesOverlayOpened;
  }

  set _variablesOverlayOpened(value) {
    const old = this.__variablesOverlayOpened;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.requestUpdate('_variablesOverlayOpened', old);
    this.__variablesOverlayOpened = value;
    this._varsOverlayChanged(value);
  }

  get requestModel() {
    if (!this.__rmodel) {
      this.__rmodel = this.shadowRoot.querySelector('request-model');
    }
    return this.__rmodel;
  }

  static get properties() {
    return {
      /**
       * Automatically set via media queries.
       * When set it renders narrow wiew.
       * This also affects API console.
       */
      narrow: { type: Boolean },
      /**
       * Set by API console wrapper. WHen set the API is being processed.
       */
      apiProcessing: { type: Boolean },
      apiSelected: { type: String },
      apiSelectedType: { type: String },
      /**
       * Received from layout elements narrow state.
       */
      narrowLayout: { type: Boolean, reflect: true },
      /**
       * A base path to the web componentes. It is used to determine
       * components location when including parts of the application.
       */
      componentsDir: { type: String },
      /**
       * Additional route params read from navigation
       */
      routeParams: { type: Object },
      /**
       * When true then a source components are being loaded.
       */
      _loadingSources: { type: Boolean },
      /**
       * Currently opened application screen
       * @type {String}
       */
      page: { type: String },
      /**
       * Google Analytics custom dimmensions
       */
      gaCustomDimensions: { type: Array },
      /**
       * Google Analytics custom metrics
       */
      gaCustomMetrics: { type: Array },
      // Application ID for analytics
      appId: { type: String },
      /**
       * Current application varsion
       */
      appVersion: { type: String },
      /**
       * Browser version
       */
      browserVersion: { type: String },
      /**
       * Application channel, `stable`, `beta`, `dev`
       */
      appChannel: { type: String },
      /**
       * List of unread messages from app developer.
       * @type {Array<Object>}
       */
      newMessages: { type: Array },
      // List of cached messages from app developer.
      appMessages: { type: Array },
      // If true, messages center is opened.
      messageCenterOpened: { type: Boolean },
      /**
       * True if application update is possible.
       * In web version it means rthe service worker updated files.
       */
      hasAppUpdate: { type: Boolean },
      /**
       * A scroll target for the components that relays on this property.
       * @type {Element}
       */
      _scrollTarget: { type: Object },
      /**
       * When set it enables Google Analytics
       */
      telemetry: { type: Boolean },
      /**
       * Google Drive access token
       */
      driveAccessToken: { type: String },
      /**
       * A logger
       */
      log: { type: Object },
      /**
       * Application user configuration read from the config file.
       * It may not be ready when the app is initialized.
       */
      config: { type: Object },
      /**
       * True if history should be enabled. This value is set from settings
       * object.
       */
      historyEnabled: { type: Boolean },
      /**
       * Configuration object related to ARC menu.
       * It is used with menu popups. When a menu panel is pop out to new
       * window then selected menu is not rendered.
       *
       * This mixin does not provide methods to listen for changes in this
       * object as implementation is different dependening on the platform.
       *
       * Available keys:
       * - menuDisabled - true when menu should not be visible in the UI
       * - hideHistory
       * - hideSaved
       * - hideProjects
       * - hideApis
       */
      menuConfig: { type: Object },
      /**
       * A reference to the variables open button.
       * @type {String}
       */
      _variablesButton: { type: Object },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
    };
  }

  get workspace() {
    return this.shadowRoot.querySelector('#workspace');
  }

  constructor() {
    super();
    this._handleNavigation = this._handleNavigation.bind(this);
    this._settingChanged = this._settingChanged.bind(this);
    this._appVersionRequestHandler = this._appVersionRequestHandler.bind(this);
    this._googleOauthTokenRequested = this._googleOauthTokenRequested.bind(this);
    this._inspectImportHandler = this._inspectImportHandler.bind(this);
    this._apiDataHandler = this._apiDataHandler.bind(this);
    this._processErrorHandler = this._processErrorHandler.bind(this);
    this._processStartHandler = this._processStartHandler.bind(this);
    this._processStopHandler = this._processStopHandler.bind(this);
    this.openWorkspace = this.openWorkspace.bind(this);
    this.log = console;
    this.browserVersion = '';
    this.appChannel = 'stable';
    this.appVersion = 'unknown';
    this.appId = 'com.mulesoft.arc';
    this.page = 'request';
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('navigate', this._handleNavigation);
    window.addEventListener('settings-changed', this._settingChanged);
    window.addEventListener('app-version', this._appVersionRequestHandler);
    window.addEventListener('google-autorize', this._googleOauthTokenRequested);
    window.addEventListener('import-data-inspect', this._inspectImportHandler);
    window.addEventListener('api-data-ready', this._apiDataHandler);
    window.addEventListener('process-error', this._processErrorHandler);
    window.addEventListener('process-loading-start', this._processStartHandler);
    window.addEventListener('process-loading-stop', this._processStopHandler);
    this.addEventListener('request-workspace-append', this.openWorkspace);
    window.addEventListener('workspace-open-project-requests', this.openWorkspace);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('navigate', this._handleNavigation);
    window.removeEventListener('settings-changed', this._settingChanged);
    window.removeEventListener('app-version', this._appVersionRequestHandler);
    window.removeEventListener('google-autorize', this._googleOauthTokenRequested);
    window.removeEventListener('import-data-inspect', this._inspectImportHandler);
    window.removeEventListener('api-data-ready', this._apiDataHandler);
    window.removeEventListener('process-error', this._processErrorHandler);
    window.removeEventListener('process-loading-start', this._processStartHandler);
    window.removeEventListener('process-loading-stop', this._processStopHandler);
    this.removeEventListener('request-workspace-append', this.openWorkspace);
    window.removeEventListener('workspace-open-project-requests', this.openWorkspace);
  }

  firstUpdated() {
    if (this.page === 'request') {
      this._setupRequest(this.routeParams);
    }
  }
  /**
   * Lazy loads component to the DOM.
   * It builds the component path as a `componentsDir` + node_modules
   * + `path` + .html.
   *
   * **Example**
   *
   * ```javascript
   * this._loadComponent('api-console/api-console', '@api-components')
   * .then(() => {}); // console is now loaded.
   * ```
   *
   * @param {String} path Component path inside node location.
   * @param {?String} scope Component package's scope
   * @return {Promise}
   */
  async _loadComponent(path, scope) {
    let componentUrl = '';
    let dir;
    if (this.componentsDir) {
      dir = this.componentsDir;
      if (dir[dir.length - 1] !== '/') {
        dir += '/';
      }
    } else {
      dir = 'node_modules/';
    }
    if (scope) {
      scope += '/';
    } else {
      scope = '';
    }
    if (dir[0] !== '.' && dir[0] !== '/') {
      dir = '/' + dir;
    }
    componentUrl = `${dir}${scope}${path}.js`;
    this._loadingSources = true;
    try {
      await import(componentUrl);
    } catch (e) {
      this.log.warn(e);
      this._loadingSources = false;
      throw componentUrl;
    }
  }

  _reportComponentLoadingError(url) {
    this.log.warn(`Unable to load component from ${url}`);
  }
  /**
   * This component ensures that the workspace is loaded into the DOM.
   * It can be used when curreent operation don't require workspace to be
   * present in the DOM before bit it will now.
   * @return {Promise}
   */
  async _loadWorkspace() {
    const path = 'arc-request-workspace/arc-request-workspace';
    return await this._loadComponent(path, '@advanced-rest-client');
  }
  /**
   * Handles navigation event and sets the route data.
   * @param {CustomEvent} e
   */
  _handleNavigation(e) {
    const params = e.detail;
    const page = params.base;
    let routeParams;
    switch (page) {
      case 'project':
        routeParams = {
          id: params.id
        };
        break;
      case 'request':
        routeParams = {
          id: params.id,
          type: params.type
        };
        break;
      case 'api-console':
        routeParams = {
          id: params.id
        };
        break;
    }
    if (page) {
      this.page = page;
      this.routeParams = routeParams;
      this._telemetryScreen();
    } else {
      this.dispatchEvent(new CustomEvent('send-analytics', {
        bubbles: true,
        composed: true,
        detail: {
          type: 'exception',
          description: 'Route not handled' + JSON.stringify(params),
          fatal: false
        }
      }));
      throw new Error('The route is not handled correctly', params);
    }
  }
  /**
   * Sends screen view to Google Analytics
   */
  _telemetryScreen() {
    let screenName = this.page;
    switch (this.page) {
      case 'history': screenName = 'History'; break;
      case 'settings': screenName = 'Settings'; break;
      case 'about': screenName = 'About'; break;
      case 'socket': screenName = 'Socket'; break;
      case 'saved': screenName = 'Saved'; break;
      case 'data-import': screenName = 'Data import'; break;
      case 'data-export': screenName = 'Data export'; break;
      case 'project': screenName = 'Project details'; break;
      case 'default':
      case 'request': screenName = 'Request panel'; break;
      case 'drive': screenName = 'Drive selector'; break;
      case 'cookie-manager': screenName = 'Cookie manager'; break;
      case 'api-console': screenName = 'API Console'; break;
      case 'rest-projects': screenName = 'REST APIs list'; break;
      case 'exchange-search': screenName = 'Exchange search'; break;
      case 'hosts-rules': screenName = 'Hosts rules'; break;
      case 'themes-panel': screenName = 'Themes panel'; break;
    }
    this.dispatchEvent(new CustomEvent('send-analytics', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {
        type: 'screenview',
        name: screenName
      }
    }));
  }
  /**
   * Initialize global settings variables
   *
   * @return {Promise<Object>} A promise resolved to a settings object.
   */
  async initSettings() {
    const e = new CustomEvent('settings-read', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {}
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      // throw new Error('Settings provider not found.');
      this.log.warn(`[arc-app] Settings provider not found`);
      return {};
    }
    const settings = await e.detail.result;
    this.config = settings;
    if (settings.telemetry === false) {
      this._analyticsDisabled();
    } else {
      this._analyticsEnabled();
      setTimeout(() => this._telemetryScreen(), 20);
    }
    let historyEnabled;
    if (typeof settings.historyEnabled !== 'boolean') {
      historyEnabled = true;
    } else {
      historyEnabled = settings.historyEnabled;
    }
    this.historyEnabled = historyEnabled;
    return settings;
  }
  /**
   * Enables Google Analytics.
   *
   * Until settings status is checked Google Analytics components is not
   * even in the DOM. Once the `telemetry` flag is set analytics elements
   * are attached to the DOM and start handling events.
   *
   * This can be disabled by calling `_analyticsDisabled` or by sending
   * `settings-changed` custom event with `telemetry` key.
   */
  _analyticsEnabled() {
    this.telemetry = true;
    if (this.gaCustomDimensions) {
      return;
    }
    const cd = [];
    cd.push({
      index: 1,
      value: this.browserVersion
    });
    cd.push({
      index: 2,
      value: this.appVersion
    });
    cd.push({
      index: 5,
      value: this.appChannel
    });
    this.gaCustomDimensions = cd;
  }

  // To be called if GA is disabled to remove GA elements from the DOM.
  _analyticsDisabled() {
    this.telemetry = false;
  }
  /**
   * Handles settings change event.
   *
   * @param {CustomEvent} e
   */
  _settingChanged(e) {
    const n = e.detail.name;
    const v = e.detail.value;
    if (!this.config) {
      this.config = {};
    }
    this.config[n] = v;
    switch (n) {
      case 'telemetry':
        this._telemetryChanged(v);
        break;
      case 'historyEnabled':
        this.historyEnabled = v;
        break;
    }
  }
  /**
   * A function that handles `telemetry` property chnage.
   * @param {String|Boolean} value New value
   */
  _telemetryChanged(value) {
    if (typeof value !== 'boolean') {
      value = value === 'false' ? false : true;
    }
    if (value) {
      this._analyticsEnabled();
    } else {
      this._analyticsDisabled();
    }
  }
  /**
   * Saves currently opened requests.
   *
   * @param {?Object} opts Optional options object. It can contain `source`
   * property with value of `shortcut` to indicate that the shortcut was
   * used and the app can automatically save current request
   */
  saveOpened(opts) {
    if (this.page !== 'request') {
      return;
    }
    this.workspace.saveOpened(opts);
  }
  /**
   * Closes workspace tab by index.
   * @param {Number} index
   */
  closeWorkspaceTab(index) {
    if (this.page !== 'request') {
      return;
    }
    index = Number(index);
    this.workspace.removeRequest(index);
  }
  /**
   * Closes all workspace tabs.
   */
  closeAllWorkspaceTabs() {
    this.workspace.clearWorkspace();
  }
  /**
   * Closes all workspace tabs but selected.
   * @param {Number} index Index of a tab to leave in workspace.
   */
  closeOtherWorkspaceTabs(index) {
    index = Number(index);
    const active = this.workspace.activeRequests;
    for (let i = active.length - 1; i >= 0; i--) {
      if (i !== index) {
        this.workspace.removeRequest(i, true);
      }
    }
    this.workspace.selected = 0;
  }
  /**
   * Duplicates tab values at a position
   * @param {Number} index Selected tab
   */
  duplicateWorkspaceTab(index) {
    if (this.page !== 'request') {
      return;
    }
    index = Number(index);
    this.workspace.duplicateTab(index);
  }
  /**
   * Returns number of currently opened tabs
   *
   * @return {Number} Number of opened tabs in request workspace.
   */
  getTabsCount() {
    const workspace = this.workspace;
    if (!workspace || !workspace.activeRequests) {
      return 0;
    }
    return workspace.activeRequests.length;
  }
  /**
   * Opens new tab in the request workspace.
   */
  newRequestTab() {
    if (this.page !== 'request') {
      return;
    }
    this.workspace.addEmptyRequest();
  }
  /**
   * Sends currently opened request.
   */
  sendCurrentTab() {
    if (this.page !== 'request') {
      return;
    }
    this.workspace.sendCurrent();
  }
  /**
   * Updates a request object in this window for a specific tab.
   *
   * @param {Object} request ARC request obejct
   * @param {?Number} index Tab index to update. If not provided (or not a number)
   * it uses current active tab.
   */
  updateRequestTab(request, index) {
    this.log.info('Updating request object...');
    const workspace = this.workspace;
    if (typeof index !== 'number') {
      this.log.info('Tab index not set. Using current selection...');
      index = workspace.selected;
    }
    workspace.updateRequestObject(request, index);
  }
  /**
   * Dispatches `navigate` event with passed `detail`.
   * @param {Object} detail The detail object to set on the event.
   * Each navigate event requires `base` property to be set.
   */
  _dispatchNavigate(detail) {
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail
    }));
  }

  /**
   * Navigates to cookie manager
   */
  openCookieManager() {
    this._dispatchNavigate({
      base: 'cookie-manager'
    });
  }
  /**
   * Navigates to Exchange search panel
   */
  openExchangeSearch() {
    this._dispatchNavigate({
      base: 'exchange-search'
    });
  }
  /**
   * Navigates to themes panel
   */
  openThemesPanel() {
    this._dispatchNavigate({
      base: 'themes-panel'
    });
  }
  /**
   * Navigates to about screen
   */
  openAbout() {
    this._dispatchNavigate({
      base: 'about'
    });
  }
  /**
   * Navigates to Google Drive file browser
   */
  openDrivePicker() {
    this._dispatchNavigate({
      base: 'drive'
    });
  }
  /**
   * Opens the settings panel.
   */
  openSettings() {
    this._dispatchNavigate({
      base: 'settings'
    });
  }
  /**
   * Opens the host rules editor.
   */
  openHostRules() {
    this._dispatchNavigate({
      base: 'hosts-rules'
    });
  }
  /**
   * Navigates to import panel
   */
  openImport() {
    this._dispatchNavigate({
      base: 'data-import'
    });
  }
  /**
   * Navigates to export panel
   */
  openExport() {
    this._dispatchNavigate({
      base: 'data-export'
    });
  }
  /**
   * Opens web socket panel.
   */
  openWebSocket() {
    this._dispatchNavigate({
      base: 'socket'
    });
  }
  /**
   * Opens saved requests screen
   */
  openSaved() {
    this._dispatchNavigate({
      base: 'saved'
    });
  }
  /**
   * Opens history requests screen
   */
  openHistory() {
    this._dispatchNavigate({
      base: 'history'
    });
  }
  /**
   * Opens requests workspace component.
   */
  openWorkspace() {
    this.page = 'request';
  }
  /**
   * Handles ARC components event for application version.
   * @param {CustomEvent} e
   */
  _appVersionRequestHandler(e) {
    e.detail.version = this.appVersion;
  }
  /**
   * Handler for `google-autorize` custom event sent by Drive component.
   * It calls `_requestAuthToken()` function which should be implemented
   * for a specific platform.
   * @param {CustomEvent} e
   */
  _googleOauthTokenRequested(e) {
    const scope = e.detail.scope.split(' ');
    this._requestAuthToken(true, scope);
  }
  /**
   * Implementation is platform specific
   *
   * @param {Boolean} interactive
   * @param {Array<String>} scope
   */
  _requestAuthToken() {
    this.log.warn('_requestAuthToken() not implemented.');
  }
  /**
   * Abstract method to be implemented by ARC instances to notify user about
   * an error.
   *
   * @param {String} message A message to render
   */
  notifyError(message) {
    this.log.warn(message);
  }
  /**
   * Handler for `import-data-inspect`. Opens import panel and adds data to it.
   * @param {CustomEvent} e
   * @return {Promise} A promise resolved when the component is loaded. It for tests.
   */
  async _inspectImportHandler(e) {
    const { data } = e.detail;
    try {
      await this._loadComponent('import-panel/import-panel', '@advanced-rest-client');
      await aTimout();
      const node = this.shadowRoot.querySelector('import-panel');
      node.data = data;
      node.selectedPage = 3;
      this.openImport();
    } catch (e) {
      this.notifyError(e.message);
    }
  }

  _computeVarDisabled(enabled) {
    if (enabled === undefined) {
      return false;
    }
    return !enabled;
  }

  /**
   * Sets `newMessages` propert depending if messaging service detected
   * new messages.
   *
   * @param {CustomEvent} e
   */
  _unreadMessagesChanged(e) {
    const state = !!(e.detail.value && e.detail.value.length > 0);
    this.newMessages = state;
  }

  _appMessagesHandler(e) {
    this.appMessages = e.detail.value;
  }

  /**
   * Returns true when both types of variables are disabled.
   * @param {Boolean} sysVars
   * @param {Boolean} appVars
   * @return {Boolean}
   */
  _computeVariablesDisabled(sysVars, appVars) {
    if (sysVars === undefined) {
      sysVars = true;
    }
    if (appVars === undefined) {
      appVars = true;
    }
    return !(sysVars && appVars);
  }

  _routeDataChanged() {
    const { page, routeParams } = this;
    switch (page) {
      case 'request':
        this._setupRequest(routeParams);
        break;
    }
  }

  /**
   * Loads a page component when page changes.
   * @param {String} page Current page
   * @return {Promise}
   */
  async _pageChanged(page) {
    let id;
    let path;
    let scope;
    history.pushState({ page }, null, '#' + page);
    switch (page) {
      case 'request':
        id = 'arc-request-workspace';
        path = 'arc-request-workspace/arc-request-workspace';
        scope = '@advanced-rest-client';
        break;
      case 'project':
        id = 'project-details';
        path = 'project-details/project-details';
        scope = '@advanced-rest-client';
        break;
      case 'cookie-manager':
        id = 'cookie-manager';
        path = 'cookie-manager/cookie-manager';
        scope = '@advanced-rest-client';
        break;
      case 'settings':
        id = 'arc-settings-panel';
        path = 'arc-settings-panel/arc-settings-panel';
        scope = '@advanced-rest-client';
        break;
      case 'socket':
        id = 'websocket-panel';
        path = 'websocket-panel/websocket-panel';
        scope = '@advanced-rest-client';
        break;
      case 'drive':
        id = 'google-drive-browser';
        path = 'google-drive-browser/google-drive-browser';
        scope = '@advanced-rest-client';
        break;
      case 'data-import':
        id = 'import-panel';
        path = 'import-panel/import-panel';
        scope = '@advanced-rest-client';
        break;
      case 'data-export':
        id = 'export-panel';
        path = 'export-panel/export-panel';
        scope = '@advanced-rest-client';
        break;
      case 'history':
        id = 'history-panel';
        path = 'history-panel/history-panel';
        scope = '@advanced-rest-client';
        break;
      case 'saved':
        id = 'saved-requests-panel';
        path = 'saved-requests-panel/saved-requests-panel';
        scope = '@advanced-rest-client';
        break;
      default:
        this.log.error(`The base route ${page} is not recognized`);
        return;
    }
    const cls = window.customElements.get(id);
    if (cls) {
      return;
    }
    try {
      await this._loadComponent(path, scope)
    } catch (cmp) {
      this._reportComponentLoadingError(cmp);
    }
  }

  initApplication() {
    setTimeout(() => this.initSettings({}));
    setTimeout(() => this._requestAuthToken(false));
    const hash = location.hash.substr(1);
    if (hash) {
      this.page = hash;
    }
  }

  async _setupRequest(params) {
    if (!params) {
      return;
    }
    const { id, type } = params;
    if (!type || !this.workspace.addEmptyRequest) {
      this.log.info('arc-app-mixin::_setupRequest::Missing use case implementation?');
      return;
    }
    if (!type || type === 'new') {
      this.workspace.addEmptyRequest();
      return;
    }
    if (params.type === 'latest' || !params.id) {
      return;
    }
    const model = this.requestModel;
    if (!model) {
      this.log.warn('Request model not ready.');
      return;
    }
    try {
      const request = await model.read(type, id);
      const workspace = this.workspace;
      const index = workspace.findRequestIndex(request._id);
      if (index === -1) {
        workspace.appendRequest(request);
      } else {
        workspace.updateRequestObject(request, index);
        workspace.selected = index;
      }
    } catch (cause) {
      this.log.warn('Restoring request:', cause);
    }
  }


  /**
   * Loads `web-url-input` component and runs it to ask the user for the URL
   * to open in session window. Cookies recorded in the window are becomming
   * requests session cookies.
   */
  openWebUrl() {
    if (this.page !== 'request') {
      this.page = 'request';
    }
    this.workspace.openWebUrlInput();
  }
  /**
   * The overlay is not included by default in the view so it loads the
   * component first and then renders it. Subsequent opens do not require
   * inluding the comonent.
   *
   * @param {Boolean} val
   */
  async _varsOverlayChanged(val) {
    if (val && !window.customElements.get('variables-preview-overlay')) {
      try {
        await this._loadComponent('variables-preview-overlay/variables-preview-overlay', '@advanced-rest-client');
      } catch (cmp) {
        this._reportComponentLoadingError(cmp);
      }
    }
  }

  async _variablesOpenRequest(e) {
    e.stopPropagation();
    this._variablesOverlayOpened = false;
    try {
      await this._loadComponent('variables-drawer-editor/variables-drawer-editor', '@advanced-rest-client');
      const node = this.shadowRoot.querySelector('#environmentsDrawer');
      node.opened = true;
    } catch(e) {
      this._reportComponentLoadingError(e);
    }
  }

  _variablesPreviewClosed() {
    if (this._variablesOverlayOpened) {
      this._variablesOverlayOpened = false;
    }
  }

  _infoMessagesHandler(e) {
    if (e.detail.value) {
      this.openInfoCenter();
    } else {
      this.messageCenterOpened = false;
    }
  }

  /**
   * Opens the info center drawwer.
   */
  openInfoCenter() {
    const timeout = this._messagesReadTimeout || 4000;
    this.messageCenterOpened = !this.messageCenterOpened;
    if (this.messageCenterOpened) {
      const node = this.shadowRoot.querySelector('#msgService');
      node.readMessages();
      setTimeout(() => node.makrkAllRead(), timeout);
    }
  }
  /**
   * Closes the info center drawwer.
   */
  closeInfoCenter() {
    this.messageCenterOpened = false;
  }

  async _apiDataHandler(e) {
    const { model, type } = e.detail;
    await this._setApiData(model, type.type);
    this._dispatchNavigate({
      base: 'api-console'
    });
  }

  /**
   * Handles opening a file from Google Drive.
   * Dispatches `import-process-file` so the import module processes the data
   *
   * @param {CustomEvent} e
   */
  _openDriveRequest(e) {
    const file = new Blob([e.detail.content], { type: 'application/json' });
    this.dispatchEvent(new CustomEvent('import-process-file', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        file,
        diveId: e.detail.diveId
      }
    }));
  }
  /**
   * Handler for `process-loading-start` custom event.
   * Renders toast with message.
   * @param {CustomEvent} e
   */
  _processStartHandler(e) {
    const { id, message, indeterminate } = e.detail;
    if (!id) {
      this.log.warn('Invalid use of `process-loading-start` event');
      return;
    }
    const toast = document.createElement('paper-toast');
    toast.dataset.processId = id;
    if (indeterminate) {
      toast.duration = 0;
    }
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.alignItems = 'center';
    const label = document.createElement('span');
    label.innerText = message;
    label.style.flex = 1;
    label.style.flexBasis = '0.000000001px';
    container.appendChild(label);
    const spinner = document.createElement('paper-spinner');
    spinner.active = true;
    container.appendChild(spinner);
    toast.appendChild(container);
    document.body.appendChild(toast);
    toast.opened = true;
  }
  /**
   * Handler for `process-loading-stop` custom event.
   * Removes previously set toast
   * @param {CustomEvent} e
   */
  _processStopHandler(e) {
    const { id } = e.detail;
    if (!id) {
      this.log.warn('Invalid use of `process-loading-stop` event');
      return;
    }
    const node = document.body.querySelector(`[data-process-id="${id}"]`);
    if (!node) {
      return;
    }
    node.addEventListener('iron-overlay-closed', function f() {
      node.removeEventListener('iron-overlay-closed', f);
      try {
        node.parentNode.removeChild(node);
      } catch (_) {
        // ...
      }
    });
    node.opened = false;
  }
  /**
   * Handler for `process-error` custom event.
   * Removes previously set progress toasts and adds new with error.
   * @param {CustomEvent} e
   */
  _processErrorHandler(e) {
    const nodes = document.body.querySelectorAll(`paper-toast[data-process-id]`);
    for (let i = nodes.length - 1; i >= 0; i--) {
      nodes[i].opened = false;
      try {
        nodes[i].parentNode.removeChild(nodes[i]);
      } catch (_) {
        // ...
      }
    }
    this.notifyError(e.detail.message);
  }
  /**
   * Opens license dialog.
   */
  async openLicense() {
    try {
      await this._loadComponent('arc-license-dialog/arc-license-dialog', '@advanced-rest-client');
      const node = this.shadowRoot.querySelector('arc-license-dialog');
      node.opened = true;
    } catch (cmp) {
      this._reportComponentLoadingError(cmp);
    }
  }

  /**
   * Handler for the "back" icon click in main navigation.
   */
  _backHandler() {
    this.openWorkspace();
  }
  /**
   * Opens workspace details dialog.
   */
  openWorkspaceDetails() {
    if (this.page !== 'request') {
      this.page = 'request';
    }
    this.workspace.openWorkspaceDetails();
  }

  /**
   * Closes active tab in the workspace
   */
  closeActiveTab() {
    this.workspace.closeActiveTab();
  }

  modelsTemplate() {
    return html`<auth-data-model></auth-data-model>
    <project-model></project-model>
    <rest-api-model></rest-api-model>
    <host-rules-model></host-rules-model>
    <url-history-model></url-history-model>
    <request-model id="requestModel"></request-model>
    <authorization-data-saver></authorization-data-saver>
    <websocket-url-history-model></websocket-url-history-model>
    <variables-model></variables-model>
    <url-indexer></url-indexer>`;
  }

  importExportTemplate(opts) {
    const {
      outlined,
      compatibility,
      appVersion
    } = this;
    return html`
    <arc-data-export
      .appVersion="${appVersion}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?electroncookies="${opts.electron}"
    ></arc-data-export>
    <arc-data-import
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></arc-data-import>`;
  }


  requestLogicTemplate() {
    const {
      historyEnabled
    } = this;
    const config = this.config || {};
    const varsDisabled = this._computeVariablesDisabled(config.systemVariablesEnabled, config.appVariablesEnabled);
    return html`
    <oauth1-authorization></oauth1-authorization>
    <arc-request-logic
      ?variablesdisabled="${varsDisabled}"
      jexlpath="Jexl"
    ></arc-request-logic>
    <request-hooks-logic></request-hooks-logic>
    ${historyEnabled ? html`<response-history-saver></response-history-saver>` : ''}
    `;
  }

  variablesLogicTemplate() {
    const config = this.config || {};
    const { sysVars } = this;
    return html`
    <variables-manager
      .systemVariables="${sysVars}"
      ?sysvariablesdisabled="${this._computeVarDisabled(config.systemVariablesEnabled)}"
      ?appvariablesdisabled="${this._computeVarDisabled(config.appVariablesEnabled)}"></variables-manager>
    <variables-evaluator
      nobeforerequest
      jexlpath="Jexl"
    ></variables-evaluator>`;
  }

  appMessagesLogicTemplate(platform) {
    return html`<arc-messages-service
      platform="${platform}"
      @unread-changed="${this._unreadMessagesChanged}"
      @messages-changed="${this._appMessagesHandler}"
      id="msgService"
    ></arc-messages-service>`;
  }

  menuTemplate() {
    const {
      popupMenuExperimentEnabled,
      historyEnabled,
      compatibility
    } = this;
    const config = this.config || {};
    const menuConfig = this.menuConfig || {};
    return html`<arc-menu
      restapi
      ?compatibility="${compatibility}"
      ?draggableenabled="${config.draggableEnabled}"
      ?allowpopup="${popupMenuExperimentEnabled}"
      .listType="${config.viewListType}"
      ?historyenabled="${historyEnabled}"
      ?hidehistory="${menuConfig.hideHistory}"
      ?hidesaved="${menuConfig.hideSaved}"
      ?hideprojects="${menuConfig.hideProjects}"
      ?hideapis="${menuConfig.hideApis}"
      @popup-menu="${this._popupMenuHandler}"
    ></arc-menu>`;
  }

  _appToolbarToggleTemplate() {
    const {
      compatibility,
      appMenuDisabled
    } = this;
    return html`<anypoint-icon-button
      drawer-toggle
      title="Toggle application menu"
      ?hidden="${appMenuDisabled}"
      ?compatibility="${compatibility}"
      aria-label="Activate to toggle application menu"
    >
      <span class="icon">${menu}</span>
    </anypoint-icon-button>`;
  }

  _appToolbarBackButtonTemplate() {
    const {
      compatibility,
      renderBackButton
    } = this;
    if (!renderBackButton) {
      return '';
    }
    return html`<anypoint-icon-button
      class="app-back"
      @click="${this._backHandler}"
      title="Go back to main screen"
      ?compatibility="${compatibility}"
      aria-label="Activate to go to the main screen"
    >
      <span class="icon">${arrowBack}</span>
    </anypoint-icon-button>`;
  }

  _appToolbarMessagesButtonTemplate() {
    const {
      compatibility,
      newMessages,
      messageCenterOpened
    } = this;
    if (!newMessages) {
      return '';
    }
    return html`<anypoint-icon-button
      class="nav-notification-button"
      ?compatibility="${compatibility}"
      toggles
      .active="${messageCenterOpened}"
      title="See what's new in the app"
      aria-label="Activate to open application messages"
      @active-changed="${this._infoMessagesHandler}"
    >
      <span class="icon">${infoOutline}</span>
    </anypoint-icon-button>`;
  }

  _appToolbarUpdateButtonTemplate() {
    const {
      compatibility,
      hasAppUpdate
    } = this;
    if (!hasAppUpdate) {
      return '';
    }
    return html`<anypoint-icon-button
      ?compatibility="${compatibility}"
      class="nav-notification-button"
      @click="${this.updateInstall}"
      title="Restart and install update"
    >
      <span class="icon">${fileDownload}</span>
    </anypoint-icon-button>`;
  }

  _varsOverlayHandler(e) {
    this._variablesOverlayOpened = e.detail.value;
  }

  _appToolbarEnvTemplate() {
    const {
      compatibility,
      outlined,
      sysVars,
      _variablesOverlayOpened,
      _variablesButton
    } = this;
    return html`
    <div class="env-container">
      <span class="env-label">Environment:</span>
      <environment-selector
        nolabelfloat
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"></environment-selector>
      <anypoint-icon-button
        class="var-info-button"
        id="varToggleButton"
        title="Open variables list"
        .active="${_variablesOverlayOpened}"
        @active-changed="${this._varsOverlayHandler}"
        toggles
        ?compatibility="${compatibility}"
        aria-label="Activate to open variables list"
      >
        <span class="icon">${infoOutline}</span>
      </anypoint-icon-button>
      <variables-preview-overlay
        class="var-panel"
        .systemVariables="${sysVars}"
        .positionTarget="${_variablesButton}"
        dynamicalign
        horizontalalign="auto"
        verticalalign="auto"
        verticaloffset="44"
        @open-variables-editor="${this._variablesOpenRequest}"
        @overlay-closed="${this._variablesPreviewClosed}"
        .opened="${_variablesOverlayOpened}"
        maskedvalues
        ?compatibility="${compatibility}"
      ></variables-preview-overlay>
    </div>
    `;
  }

  mainToolbarTemplate() {
    return html`
    ${this._appToolbarToggleTemplate()}
    ${this._appToolbarBackButtonTemplate()}
    <div main-title></div>
    ${this._appToolbarMessagesButtonTemplate()}
    ${this._appToolbarUpdateButtonTemplate()}
    ${this._appToolbarEnvTemplate()}`;
  }

  _trackerTemplate(tid) {
    const {
      appId,
      appVersion
    } = this;
    const cm = this.gaCustomMetrics || [];
    const cd = this.gaCustomDimensions || [];
    return html`
    <app-analytics
      trackingid="${tid}"
      appname="ARC-electon"
      appid="${appId}"
      appversion="${appVersion}"
      datasource="electron-app"
    >
      ${cm.map((item) => html`
        <app-analytics-custom type="metric" .index="${item.index}" .value="${item.value}"></app-analytics-custom>
      `)}
      ${cd.map((item) => html`
        <app-analytics-custom type="dimension" .index="${item.index}" .value="${item.value}"></app-analytics-custom>
      `)}
    </app-analytics>`;
  }

  _analyticsTemplate() {
    if (!this.telemetry) {
      return '';
    }
    return html`
    ${this._trackerTemplate('UA-18021184-6')}
    ${this._trackerTemplate('UA-18021184-14')}
    ${this._trackerTemplate('UA-71458341-1')}`;
  }

  licenseTemplate() {
    const {
      compatibility
    } = this;
    return html`<arc-license-dialog
      ?compatibility="${compatibility}"
    ></arc-license-dialog>`;
  }

  variablesDrawerTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    return html`<variables-drawer-editor
      id="environmentsDrawer"
      withbackdrop
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></variables-drawer-editor>`;
  }

  workspaceTemplate() {
    const {
      _oauth2redirectUri,
      narrow,
      compatibility,
      outlined,
      page
    } = this;
    const config = this.config || {};
    const workspaceHidden = this.page !== 'request';
    return html`<arc-request-workspace
      data-route="request"
      id="workspace"
      ?draggableenabled="${config.draggableEnabled}"
      oauth2redirecturi="${_oauth2redirectUri}"
      ?ignorecontentonget="${config.ignoreContentOnGet}"
      ?narrow="${narrow}"
      ?hidden="${workspaceHidden}"
      @open-web-url="${this._openWebUrlHandler}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></arc-request-workspace>`;
  }

  websocketTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    return html`
      <websocket-panel
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
      ></websocket-panel>
    `;
  }

  requestHistoryTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    const config = this.config || {};
    return html`
      <history-panel
      .listType="${config.viewListType}"
      ?draggableenabled="${config.draggableEnabled}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></history-panel>
    `;
  }

  requestSavedTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    const config = this.config || {};
    return html`
      <saved-requests-panel
      .listType="${config.viewListType}"
      ?draggableenabled="${config.draggableEnabled}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></saved-requests-panel>
    `;
  }

  importViewTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    return html`
    <import-panel
      .accessToken="${this.driveAccessToken}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></import-panel>
    `;
  }

  exportViewTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    return html`
    <export-panel
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></export-panel>
    `;
  }

  settingsViewTemplate(opts) {
    const {
      compatibility,
      outlined
    } = this;
    return html`
    <arc-settings-panel
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?restApis="${opts.restApis}"
      ?systemVariablesDisabled="${opts.systemVariablesDisabled}"
      ?hasExperiments="${opts.hasExperiments}"
    ></arc-settings-panel>
    `;
  }

  projectDetailsViewTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    const config = this.config || {};
    return html`<project-details
      id="projectDetails"
      ?draggableenabled="${config.draggableEnabled}"
      .projectId="${this.routeParams.id}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></project-details>`;
  }

  gdriveViewTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    return html`<google-drive-browser
      .accessToken="${this.driveAccessToken}"
      @drive-file-picker-data="${this._openDriveRequest}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></google-drive-browser>`;
  }

  cookiesViewTemplate() {
    const {
      compatibility,
      outlined
    } = this;
    return html`<cookie-manager
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></cookie-manager>`;
  }

  restApisViewTemplate(opts) {
    const {
      compatibility,
      outlined
    } = this;
    return html`<rest-apis-list-panel
      ?renderexplore="${opts.sexplore}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></rest-apis-list-panel>`;
  }

  _pageTemplate() {
    const {
      page
    } = this;
    switch (page) {
      case 'socket': return this.websocketTemplate();
      case 'history': return this.requestHistoryTemplate();
      case 'saved': return this.requestSavedTemplate();
      case 'data-import': return this.importViewTemplate();
      case 'data-export': return this.exportViewTemplate();
      case 'project': return this.projectDetailsViewTemplate();
      case 'drive': return this.gdriveViewTemplate();
      case 'cookie-manager': return this.cookiesViewTemplate();
      default: return '';
    }
  }
}
