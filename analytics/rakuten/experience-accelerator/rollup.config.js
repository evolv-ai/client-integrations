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
        { file: "dist/evolv-exp-acc-rat.js", format: "iife", name: "Evolv" },
        { file: "dist/evolv-exp-acc-rat.min.js", format: "iife", name: "Evolv", plugins: [terser({
                    output: {
                        comments: false,
                    }
        }
        )]}
    ]
};
