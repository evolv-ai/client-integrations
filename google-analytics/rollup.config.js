import { terser } from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript2';

export default {
    input: "./src/index.ts",
    plugins: [
        typescript({
            tsconfig: "tsconfig.json"
        })
    ],
    output: [
        { file: "dist/exec-ga.js", format: "iife", name: "Evolv" },
        { file: "dist/exec-ga.min.js", format: "iife", name: "Evolv", plugins: [terser()] }
    ]
};
