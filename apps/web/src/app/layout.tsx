import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'LogPulse | SOC Command Center',
  description: 'Universal Log Pre-processing & Stream Anomaly Detection Platform'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

