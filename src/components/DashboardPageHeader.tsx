'use client';

import type { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export default function DashboardPageHeader({ title, subtitle, extra }: DashboardPageHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <h1 className="header-title">{title}</h1>
        {subtitle ? <p className="header-subtitle">{subtitle}</p> : null}
      </div>
      {extra ? <div className="header-controls">{extra}</div> : null}
    </header>
  );
}
