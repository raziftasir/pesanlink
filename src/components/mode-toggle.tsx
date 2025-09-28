'use client';
import { useTheme } from './theme-provider';

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="px-3 py-2 rounded-2xl border"
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
