import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Evita inicializar Firebase real durante los tests.
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => null),
}));

vi.mock('@/services/firebaseClient', () => ({
  getFirebaseAuthClient: vi.fn(() => null),
}));

// Mock de navegación de Next.js para componentes que usan el router.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
