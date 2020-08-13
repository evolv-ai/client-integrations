import { terser } from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript2';

export default {
    input: "./src/AAClient.ts",
    plugins: [
        typescript({
            tsconfig: "tsconfig.json"
        })
    ],
    output: [
        { file: "dist/evolv-exp-acc-aa.js", format: "iife", name: "Evolv" },
        { file: "dist/evolv-exp-acc-aa.min.js", format: "iife", name: "Evolv", plugins: [terser()] }
    ]
};
