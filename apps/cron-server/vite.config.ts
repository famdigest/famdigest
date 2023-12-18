// vite.config.ts
import EnvironmentPlugin from "vite-plugin-environment"; // Here we import the plugin that expose env variable when vite bundle up the app

const config = {
  root: "./src",

  // Here you can define which env to expose with prefix params
  // i.e.: EnvironmentPlugin('all', {prefix: 'test'}) => test_env_var == true, env_var == false
  plugins: [EnvironmentPlugin("all", { prefix: "" })],
};

export default config;
// lol
// nice
// we make the earth flat
// what do you think of that
