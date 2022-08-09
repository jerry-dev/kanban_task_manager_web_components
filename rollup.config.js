import { importAssertionsPlugin } from 'rollup-plugin-import-assert';
import { importAssertions } from 'acorn-import-assertions';
import { terser } from 'rollup-plugin-terser';
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
		plugins: [
			importAssertionsPlugin(),
			modify({
				'./src/assets/': './assets/',
				'../../src/assets/': './assets/'
			})
		],
	}
];