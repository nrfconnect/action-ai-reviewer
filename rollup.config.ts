import esbuild from 'rollup-plugin-esbuild';
import { defineConfig } from 'rollup';
// import commonjs from '@rollup/plugin-commonjs';
// import nodeResolve from '@rollup/plugin-node-resolve';

export default defineConfig([
  {
    input: 'src/bot.ts',
    output: {
      dir: 'dist/lib/',
      format: 'esm',
      inlineDynamicImports: false,
    },
    plugins: [esbuild({ include: 'src/*.ts' })],
  },
]);
