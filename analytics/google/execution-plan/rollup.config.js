import { terser } from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript2';

export default {
    input: "./src/GAClient.ts",
    plugins: [
        typescript({
            tsconfig: "tsconfig.json"
        })
    ],
    output: [
        { file: "dist/evolv-exec-plan-ga.js", format: "iife", name: "Evolv" },
        { file: "dist/evolv-exec-plan-ga.min.js", format: "iife", name: "Evolv", plugins: [terser()] }
    ]
};
