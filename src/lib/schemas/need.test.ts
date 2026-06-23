import { describe, it, expect } from 'vitest';
import { createNeedSchema } from './need';

const UUID_VALIDO = '123e4567-e89b-12d3-a456-426614174000';

const necesidadValida = {
  centroId: UUID_VALIDO,
  itemId: UUID_VALIDO,
  cantidadNecesaria: 10,
  prioridad: 'ALTO' as const,
};

describe('createNeedSchema', () => {
  it('acepta una necesidad válida sin emergenciaId', () => {
    expect(createNeedSchema.safeParse(necesidadValida).success).toBe(true);
  });

  it('acepta emergenciaId como UUID válido', () => {
    const resultado = createNeedSchema.safeParse({ ...necesidadValida, emergenciaId: UUID_VALIDO });
    expect(resultado.success).toBe(true);
  });

  it('acepta emergenciaId nulo', () => {
    const resultado = createNeedSchema.safeParse({ ...necesidadValida, emergenciaId: null });
    expect(resultado.success).toBe(true);
  });

  it('rechaza una prioridad fuera del enum', () => {
    const resultado = createNeedSchema.safeParse({ ...necesidadValida, prioridad: 'URGENTE' });
    expect(resultado.success).toBe(false);
  });

  it.each(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])('acepta la prioridad %s', (prioridad) => {
    const resultado = createNeedSchema.safeParse({ ...necesidadValida, prioridad });
    expect(resultado.success).toBe(true);
  });

  it('rechaza cantidad menor a 1', () => {
    const resultado = createNeedSchema.safeParse({ ...necesidadValida, cantidadNecesaria: 0 });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('La cantidad mínima es 1');
    }
  });

  it('rechaza un centroId inválido', () => {
    const resultado = createNeedSchema.safeParse({ ...necesidadValida, centroId: 'x' });
    expect(resultado.success).toBe(false);
  });
});
