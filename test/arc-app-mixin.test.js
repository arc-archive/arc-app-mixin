import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import './test-element.js';

describe('ArcAppMixin', function() {
  async function basicFixture() {
    return await fixture(html`
      <test-element></test-element>
    `);
  }

  async function componentFixture() {
    return await fixture(html`
      <test-element componentsdir="./node_modules"></test-element>
    `);
  }

  async function exportEncryptFixture() {
    return await fixture(html`
      <test-element componentsdir="./node_modules" withEncrypt></test-element>
    `);
  }

  async function customDimensionsFixture() {
    return await fixture(html`
      <test-element browserversion="123" appversion="456" appchannel="stable"></test-element>
    `);
  }

  async function requestFixture() {
    return await fixture(html`
      <test-element page="request"></test-element>
    `);
  }

  describe('_loadComponent()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });

    it('Loads a component', () => {
      return element._loadComponent('date-time/date-time', '@advanced-rest-client')
      .then(() => {
        const instance = window.customElements.get('date-time');
        assert.ok(instance);
      });
    });

    it('Rejects when component cannot be loaded', () => {
      return element._loadComponent('nothing-here/and-here')
      .then(() => {
        throw new Error('Should not resolve');
      })
      .catch((cause) => {
        assert.equal(cause, './node_modules/nothing-here/and-here.js');
      });
    });

    it('Uses default location if not set', () => {
      element.componentsDir = undefined;
      return element._loadComponent('nothing-here/and-here')
      .then(() => {
        throw new Error('Should not resolve');
      })
      .catch((cause) => {
        assert.equal(cause, '/node_modules/nothing-here/and-here.js');
      });
    });
  });

  describe('_reportComponentLoadingError()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Does nothing', () => {
      element._reportComponentLoadingError();
    });
  });

  describe('_loadWorkspace()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });

    it('Calls _loadComponent() with argument', () => {
      const spy = sinon.spy(element, '_loadComponent');
      const result = element._loadWorkspace();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'arc-request-workspace/arc-request-workspace');
      assert.equal(spy.args[0][1], '@advanced-rest-client');
      return result.catch(() => {});
    });
  });

  describe('_handleNavigation()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });

    function fire(detail) {
      const e = new CustomEvent('navigate', {
        bubbles: true,
        detail
      });
      document.dispatchEvent(e);
    }

    it('Sets route params for "project"', () => {
      fire({
        base: 'project',
        id: 'test-id'
      });
      assert.deepEqual(element.routeParams, {
        id: 'test-id'
      });
      assert.equal(element.page, 'project');
    });

    it('Sets route params for "request"', () => {
      fire({
        base: 'request',
        id: 'test-id',
        type: 'saved'
      });
      assert.deepEqual(element.routeParams, {
        id: 'test-id',
        type: 'saved'
      });
      assert.equal(element.page, 'request');
    });

    it('Calls _telemetryScreen()', () => {
      const spy = sinon.spy(element, '_telemetryScreen');
      fire({
        base: 'request',
        id: 'test-id',
        type: 'saved'
      });
      assert.isTrue(spy.called);
    });

    it('Throws when route is not handled', () => {
      assert.throws(() => {
        element._handleNavigation({
          detail: {
            base: ''
          }
        });
      });
    });

    it('Dispatches exception details', () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      try {
        element._handleNavigation({
          detail: {
            base: ''
          }
        });
      } catch (_) {
        // ..
      }
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.type, 'exception');
    });
  });

  describe('_telemetryScreen()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });
    [
      ['history', 'History'],
      ['settings', 'Settings'],
      // ['about', 'About'],
      ['socket', 'Socket'],
      ['saved', 'Saved'],
      ['data-import', 'Data import'],
      ['data-export', 'Data export'],
      ['project', 'Project details'],
      ['request', 'Request panel'],
      ['default', 'Request panel'],
      ['drive', 'Drive selector'],
      ['cookie-manager', 'Cookie manager'],
      // ['api-console', 'API Console'],
      // ['rest-projects', 'REST APIs list'],
      // ['exchange-search', 'Exchange search'],
      // ['hosts-rules', 'Hosts rules'],
      // ['themes-panel', 'Themes panel'],
      ['other', 'other']
    ].forEach((item) => {
      it(`Dispatches screenview for ${item[0]} page`, () => {
        const spy = sinon.spy();
        element.addEventListener('send-analytics', spy);
        element.page = item[0];
        element._telemetryScreen();
        assert.isTrue(spy.called);
        assert.equal(spy.args[0][0].detail.type, 'screenview');
        assert.equal(spy.args[0][0].detail.name, item[1]);
      });
    });
  });

  describe('initSettings()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    let handler;
    function wrapEvent(cnf) {
      cnf = cnf || {};
      handler = function(e) {
        e.preventDefault();
        e.detail.result = Promise.resolve(cnf);
      };
      window.addEventListener('settings-read', handler);
    }

    afterEach(() => {
      if (handler) {
        window.removeEventListener('settings-read', handler);
      }
    });

    it('Resolves promise with empty object when event not handled', () => {
      return element.initSettings()
      .then((result) => {
        assert.deepEqual(result, {});
      });
    });

    it('Resolves to settings object', () => {
      wrapEvent({
        test: true
      });
      return element.initSettings()
      .then((result) => {
        assert.deepEqual(result, {
          test: true
        });
      });
    });

    it('Calls _telemetryScreen() when telemetry is set', (done) => {
      wrapEvent();
      const spy = sinon.spy(element, '_telemetryScreen');
      element.initSettings()
      .then(() => {
        setTimeout(() => {
          assert.isTrue(spy.called);
          done();
        }, 20);
      });
    });

    it('Calls _analyticsEnabled() when telemetry is not set', () => {
      wrapEvent();
      const spy = sinon.spy(element, '_analyticsEnabled');
      return element.initSettings()
      .then(() => {
        assert.isTrue(spy.called);
      });
    });

    it('Calls _analyticsDisabled() when telemetry is false', () => {
      wrapEvent({
        telemetry: false
      });
      const spy = sinon.spy(element, '_analyticsDisabled');
      return element.initSettings()
      .then(() => {
        assert.isTrue(spy.called);
      });
    });

    it('historyEnabled is true when no corresponding setting', () => {
      wrapEvent();
      return element.initSettings()
      .then(() => {
        assert.isTrue(element.historyEnabled);
      });
    });

    it('historyEnabled is false', () => {
      wrapEvent({
        historyEnabled: false
      });
      return element.initSettings()
      .then(() => {
        assert.isFalse(element.historyEnabled);
      });
    });
  });

  describe('_analyticsEnabled()', () => {
    let element;
    beforeEach(async () => {
      element = await customDimensionsFixture();
    });

    it('Sets telemetry', () => {
      element._analyticsEnabled();
      assert.isTrue(element.telemetry);
    });

    it('Creates gaCustomDimensions', () => {
      element._analyticsEnabled();
      assert.typeOf(element.gaCustomDimensions, 'array');
      assert.lengthOf(element.gaCustomDimensions, 3);
    });

    it('Creates CD #1 is set', () => {
      element._analyticsEnabled();
      assert.equal(element.gaCustomDimensions[0].index, 1);
      assert.equal(element.gaCustomDimensions[0].value, '123');
    });

    it('Creates CD #2 is set', () => {
      element._analyticsEnabled();
      assert.equal(element.gaCustomDimensions[1].index, 2);
      assert.equal(element.gaCustomDimensions[1].value, '456');
    });

    it('Creates CD #3 is set', () => {
      element._analyticsEnabled();
      assert.equal(element.gaCustomDimensions[2].index, 5);
      assert.equal(element.gaCustomDimensions[2].value, 'stable');
    });

    it('Won\'t set custom dimmensions when already set', () => {
      element.gaCustomDimensions = [{}];
      element._analyticsEnabled();
      assert.lengthOf(element.gaCustomDimensions, 1);
    });
  });

  describe('_analyticsDisabled()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets telemetry', () => {
      element._analyticsDisabled();
      assert.isFalse(element.telemetry);
    });
  });

  describe('_settingChanged()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets a configuration', () => {
      element._settingChanged({
        detail: {
          name: 'test',
          value: 'value'
        }
      });
      assert.equal(element.config.test, 'value');
    });

    it('Updates configuration', () => {
      element.config = {
        test: 'value'
      };
      element._settingChanged({
        detail: {
          name: 'test',
          value: 'other'
        }
      });
      assert.equal(element.config.test, 'other');
    });

    it('Calls _telemetryChanged() for telemetry config', () => {
      const spy = sinon.spy(element, '_telemetryChanged');
      element._settingChanged({
        detail: {
          name: 'telemetry',
          value: true
        }
      });
      assert.isTrue(spy.called);
      assert.isTrue(spy.args[0][0]);
    });

    it('Sets historyEnabled', () => {
      element._settingChanged({
        detail: {
          name: 'historyEnabled',
          value: true
        }
      });
      assert.isTrue(element.historyEnabled);
    });
  });

  describe('_telemetryChanged()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _analyticsEnabled()', () => {
      const spy = sinon.spy(element, '_telemetryChanged');
      element._telemetryChanged(true);
      assert.isTrue(spy.called);
    });

    it('Calls _analyticsEnabled() with string argument', () => {
      const spy = sinon.spy(element, '_telemetryChanged');
      element._telemetryChanged('true');
      assert.isTrue(spy.called);
    });

    it('Calls _analyticsDisabled()', () => {
      const spy = sinon.spy(element, '_analyticsDisabled');
      element._telemetryChanged(false);
      assert.isTrue(spy.called);
    });

    it('Calls _analyticsDisabled() with string argument', () => {
      const spy = sinon.spy(element, '_analyticsDisabled');
      element._telemetryChanged('false');
      assert.isTrue(spy.called);
    });
  });

  describe('saveOpened()', () => {
    let element;
    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Calls saveOpened() on workspace', () => {
      const spy = sinon.spy(element.workspace, 'saveOpened');
      const opts = { shortcut: true };
      element.saveOpened(opts);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], opts);
    });

    it('Ignores calls when not request page', () => {
      element.page = 'project';
      const spy = sinon.spy(element.workspace, 'saveOpened');
      const opts = { shortcut: true };
      element.saveOpened(opts);
      assert.isFalse(spy.called);
    });
  });

  describe('closeWorkspaceTab()', () => {
    let element;
    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Calls removeRequest() on workspace', () => {
      const spy = sinon.spy(element.workspace, 'removeRequest');
      element.closeWorkspaceTab(1);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 1);
    });

    it('Casts argument to number', () => {
      const spy = sinon.spy(element.workspace, 'removeRequest');
      element.closeWorkspaceTab('1');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 1);
    });

    it('Ignores calls when not request page', () => {
      element.page = 'project';
      const spy = sinon.spy(element.workspace, 'removeRequest');
      element.closeWorkspaceTab(1);
      assert.isFalse(spy.called);
    });
  });

  describe('closeAllWorkspaceTabs()', () => {
    let element;
    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Calls clearWorkspace() on workspace', () => {
      const spy = sinon.spy(element.workspace, 'clearWorkspace');
      element.closeAllWorkspaceTabs();
      assert.isTrue(spy.called);
    });
  });

  describe('duplicateWorkspaceTab()', () => {
    let element;
    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Calls duplicateTab() on workspace', () => {
      const spy = sinon.spy(element.workspace, 'duplicateTab');
      element.duplicateWorkspaceTab(1);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 1);
    });

    it('Casts argument to number', () => {
      const spy = sinon.spy(element.workspace, 'duplicateTab');
      element.duplicateWorkspaceTab('1');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 1);
    });

    it('Ignores calls when not request page', () => {
      element.page = 'project';
      const spy = sinon.spy(element.workspace, 'duplicateTab');
      element.duplicateWorkspaceTab(1);
      assert.isFalse(spy.called);
    });
  });

  describe('closeOtherWorkspaceTabs()', () => {
    let element;
    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Calls removeRequest() on workspace for each active tab', () => {
      const spy = sinon.spy(element.workspace, 'removeRequest');
      element.closeOtherWorkspaceTabs(2);
      assert.isTrue(spy.called);
      assert.equal(spy.callCount, 3);
    });

    it('Leaves selected request', () => {
      const spy = sinon.spy(element.workspace, 'removeRequest');
      element.closeOtherWorkspaceTabs(2);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 3);
      assert.equal(spy.args[1][0], 1);
      assert.equal(spy.args[2][0], 0);
    });

    it('Sets selected on workspace', () => {
      element.closeOtherWorkspaceTabs(2);
      assert.equal(element.workspace.selected, 0);
    });
  });

  describe('newRequestTab()', () => {
    let element;
    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Calls addEmptyRequest() on workspace', () => {
      const spy = sinon.spy(element.workspace, 'addEmptyRequest');
      element.newRequestTab();
      assert.isTrue(spy.called);
    });

    it('Ignores calls when not request page', () => {
      element.page = 'project';
      const spy = sinon.spy(element.workspace, 'addEmptyRequest');
      element.newRequestTab();
      assert.isFalse(spy.called);
    });
  });

  describe('sendCurrentTab()', () => {
    let element;
    beforeEach(async () => {
      element = await requestFixture();
    });

    it('Calls addEmptyRequest() on workspace', () => {
      const spy = sinon.spy(element.workspace, 'sendCurrent');
      element.sendCurrentTab();
      assert.isTrue(spy.called);
    });

    it('Ignores calls when not request page', () => {
      element.page = 'project';
      const spy = sinon.spy(element.workspace, 'sendCurrent');
      element.sendCurrentTab();
      assert.isFalse(spy.called);
    });
  });

  describe('getTabsCount()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns size of requests array', () => {
      const result = element.getTabsCount();
      assert.equal(result, 4);
    });

    it('Returns 0 when no workspace', () => {
      element.workspace.activeRequests = undefined;
      const result = element.getTabsCount();
      assert.equal(result, 0);
    });

    it('Returns 0 when no activeRequests', () => {
      element.workspace.activeRequests = undefined;
      const result = element.getTabsCount();
      assert.equal(result, 0);
    });
  });

  describe('updateRequestTab()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls updateRequestObject() on workspace', () => {
      const spy = sinon.spy(element.workspace, 'updateRequestObject');
      const request = { test: true };
      element.updateRequestTab(request, 1);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], request);
      assert.equal(spy.args[0][1], 1);
    });

    it('Uses current selection when missing', () => {
      const spy = sinon.spy(element.workspace, 'updateRequestObject');
      const request = { test: true };
      element.workspace.selected = 1;
      element.updateRequestTab(request);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], request);
      assert.equal(spy.args[0][1], 1);
    });
  });

  describe('_dispatchNavigate()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches navigate event', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      const opts = { base: 'project' };
      element._dispatchNavigate(opts);
      assert.isTrue(spy.called);
    });

    it('Event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      const opts = { base: 'project' };
      element._dispatchNavigate(opts);
      assert.isTrue(spy.args[0][0].bubbles);
    });

    it('Event has detail object', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      const opts = { base: 'project' };
      element._dispatchNavigate(opts);
      assert.deepEqual(spy.args[0][0].detail, opts);
    });
  });

  describe('Navigation events and functions', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });
    [
      ['openCookieManager', 'cookie-manager'],
      ['openExchangeSearch', 'exchange-search'],
      ['openThemesPanel', 'themes-panel'],
      ['openAbout', 'about'],
      ['openDrivePicker', 'drive'],
      ['openSettings', 'settings'],
      ['openHostRules', 'hosts-rules'],
      ['openImport', 'data-import'],
      ['openExport', 'data-export'],
      ['openWebSocket', 'socket'],
      ['openSaved', 'saved'],
      ['openHistory', 'history']
    ].forEach((item) => {
      it(`${item[0]}() calls _dispatchNavigate() with an argument`, () => {
        const spy = sinon.spy(element, '_dispatchNavigate');
        element[item[0]]();
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0], {
          base: item[1]
        });
      });
    });

    it('openWorkspace() sets page', () => {
      element.openWorkspace();
      assert.equal(element.page, 'request');
    });
  });

  describe('_appVersionRequestHandler()', () => {
    it('Sets app version on the detail object', async () => {
      await customDimensionsFixture();
      const e = new CustomEvent('app-version', { bubbles: true, detail: {} });
      document.body.dispatchEvent(e);
      assert.equal(e.detail.version, '456');
    });
  });

  describe('_googleOauthTokenRequested()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _requestAuthToken()', () => {
      const spy = sinon.spy(element, '_requestAuthToken');
      const e = new CustomEvent('google-autorize', { bubbles: true, detail: {
        scope: 's1 s2 s3'
      } });
      document.body.dispatchEvent(e);
      assert.isTrue(spy.called);
    });

    it('Sets function arguments', () => {
      const spy = sinon.spy(element, '_requestAuthToken');
      const e = new CustomEvent('google-autorize', { bubbles: true, detail: {
        scope: 's1 s2 s3'
      } });
      document.body.dispatchEvent(e);
      assert.isTrue(spy.args[0][0]);
      assert.deepEqual(spy.args[0][1], ['s1', 's2', 's3']);
    });
  });

  describe('_inspectImportHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
      element.page = 'data-import';
      await nextFrame();
    });

    it('Imports the panel', async () => {
      await element._inspectImportHandler({ detail: {} });
      const instance = window.customElements.get('import-panel');
      assert.ok(instance);
    });

    it('Sets data on import panel', async () => {
      const data = { test: true };
      await element._inspectImportHandler({ detail: { data } });
      const node = element.shadowRoot.querySelector('import-panel');
      assert.deepEqual(node.data, data);
    });

    it('Sets selectedPage on import panel', async () => {
      const data = { test: true };
      await element._inspectImportHandler({ detail: { data } });
      const node = element.shadowRoot.querySelector('import-panel');
      assert.equal(node.selectedPage, 3);
    });
  });

  describe('#appMenuDisabled', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when no config', () => {
      assert.isFalse(element.appMenuDisabled);
    });

    it('returns true when menu disabled in config', () => {
      element.menuConfig = {
        menuDisabled: true
      };
      assert.isTrue(element.appMenuDisabled);
    });

    it('returns true when all menus are disabled', () => {
      element.menuConfig = {
        menuDisabled: false,
        hideHistory: true,
        hideSaved: true,
        hideProjects: true,
        hideApis: true
      };
      assert.isTrue(element.appMenuDisabled);
    });

    it('returns false when some menu is visible', () => {
      element.menuConfig = {
        menuDisabled: false,
        hideHistory: true,
        hideSaved: true,
        hideProjects: true,
        hideApis: false
      };
      assert.isFalse(element.appMenuDisabled);
    });
  });

  describe('#renderBackButton', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns true when page is not a request', () => {
      element.page = '';
      assert.isTrue(element.renderBackButton);
    });

    it('returns false when page is request', () => {
      element.page = 'request';
      assert.isFalse(element.renderBackButton);
    });
  });

  describe('#_oauth2redirectUri', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns default URI', () => {
      assert.equal(element._oauth2redirectUri, 'https://auth.advancedrestclient.com/oauth-popup.html');
    });

    it('returns configured URI', () => {
      element.config = {
        oauth2redirectUri: 'https://auth.com'
      };
      assert.equal(element._oauth2redirectUri, 'https://auth.com');
    });
  });

  describe('Variables overlay', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });

    it('sets _variablesOverlayOpened when button click', () => {
      const button = element.shadowRoot.querySelector('.var-info-button');
      MockInteractions.tap(button);
      assert.isTrue(element._variablesOverlayOpened);
    });

    it('closes the overlay when editor is requested', async () => {
      element._variablesOverlayOpened = true;
      await aTimeout();
      const node = element.shadowRoot.querySelector('variables-preview-overlay');
      node.dispatchEvent(new CustomEvent('open-variables-editor'));
      assert.isFalse(element._variablesOverlayOpened);
    });

    it('closes the overlay when close is requested', async () => {
      element._variablesOverlayOpened = true;
      await aTimeout();
      const node = element.shadowRoot.querySelector('variables-preview-overlay');
      node.dispatchEvent(new CustomEvent('overlay-closed'));
      assert.isFalse(element._variablesOverlayOpened);
    });

    it('opens the editor when requested', async () => {
      element._variablesOverlayOpened = true;
      await aTimeout();
      const node = element.shadowRoot.querySelector('variables-preview-overlay');
      node.dispatchEvent(new CustomEvent('open-variables-editor'));
      await customElements.whenDefined('variables-drawer-editor');
      await aTimeout();
      const editor = element.shadowRoot.querySelector('variables-drawer-editor');
      assert.isTrue(editor.opened);
    });
  });

  describe('Messages overlay', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
      element.newMessages = true;
      await nextFrame();
    });

    it('opens messages overlay via button click', async () => {
      const button = element.shadowRoot.querySelector('.nav-notification-button');
      MockInteractions.tap(button);
      assert.isTrue(element.messageCenterOpened);
    });

    it('calls read messages on the messaging service', async () => {
      const node = element.shadowRoot.querySelector('#msgService');
      const spy = sinon.spy(node, 'readMessages');
      element.openInfoCenter();
      assert.isTrue(spy.called);
    });

    it('mark messages read after a timeout', async () => {
      element._messagesReadTimeout = 1;
      const node = element.shadowRoot.querySelector('#msgService');
      const spy = sinon.spy(node, 'makrkAllRead');
      element.openInfoCenter();
      await aTimeout(1);
      assert.isTrue(spy.called);
    });
  });

  describe('#requestModel', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns a reference to a request-model', () => {
      const node = element.requestModel;
      assert.equal(node.localName, 'request-model');
    });
  });

  describe('#workspace', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns a reference to a workspace element', () => {
      const node = element.workspace;
      assert.equal(node.localName, 'arc-request-workspace');
    });
  });

  describe('initApplication()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls initSettings()', async () => {
      const spy = sinon.spy(element, 'initSettings');
      element.initApplication();
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('calls _requestAuthToken()', async () => {
      const spy = sinon.spy(element, '_requestAuthToken');
      element.initApplication();
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('sets page from hash', async () => {
      location.hash = '#socket'
      element.initApplication();
      assert.equal(element.page, 'socket');
    });
  });

  describe('_setupRequest()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });
    let request;
    before(async () => {
      const data = await DataGenerator.insertSavedRequestData({
        requestsSize: 1
      });
      request = data.requests[0];
    })

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    it('adds addRequestById() on the workspace', async () => {
      const node = element.workspace;
      const spy = sinon.spy(node, 'addRequestById');
      await element._setupRequest({
        type: 'saved',
        id: request._id
      });
      assert.isTrue(spy.called, 'function called');
      assert.equal(spy.args[0][0], 'saved', 'type argument is set');
      assert.equal(spy.args[0][1], request._id, 'id argument is set');
    });

    it('adds empty request when nop type', async () => {
      await element._setupRequest({
        type: 'new'
      });
      assert.deepEqual(element.workspace.activeRequests[4], {
        _id: 5
      });
    });
  });

  describe('Process notification', () => {
    const message = 'test-message';

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('opens a toast', () => {
      const toastId = 'test-id-1';
      element._processStartHandler({
        detail: {
          id: toastId,
          message
        }
      });
      const node = document.body.querySelector(`paper-toast[data-process-id="${toastId}"]`);
      assert.ok(node, 'toast is in the dom');
      assert.notEqual(node.duration, 0, 'toast has duration');
    });

    it('toast can be canceled', () => {
      const toastId = 'test-id-2';
      element._processStartHandler({
        detail: {
          id: toastId,
          message
        }
      });
      element._processStopHandler({
        detail: {
          id: toastId
        }
      });
      const node = document.body.querySelector(`paper-toast[data-process-id="${toastId}"]`);
      assert.isFalse(node.opened);
    });

    it('toast is canceled on error', async () => {
      const toastId = 'test-id-3';
      element._processStartHandler({
        detail: {
          id: toastId,
          message
        }
      });
      const node = document.body.querySelector(`paper-toast[data-process-id="${toastId}"]`);
      element._processErrorHandler({
        detail: {
          message: 'test'
        }
      });
      await aTimeout();
      assert.isFalse(node.opened);
    });
  });


  describe('openLicense()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });

    it('opens the license dialog', async () => {
      await element.openLicense();
      const node = element.shadowRoot.querySelector('arc-license-dialog');
      assert.isTrue(node.opened);
    });
  });

  describe('_backHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
      element.page = 'history';
      await nextFrame();
    });

    it('opens the workspace', async () => {
      const spy = sinon.spy(element, 'openWorkspace');
      const button = element.shadowRoot.querySelector('.app-back');
      MockInteractions.tap(button);
      assert.isTrue(spy.called);
    });
  });

  describe('openWorkspaceDetails()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });

    it('calls openWorkspaceDetails on the workspace', async () => {
      const spy = sinon.spy(element.workspace, 'openWorkspaceDetails');
      element.openWorkspaceDetails();
      element.workspace.openWorkspaceDetails.restore();
      assert.isTrue(spy.called);
    });

    it('sets page to request', async () => {
      element.page = 'about';
      element.openWorkspaceDetails();
      assert.equal(element.page, 'request');
    });
  });

  describe('closeActiveTab()', () => {
    let element;
    beforeEach(async () => {
      element = await componentFixture();
    });

    it('calls closeActiveTab on the workspace', async () => {
      const spy = sinon.spy(element.workspace, 'closeActiveTab');
      element.closeActiveTab();
      element.workspace.closeActiveTab.restore();
      assert.isTrue(spy.called);
    });
  });

  describe('Encryption options', () => {
    it('sets encryption flag on history panel', async () => {
      const element = await exportEncryptFixture();
      await element._pageChanged('history');
      element.page = 'history';
      await aTimeout();
      const node = element.shadowRoot.querySelector('history-panel');
      assert.isTrue(node.withEncrypt);
    });

    it('sets encryption flag on saved requests panel', async () => {
      const element = await exportEncryptFixture();
      await element._pageChanged('saved');
      element.page = 'saved';
      await aTimeout();
      const node = element.shadowRoot.querySelector('saved-requests-panel');
      assert.isTrue(node.withEncrypt);
    });

    it('sets encryption flag on project details panel', async () => {
      const element = await exportEncryptFixture();
      await element._pageChanged('project');
      element.page = 'project';
      element.routeParams = { id: 'test' };
      await aTimeout();
      const node = element.shadowRoot.querySelector('project-details');
      assert.isTrue(node.withEncrypt);
    });

    it('sets encryption flag on project details panel', async () => {
      const element = await exportEncryptFixture();
      await element._pageChanged('cookie-manager');
      element.page = 'cookie-manager';
      await aTimeout();
      const node = element.shadowRoot.querySelector('cookie-manager');
      assert.isTrue(node.withEncrypt);
    });

    it('sets encryption flag on project details panel', async () => {
      const element = await exportEncryptFixture();
      await element._pageChanged('data-export');
      element.page = 'data-export';
      await aTimeout();
      const node = element.shadowRoot.querySelector('export-panel');
      assert.isTrue(node.withEncrypt);
    });
  });
});
