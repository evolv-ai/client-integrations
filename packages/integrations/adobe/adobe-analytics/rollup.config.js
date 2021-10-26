import commonJs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';


const configFactory = (module, iife) => {
	const format = (module) ? 'esm' : ((iife) ? 'iife' : 'cjs');
	const ext = (module) ? 'mjs' : ((iife) ? 'browser.js' : 'js');

	const lib = module
		? ['esnext', 'dom', 'dom.iterable', 'es2020.promise']
		: ['es5', 'dom'];

	return {
		input: './src/index.ts',
		plugins: [
			nodeResolve({
				browser: true,
				mainFields: module ? ['module'] : ['main']
			}),
			commonJs(),
			typescript({
				tsconfig: 'tsconfig.json',
				tsconfigOverride: {
					compilerOptions: {
						target: module ? 'es2020' : 'es5',
						lib
					}
				}
			})
		],
		output: {
			file: `dist/index.${ext}`,
			format,
			name: 'AdobeAnalytics'
		}
	}
};

export default [
	configFactory(true),
	configFactory(false),
	configFactory(false, true)
];
