[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/arc-app-mixin.svg)](https://www.npmjs.com/package/@advanced-rest-client/arc-app-mixin)
[![Build Status](https://travis-ci.org/advanced-rest-client/api-url-data-model.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/arc-app-mixin)

# arc-app-mixin

Advanced REST Client main application mixin to be shared between different versions of ARC (web, electron, chrome).

## Usage

### Installation
```
npm install --save @advanced-rest-client/arc-app-mixin
```

### In a LitElement

```javascript
import { LitElement, html } from 'lit-element';
import { ArcAppMixin } from  '@advanced-rest-client/arc-app-mixin/arc-app-mixin.js';

class SampleElement extends ArcAppMixin(LitElement) {
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/arc-app-mixin
cd arc-app-mixin
npm install
```

### Running the tests
```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
