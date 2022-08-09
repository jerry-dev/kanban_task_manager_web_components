import { importAssertionsPlugin } from 'rollup-plugin-import-assert';
import { importAssertions } from 'acorn-import-assertions';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import modify from 'rollup-plugin-modify';

const devMode = (process.env.NODE_ENV === 'development');
console.log(`${ (devMode) ? 'development' : 'production' } mode bundle`);

export default [
	{
		input: './src/main.js',
		
		watch: {
			include: './src/**',
			clearScreen:  false
		},
		plugins: [
			replace({
				values: {
					"../src/assets": "./dist/assets"
				}
			})
		],
		output: {
			file: './dist/bundle.js',
			format: 'es',
			sourcemap:  (devMode) ? 'inline' : false,
			plugins: [
				terser({
					ecma: 2020,
					mangle: { toplevel: true },
					compress: {
						module: true,
						toplevel: true,
						unsafe_arrows: true,
						drop_console: !devMode,
						drop_debugger: !devMode
					},
					output: { quote_style: 1 }
				})
			]
		},
		acornInjectPlugins: [ importAssertions ],
		plugins: [ importAssertionsPlugin() ]
	}
];