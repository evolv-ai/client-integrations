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
        { file: "dist/evolv-exp-acc-dl.js", format: "iife", name: "EvolvDL" },
        { file: "dist/evolv-exp-acc-dl.min.js", format: "iife", name: "EvolvDL", plugins: [terser({
                    output: {
                        comments: false,
                    }
        }
        )]}
    ]
};
