import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isProduction = process.env.NODE_ENV === 'production';
const isSelfHosted = process.env.SELF_HOSTED === 'true';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: isSelfHosted
      ? adapterNode({
          out: 'build',
          precompress: true
        })
      : adapterStatic({
          pages: 'build',
          assets: 'build',
          fallback: '404.html',
          strict: false
        }),
    paths: {
      base: isProduction && !isSelfHosted ? '/emuhub' : ''
    }
  }
};

export default config;
