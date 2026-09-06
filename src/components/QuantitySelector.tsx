'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/types';
import { calculatePrice, formatGrams, formatMl, getQuantityOptions } from '@/lib/pricing';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  product: Product;
  onChange: (selection: {
    label: string;
    grams?: number;
    pieces?: number;
    variantId?: string;
    price: number;
  }) => void;
}

/**
 * Handles all four selling types:
 *  - weight / volume: preset chips (100g..2kg) + custom gram/ml input, live price
 *  - piece: simple [-] count [+] stepper
 *  - fixed_pack: pick one of the admin-defined variants
 */
export default function QuantitySelector({ product, onChange }: Props) {
  const { t } = useLanguage();
  const options = useMemo(() => getQuantityOptions(product), [product]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customGrams, setCustomGrams] = useState<string>('');
  const [pieceCount, setPieceCount] = useState(1);
  const [useCustom, setUseCustom] = useState(false);

  const isWeightOrVolume = product.sellingType === 'weight' || product.sellingType === 'volume';
  const unitWord = product.sellingType === 'volume' ? 'ml' : 'g';

  function emit(grams?: number, pieces?: number, variantId?: string, label?: string) {
    const price = calculatePrice(product, { grams, pieces, variantId });
    const finalLabel =
      label ||
      (grams !== undefined
        ? product.sellingType === 'volume'
          ? formatMl(grams)
          : formatGrams(grams)
        : pieces !== undefined
        ? `${pieces} pc${pieces > 1 ? 's' : ''}`
        : '');
    onChange({ label: finalLabel, grams, pieces, variantId, price });
  }

  // Emit a sensible default selection as soon as the product loads, so the
  // Add to Cart / Buy Now buttons aren't stuck disabled until the user taps something.
  useEffect(() => {
    if (product.sellingType === 'piece') {
      emit(undefined, 1);
    } else if (product.sellingType === 'fixed_pack') {
      const first = (product.variants || []).find((v) => v.isActive);
      if (first) emit(undefined, undefined, first.id, first.label);
    } else if (options.length > 0 && options[0].grams !== undefined) {
      emit(options[0].grams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // --- PIECE ---
  if (product.sellingType === 'piece') {
    const price = calculatePrice(product, { pieces: pieceCount });
    return (
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">{t('chooseQuantity')}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
            <button
              type="button"
              onClick={() => {
                const next = Math.max(1, pieceCount - 1);
                setPieceCount(next);
                emit(undefined, next);
              }}
              className="w-10 h-10 flex items-center justify-center text-lg font-bold text-brand-600 active:bg-brand-50"
            >
              −
            </button>
            <span className="w-10 text-center font-semibold">{pieceCount}</span>
            <button
              type="button"
              onClick={() => {
                const next = pieceCount + 1;
                setPieceCount(next);
                emit(undefined, next);
              }}
              className="w-10 h-10 flex items-center justify-center text-lg font-bold text-brand-600 active:bg-brand-50"
            >
              +
            </button>
          </div>
          <span className="text-lg font-bold text-gray-900">₹{price.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  // --- FIXED PACK ---
  if (product.sellingType === 'fixed_pack') {
    return (
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">{t('chooseQuantity')}</p>
        <div className="flex flex-wrap gap-2">
          {(product.variants || [])
            .filter((v) => v.isActive)
            .map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedIndex(idx);
                  emit(undefined, undefined, v.id, v.label);
                }}
                className={`px-3.5 py-2 rounded-full text-sm font-medium border ${
                  selectedIndex === idx
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {v.label} · ₹{v.price}
              </button>
            ))}
        </div>
      </div>
    );
  }

  // --- WEIGHT / VOLUME ---
  const activeGrams = useCustom
    ? parseFloat(customGrams) || 0
    : options[selectedIndex]?.grams || 0;
  const price = calculatePrice(product, { grams: activeGrams });

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{t('chooseQuantity')}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, idx) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => {
              setSelectedIndex(idx);
              setUseCustom(false);
              emit(opt.grams, undefined, undefined, opt.label);
            }}
            className={`px-3.5 py-2 rounded-full text-sm font-medium border ${
              !useCustom && selectedIndex === idx
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUseCustom(true)}
          className={`text-xs font-medium ${useCustom ? 'text-brand-600' : 'text-gray-400'}`}
        >
          Custom amount:
        </button>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={customGrams}
          onFocus={() => setUseCustom(true)}
          onChange={(e) => {
            setUseCustom(true);
            setCustomGrams(e.target.value);
            const g = parseFloat(e.target.value) || 0;
            if (g > 0) emit(g);
          }}
          placeholder={`e.g. 300`}
          className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
        />
        <span className="text-xs text-gray-500">{unitWord}</span>
      </div>

      <p className="mt-3 text-xl font-bold text-gray-900">
        {activeGrams > 0 ? `₹${price.toFixed(2)}` : '—'}
      </p>
    </div>
  );
}
