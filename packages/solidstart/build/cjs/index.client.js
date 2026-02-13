Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const solid = require('@sentry/solid');
const sdk = require('./client/sdk.js');



exports.init = sdk.init;
Object.prototype.hasOwnProperty.call(solid, '__proto__') &&
	!Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
	Object.defineProperty(exports, '__proto__', {
		enumerable: true,
		value: solid['__proto__']
	});

Object.keys(solid).forEach(k => {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = solid[k];
});
//# sourceMappingURL=index.client.js.map
