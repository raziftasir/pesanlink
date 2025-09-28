'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const Ctx = createContext<{theme:Theme; setTheme:(t:Theme)=>void}>({theme:'dark', setTheme:()=>{}});
export function ThemeProvider({ children }:{children:React.ReactNode}) {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    const t = (localStorage.getItem('pl_theme') as Theme) || 'dark';
    setTheme(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, []);
  useEffect(() => {
    localStorage.setItem('pl_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return <Ctx.Provider value={{theme, setTheme}}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
