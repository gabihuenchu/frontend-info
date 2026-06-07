'use client';

import { ArrowLeftRight, Target, Users, Warehouse } from 'lucide-react';
import type { KpiLogistica } from '@/types/logistics';

interface LogisticsKpiCardsProps {
  kpis: KpiLogistica;
}

export default function LogisticsKpiCards({ kpis }: LogisticsKpiCardsProps) {
  const cards = [
    {
      label: 'Transferencias en curso',
      value: kpis.transferenciasEnCurso,
      trend: `↑ ${kpis.transferenciasDelta} desde ayer`,
      trendClass: 'logistics-kpi-card__trend--up',
      icon: <ArrowLeftRight size={20} />,
      iconClass: 'logistics-kpi-card__icon--orange',
    },
    {
      label: 'Misiones activas',
      value: kpis.misionesActivas,
      trend: `↑ ${kpis.misionesDelta} desde ayer`,
      trendClass: 'logistics-kpi-card__trend--up',
      icon: <Target size={20} />,
      iconClass: 'logistics-kpi-card__icon--blue',
    },
    {
      label: 'Voluntarios disponibles',
      value: kpis.voluntariosDisponibles,
      trend: '● En línea',
      trendClass: 'logistics-kpi-card__trend--online',
      icon: <Users size={20} />,
      iconClass: 'logistics-kpi-card__icon--green',
    },
    {
      label: 'Centros de acopio operativos',
      value: kpis.centrosOperativos,
      trend: `↑ ${kpis.centrosDelta} desde ayer`,
      trendClass: 'logistics-kpi-card__trend--up',
      icon: <Warehouse size={20} />,
      iconClass: 'logistics-kpi-card__icon--orange',
    },
  ];

  return (
    <div className="logistics-kpi-grid">
      {cards.map((c) => (
        <div key={c.label} className="logistics-kpi-card">
          <div className={`logistics-kpi-card__icon ${c.iconClass}`}>{c.icon}</div>
          <div>
            <div className="logistics-kpi-card__label">{c.label}</div>
            <div className="logistics-kpi-card__value">{c.value}</div>
            <div className={`logistics-kpi-card__trend ${c.trendClass}`}>{c.trend}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
