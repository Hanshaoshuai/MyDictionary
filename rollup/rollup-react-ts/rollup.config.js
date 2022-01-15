// rollup.config.js
// import { DEFAULT_EXTENSIONS } from '@babel/core';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve' // 可以使用第三方插件
import postcss from 'rollup-plugin-postcss'
// import typescript from '@rollup/plugin-typescript'
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs'
// import { terser } from 'rollup-plugin-terser' // 代码压缩
import tslint from "rollup-plugin-tslint";
// import {stylelint} from 'stylelint-config-standard'
import nested from 'postcss-nested'; // css嵌套处理

export default {
    input: './src/index.js',
    output: {
        file: './build/bundle.js',
        format: 'cjs'
    },
    plugins: [
        babel({}),
        resolve(),
        // stylelint(),
        postcss({
            // extract: 'styles/min.css',
            // inject: false,
            // minimize: {
            //     safe: true,
            // },
            plugins: [nested()],
            extensions: ['.pcss', '.css'],
        }),
        tslint({
            throwOnError: true,
            throwOnWarning: true,
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            exclude: ['node_modules/**', '*.js', '*.scss', '*.css'],
        }),
        typescript(),
        commonjs({ include: /node_modules/ }),
        // terser(),

    ],
    external: ['react', 'react-dom', 'styled-components', '@ant-design/icons'],
    // global:{
    //     'jquery':'$' //告诉rollup 全局变量$即是jquery
    // }
};