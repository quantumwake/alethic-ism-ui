// @ts-check
/** @type {() => import('vite').Plugin} */
export default function htmlEnvPlugin() {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      // Replace %VITE_BASE_PATH% with the actual value
      const basePath = process.env.VITE_BASE_PATH || '/ui';
      return html.replace(/%VITE_BASE_PATH%/g, basePath);
    },
  };
}