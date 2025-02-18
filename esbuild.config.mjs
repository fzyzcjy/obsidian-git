import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import autoPreprocess from "svelte-preprocess";
import process from "process";

const banner =
    `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source visit the plugins github repository (https://github.com/denolehov/obsidian-git)
*/
`;

const prod = (process.argv[2] === 'production');

esbuild.build({
    banner: {
        js: banner,
    },
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: ['obsidian', 'electron','child_process','fs','path'],
    format: 'cjs',
    watch: !prod,
    target: 'es2018',
    logLevel: "info",
    sourcemap: prod ? false : 'inline',
    treeShaking: true,
    platform: 'browser',
    plugins: [
        sveltePlugin({
            compileOptions: {
                css: true,
                dev: !prod,
            },
            preprocess: autoPreprocess(),
        }),
    ],
    inject:  ["polyfill_buffer.js"],
    outfile: 'main.js',
}).catch(() => process.exit(1));