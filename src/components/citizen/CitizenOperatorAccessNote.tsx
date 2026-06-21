'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

/** Enlace discreto al panel de gestión (solo operadores / autoridades). */
export function CitizenOperatorAccessNote() {
  return (
    <aside className="citizen-operator-note" aria-label="Acceso para operadores">
      <Shield size={16} aria-hidden="true" />
      <p>
        ¿Eres operador o autoridad?{' '}
        <Link href="/login?next=/dashboard/emergency">Accede al panel de gestión</Link> para
        administrar donaciones, inventario y centros de acopio.
      </p>
    </aside>
  );
}
