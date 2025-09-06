import React from 'react';
import './globals.css';
import { ThemeToggle } from './theme-toggle';

export const metadata = {
  title: 'Todo App',
  description: 'Simple todo app with WebSocket backend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const savedTheme = localStorage.getItem('theme');
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              const theme = savedTheme || systemTheme;
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          `
        }} />
      </head>
      <body>
        <div className="min-h-screen bg-background">
          <main className="container mx-auto max-w-4xl p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-foreground">Todo App</h1>
              <ThemeToggle />
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
