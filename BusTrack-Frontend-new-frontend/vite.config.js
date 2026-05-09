import { fileURLToPath, URL } from 'node:url'

// javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 1. IMPORTA EL MÓDULO 'path'
import path from 'path';

export default defineConfig(async ({ mode }) => {
    const plugins = [vue()];

    if (mode === 'development') {
        try {
            const mod = await import('vite-plugin-vue-devtools');
            const devtools = mod?.default ?? mod;
            if (typeof devtools === 'function') plugins.push(devtools());
        } catch (err) {
            // Si no está instalado, solo mostrar advertencia y seguir
            // para no romper el servidor de desarrollo.
            console.warn('Advertencia: vite-plugin-vue-devtools no encontrado. Ejecuta `npm i -D vite-plugin-vue-devtools` si lo necesitas.');
        }
    }

    // El objeto que retornas ahora debe incluir también la clave 'resolve'
    return {
        plugins,
        // 2. AÑADE ESTA SECCIÓN PARA EL ALIAS
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        }
    };
});