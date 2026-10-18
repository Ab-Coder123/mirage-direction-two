import * as React from 'react';

/**
 * Blocking inline script to apply theme before DOM renders,
 * preventing Flash of Unstyled Content (FOUC).
 */
export function ThemeScript() {
  const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('mirage-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    var d = document.documentElement;
    if (isDark) {
      d.classList.add('dark');
      d.setAttribute('data-theme', 'dark');
    } else {
      d.classList.remove('dark');
      d.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
