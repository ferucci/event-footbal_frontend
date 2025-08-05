
import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.base.config';
import devConfig from './vite.dev.config';
import prodConfig from './vite.prod.config';

export default defineConfig(({ command }) => {
  return mergeConfig(
    baseConfig,
    command === 'build' ? prodConfig : devConfig
  );
});

