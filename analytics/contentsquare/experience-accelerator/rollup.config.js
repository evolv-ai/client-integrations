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
        { file: "dist/evolv-exp-acc-cs.js", format: "iife", name: "EvolvContentSquare" },
        { file: "dist/evolv-exp-acc-cs.min.js", format: "iife", name: "EvolvContentSquare", plugins: [terser({
                    output: {
                        comments: false,
                    }
        }
        )]}
    ]
};
