import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    site: 'https://daniele-bolla.github.io',
    base: '/math-applets',
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [react(), mdx(), tailwindcss()],
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
    }
});
