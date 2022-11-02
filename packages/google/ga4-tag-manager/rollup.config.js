import commonJs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';


const configFactory = (module, iife) => {
	const lib = module
		? ['esnext', 'dom', 'dom.iterable', 'es2020.promise']
		: ['es5', 'dom'];
	let format;
	let ext;

	if (module) {
		format = 'esm';
		ext = 'mjs';
	} else if (iife) {
		format = 'iife';
		ext = 'browser.js';
	} else {
		format = 'cjs';
		ext = 'js';
	}

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
			name: 'GoogleAnalytics'
		}
	}
};

export default [
	configFactory(true),
	configFactory(false),
	configFactory(false, true)
];
