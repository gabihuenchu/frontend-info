'use client';

import {
  Apple,
  BedDouble,
  Shirt,
  SprayCan,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useCatalogItems } from '@/hooks/useCatalogItems';
import {
  DONATION_CATEGORIES,
  type DonationCategoryId,
} from '@/lib/donationCategories';
import type { ItemCatalogo } from '@/types/catalog';

const CATEGORY_ICONS: Record<DonationCategoryId, LucideIcon> = {
  alimentos: Apple,
  vestuario: Shirt,
  herramientas: Wrench,
  'utiles-aseo': SprayCan,
  'alojamiento-enseres': BedDouble,
};

export type SelectedDonationLine = {
  itemId: string;
  cantidad: number;
  nombre: string;
  unidadMedida: string;
  categoriaLabel: string;
};

interface DonationCategoryPickerProps {
  activeCategory: DonationCategoryId;
  onCategoryChange: (id: DonationCategoryId) => void;
  selected: Record<string, SelectedDonationLine>;
  onSelectedChange: (next: Record<string, SelectedDonationLine>) => void;
  /** itemId → cantidad máxima que acepta el centro */
  quotas?: Record<string, number>;
  quotasLoading?: boolean;
  centroSelected?: boolean;
}

export function DonationCategoryPicker({
  activeCategory,
  onCategoryChange,
  selected,
  onSelectedChange,
  quotas,
  quotasLoading = false,
  centroSelected = true,
}: DonationCategoryPickerProps) {
  const categoryConfig = DONATION_CATEGORIES.find((c) => c.id === activeCategory)!;
  const { data: items, isLoading, isError } = useCatalogItems(categoryConfig.apiCategoria);

  const toggleItem = (item: ItemCatalogo) => {
    const maxQty = quotas?.[item.id];
    if (centroSelected && (maxQty == null || maxQty <= 0)) return;

    const next = { ...selected };
    if (next[item.id]) {
      delete next[item.id];
    } else {
      next[item.id] = {
        itemId: item.id,
        cantidad: 1,
        nombre: item.nombre,
        unidadMedida: item.unidadMedida,
        categoriaLabel: categoryConfig.label,
      };
    }
    onSelectedChange(next);
  };

  const updateQty = (itemId: string, cantidad: number) => {
    const line = selected[itemId];
    if (!line) return;
    const maxQty = quotas?.[itemId];
    const capped =
      maxQty != null && maxQty > 0
        ? Math.min(Math.max(1, cantidad), maxQty)
        : Math.max(1, cantidad);
    onSelectedChange({
      ...selected,
      [itemId]: { ...line, cantidad: capped },
    });
  };

  const getMaxForItem = (itemId: string) => quotas?.[itemId];

  return (
    <div className="donation-category-picker">
      <div className="donation-category-tabs" role="tablist" aria-label="Categorías de donación">
        {DONATION_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          const count = Object.values(selected).filter(
            (line) => line.categoriaLabel === cat.label
          ).length;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`donation-category-tab${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{cat.label}</span>
              {count > 0 && <span className="donation-category-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="donation-category-panel" role="tabpanel">
        <p className="citizen-subtitle" style={{ marginBottom: '1rem' }}>
          {categoryConfig.description}
        </p>

        {centroSelected && quotasLoading && (
          <div className="citizen-loading">Consultando necesidades del centro…</div>
        )}

        {centroSelected && !quotasLoading && quotas && Object.keys(quotas).length === 0 && (
          <div className="citizen-empty">
            Este centro no tiene ítems pendientes de donación en este momento.
          </div>
        )}

        {!centroSelected && (
          <div className="citizen-empty">Selecciona un centro de acopio para ver qué ítems acepta.</div>
        )}

        {isLoading && <div className="citizen-loading">Cargando ítems del catálogo…</div>}

        {isError && (
          <div className="citizen-error" role="alert">
            No se pudo cargar el catálogo. Verifica que ms-resources esté activo.
          </div>
        )}

        {!isLoading && !isError && (items ?? []).length === 0 && (
          <div className="citizen-empty">No hay ítems disponibles en esta categoría.</div>
        )}

        {!isLoading && !isError && centroSelected && !quotasLoading && (items ?? []).length > 0 && (
          <div className="citizen-list">
            {(items ?? []).map((item) => {
              const line = selected[item.id];
              const isSelected = Boolean(line);
              const maxQty = getMaxForItem(item.id);
              const canDonate = maxQty != null && maxQty > 0;
              return (
                <div
                  key={item.id}
                  className={`citizen-list-item${isSelected ? ' selected' : ''}${!canDonate ? ' disabled' : ''}`}
                  style={{ cursor: 'default', opacity: canDonate ? 1 : 0.55 }}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item)}
                    disabled={!canDonate}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: canDonate ? 'pointer' : 'not-allowed',
                      padding: 0,
                    }}
                  >
                    <strong>{item.nombre}</strong>
                    <p className="citizen-card-meta">
                      {item.descripcion ?? 'Sin descripción'} · {item.unidadMedida}
                      {centroSelected && maxQty != null && maxQty > 0 && (
                        <> · Acepta hasta {maxQty}</>
                      )}
                      {centroSelected && (maxQty == null || maxQty <= 0) && (
                        <> · No requerido en este centro</>
                      )}
                    </p>
                  </button>
                  {isSelected && line && canDonate && maxQty != null && (
                    <input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={line.cantidad}
                      className="citizen-qty-input"
                      aria-label={`Cantidad de ${item.nombre}`}
                      onChange={(e) => updateQty(item.id, Number(e.target.value))}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function getSelectedDonationItems(
  selected: Record<string, SelectedDonationLine>
): { itemId: string; cantidad: number }[] {
  return Object.values(selected).map(({ itemId, cantidad }) => ({ itemId, cantidad }));
}
