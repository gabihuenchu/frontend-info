'use client';

import {
  ClipboardList,
  HandHeart,
  MapPin,
  Package,
  type LucideIcon,
} from 'lucide-react';

type GuideVariant = 'default' | 'compact';

interface DonationStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

const DONATION_STEPS: DonationStep[] = [
  {
    icon: ClipboardList,
    title: 'Revisa qué se necesita',
    description:
      'Consulta las necesidades activas y los tipos de insumos que aceptamos en cada categoría.',
  },
  {
    icon: Package,
    title: 'Prepara tus insumos',
    description:
      'Reúne los artículos en buen estado. No necesitas registrarte ni agendar una cita.',
  },
  {
    icon: MapPin,
    title: 'Acércate a una sucursal',
    description:
      'Ve al centro de acopio más cercano dentro del horario de atención publicado.',
  },
  {
    icon: HandHeart,
    title: 'Entrega en recepción',
    description:
      'Nuestro equipo te recibirá y te guiará en el proceso. Tu ayuda es invaluable.',
  },
];

interface DonationStepsGuideProps {
  variant?: GuideVariant;
  className?: string;
  id?: string;
}

export function DonationStepsGuide({
  variant = 'default',
  className = '',
  id = 'como-donar',
}: DonationStepsGuideProps) {
  return (
    <section
      id={id}
      className={`citizen-steps-guide citizen-steps-guide--${variant}${className ? ` ${className}` : ''}`}
      aria-labelledby="donation-steps-title"
    >
      <div className="citizen-steps-guide__header">
        <h2 id="donation-steps-title" className="citizen-steps-guide__title">
          ¿Cómo donar?
        </h2>
        <p className="citizen-steps-guide__intro">
          Es muy sencillo. Solo acércate a cualquiera de nuestras sucursales con los insumos que
          desees donar. No necesitas registrarte ni agendar una cita: nuestro equipo te recibirá
          en el lugar y te guiará en el proceso.
        </p>
      </div>

      <ol className="citizen-steps-guide__list">
        {DONATION_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="citizen-steps-guide__item">
              <div className="citizen-steps-guide__marker" aria-hidden="true">
                <span className="citizen-steps-guide__num">{index + 1}</span>
                <span className="citizen-steps-guide__icon-wrap">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
              </div>
              <div className="citizen-steps-guide__content">
                <strong className="citizen-steps-guide__step-title">{step.title}</strong>
                <p className="citizen-steps-guide__step-desc">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
