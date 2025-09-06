import React from 'react';
export const metadata = {
  title: 'Todo App',
  description: 'Simple todo app with WebSocket backend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', margin: 0 }}>
        <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
          <h1>Todo App</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
