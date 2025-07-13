import React from 'react';

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-50">
      {children}
    </main>
  );
}
