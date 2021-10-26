import commonJs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';


const configFactory = (module) => {
	const format = (module) ? 'esm' : 'cjs';
	const ext = (module) ? 'mjs' : 'js';

	const lib = module
		? ['esnext', 'dom', 'dom.iterable', 'es2020.promise']
		: ['es5', 'dom'];

	return {
		input: './src/index.ts',
		plugins: [
			nodeResolve({
				browser: true
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
			format
		}
	}
};

export default [
	configFactory(true),
	configFactory(false)
];
