// rollup.config.js

/**
 * Copyright (c) Tom Weatherhead. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in
 * the LICENSE file in the root directory of this source tree.
 */

'use strict';

// import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
// import commonjs from 'rollup-plugin-commonjs';

export default {
	input: './dist/lib/main.js',
	output: [
		{
			// Create a CommonJS version for Node.js
			file: 'dist/thaw-mongodb-client-direct.cjs.js',
			format: 'cjs',
			exports: 'named',
			globals: { mongodb: 'mongodb' }
		},
		{
			// Create an ESModule version
			file: 'dist/thaw-mongodb-client-direct.esm.js',
			format: 'es',
			esModule: true,
			compact: true,
			globals: { mongodb: 'mongodb' },
			plugins: [terser()]
		}
		// ,
		// { // Commented out this block. We don't want a browser version of this lib.
		// 	// Create a version that can run in Web browsers
		// 	file: 'dist/thaw-mongodb-client-direct.js',
		// 	name: 'thaw-mongodb-client-direct',
		// 	format: 'umd',
		// 	compact: true,
		// 	// globals: { uuid: 'uuid' },
		// 	plugins: [terser()]
		// }
	],
	context: 'this',
	external: ['mongodb'],
	plugins: [
		nodeResolve({ preferBuiltins: true }) // ,
		// json(),
		// commonjs({ include: [
		// 	'node_modules/mongodb/**',
		// 	'node_modules/mongodb-connection-string-url/**'
		// ]})
	]
};
