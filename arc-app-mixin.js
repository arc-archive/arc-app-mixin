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
  static get properties() {
    return {
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
      menuConfig: { type: Object }
    };
  }

  get workspace() {
    return this.shadowRoot.querySelector('workspace');
  }

  constructor() {
    super();
    this._handleNavigation = this._handleNavigation.bind(this);
    this._settingChanged = this._settingChanged.bind(this);
    this._appVersionRequestHandler = this._appVersionRequestHandler.bind(this);
    this._googleOauthTokenRequested = this._googleOauthTokenRequested.bind(this);
    this._inspectImportHandler = this._inspectImportHandler.bind(this);
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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('navigate', this._handleNavigation);
    window.removeEventListener('settings-changed', this._settingChanged);
    window.removeEventListener('app-version', this._appVersionRequestHandler);
    window.removeEventListener('google-autorize', this._googleOauthTokenRequested);
    window.removeEventListener('import-data-inspect', this._inspectImportHandler);
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
      const node = this.shadowRoot.querySelector('import-panel');
      if (!node) {
        this.notifyError('Import panel not found');
        return;
      }
      node.data = data;
      node.selectedPage = 3;
      this.openImport();
    } catch (e) {
      this.notifyError(e.message);
    }
  }
}
