// rollup.config.js
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve' // 可以使用第三方插件
import postcss from 'rollup-plugin-postcss'
import nested from 'postcss-nested'; // css嵌套处理
import commonjs from '@rollup/plugin-commonjs'
// import { eslint } from "rollup-plugin-eslint";

export default {
    input: './src/index.js',
    output: {
        file: './build/bundle.js',
        format: 'cjs'
    },
    plugins: [
        babel(),
        resolve(),
        postcss(
            {
                // extract: 'styles/min.css',
                // inject: false,
                // minimize: {
                //     safe: true,
                // },
                plugins: [nested()],
                extensions: ['.pcss', '.css'],
            }
        ),
        commonjs({ include: /node_modules/ }),
        // eslint({
        //     /* your options */
        // })
    ],
    external: ['react', 'styled-components', '@ant-design/icons', 'react-router-dom'],
    // global:{
    //     'jquery':'$' //告诉rollup 全局变量$即是jquery
    // }
};