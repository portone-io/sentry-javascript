Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const solidrouter = require('@sentry/solid/solidrouter');



Object.prototype.hasOwnProperty.call(solidrouter, '__proto__') &&
	!Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
	Object.defineProperty(exports, '__proto__', {
		enumerable: true,
		value: solidrouter['__proto__']
	});

Object.keys(solidrouter).forEach(k => {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = solidrouter[k];
});
//# sourceMappingURL=solidrouter.js.map
