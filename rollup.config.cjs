import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import json from "@rollup/plugin-json";
import nodePolyfills from "rollup-plugin-polyfill-node";

const packageJson = require("./package.json");

export default {
  input: "src/index.js",
  output: [
    {
      file: `${packageJson.umd}/lucia-sdk-latest.min.js`,
      format: "umd",
      name: "LuciaSDK",
      globals:{}
    },
  ],
  plugins: [
    peerDepsExternal(),
    commonjs(),
    resolve(),
    nodePolyfills(),
    terser(),
    json(),
  ],
};
