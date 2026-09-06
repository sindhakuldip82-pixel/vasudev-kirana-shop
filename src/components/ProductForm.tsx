'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, PackVariant, Product, SellingType } from '@/types';
import { generateId } from '@/lib/id';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  categories: Category[];
  initial?: Product; // present when editing
}

export default function ProductForm({ categories, initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name || '');
  const [gujaratiName, setGujaratiName] = useState(initial?.gujaratiName || '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId || categories[0]?.id || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image, setImage] = useState(initial?.image || '');
  const [sellingType, setSellingType] = useState<SellingType>(initial?.sellingType || 'weight');
  const [basePrice, setBasePrice] = useState(initial?.basePrice?.toString() || '');
  const [piecePrice, setPiecePrice] = useState(initial?.piecePrice?.toString() || '');
  const [mrp, setMrp] = useState(initial?.mrp?.toString() || '');
  const [stock, setStock] = useState(initial?.stock?.toString() || '0');
  const [stockStatus, setStockStatus] = useState(initial?.stockStatus || 'in_stock');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [offerBadge, setOfferBadge] = useState(initial?.offerBadge || '');
  const [variants, setVariants] = useState<PackVariant[]>(
    initial?.variants && initial.variants.length > 0
      ? initial.variants
      : [{ id: generateId('var-'), label: '', price: 0, stock: 0, isActive: true }]
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [minQuantityGrams, setMinQuantityGrams] = useState(initial?.minQuantityGrams?.toString() || '100');
  const [stepGrams, setStepGrams] = useState(initial?.stepGrams?.toString() || '50');

  function addVariant() {
    setVariants((v) => [...v, { id: generateId('var-'), label: '', price: 0, stock: 0, isActive: true }]);
  }
  function updateVariant(id: string, patch: Partial<PackVariant>) {
    setVariants((v) => v.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeVariant(id: string) {
    setVariants((v) => v.filter((x) => x.id !== id));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMessage('');
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setImage(data.url);
      setUploadMessage('Image uploaded ✓');
    } catch (err) {
      setUploadMessage(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Product name is required.');
    if (!categoryId) return setError('Please select a category.');
    if (sellingType === 'weight' || sellingType === 'volume') {
      if (!basePrice || Number(basePrice) <= 0) return setError('Enter a valid base price per kg/litre.');
    }
    if (sellingType === 'piece' && (!piecePrice || Number(piecePrice) <= 0)) {
      return setError('Enter a valid price per piece.');
    }
    if (sellingType === 'fixed_pack' && variants.filter((v) => v.label && v.price > 0).length === 0) {
      return setError('Add at least one pack size with a price.');
    }

    setSaving(true);
    const payload = {
      name,
      gujaratiName,
      categoryId,
      description,
      image: image || 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=400&q=60',
      minQuantityGrams: sellingType === 'weight' || sellingType === 'volume' ? Math.max(1, Number(minQuantityGrams) || 100) : undefined,
      stepGrams: sellingType === 'weight' || sellingType === 'volume' ? Math.max(1, Number(stepGrams) || 50) : undefined,
      sellingType,
      basePrice: sellingType === 'weight' || sellingType === 'volume' ? Number(basePrice) : undefined,
      baseUnit: sellingType === 'weight' ? 'kg' : sellingType === 'volume' ? 'litre' : undefined,
      piecePrice: sellingType === 'piece' ? Number(piecePrice) : undefined,
      variants: sellingType === 'fixed_pack' ? variants.filter((v) => v.label) : [],
      mrp: mrp ? Number(mrp) : undefined,
      stock: Number(stock) || 0,
      stockStatus,
      isActive,
      isFeatured,
      offerBadge,
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${initial!.id}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError('Could not save product. Please check your admin session and try again.');
        setSaving(false);
        return;
      }
      router.push('/admin/products');
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-10">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500">Product name (English)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Product name (Gujarati)</label>
          <input value={gujaratiName} onChange={(e) => setGujaratiName(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-3.5">
        <label className="text-xs font-semibold text-gray-500">Product photo</label>
        <div className="flex gap-3 items-center mt-2">
          <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
            {image ? <img src={image} alt="Product preview" className="w-full h-full object-cover" /> : <span className="text-2xl">📷</span>}
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center justify-center bg-brand-50 text-brand-700 border border-brand-200 rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer">
              {uploading ? 'Uploading...' : 'Upload from phone'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
            {uploadMessage && <p className="text-[11px] mt-1 text-gray-500">{uploadMessage}</p>}
          </div>
        </div>
        <label className="text-[11px] font-semibold text-gray-400 block mt-3">Or paste image URL</label>
        <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
        <p className="text-[11px] text-gray-400 mt-1">JPG, PNG or WebP up to 5 MB.</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Selling type</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['weight', 'Weight (per kg)'],
            ['volume', 'Volume (per litre)'],
            ['piece', 'Piece'],
            ['fixed_pack', 'Fixed Pack'],
          ] as [SellingType, string][]).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setSellingType(type)}
              className={`text-sm font-medium py-2.5 rounded-xl border ${sellingType === type ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {(sellingType === 'weight' || sellingType === 'volume') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Minimum quantity ({sellingType === 'weight' ? 'g' : 'ml'})</label>
            <input type="number" min="1" value={minQuantityGrams} onChange={(e) => setMinQuantityGrams(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Step ({sellingType === 'weight' ? 'g' : 'ml'})</label>
            <input type="number" min="1" value={stepGrams} onChange={(e) => setStepGrams(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
        </div>
      )}

      {(sellingType === 'weight' || sellingType === 'volume') && (
        <div>
          <label className="text-xs font-semibold text-gray-500">
            Base price (₹ per {sellingType === 'weight' ? 'kg' : 'litre'})
          </label>
          <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="e.g. 52" className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
          <p className="text-[11px] text-gray-400 mt-1">
            The customer picks 100g/250g/500g/etc. — the price is calculated automatically. No need to create separate products per size.
          </p>
        </div>
      )}

      {sellingType === 'piece' && (
        <div>
          <label className="text-xs font-semibold text-gray-500">Price per piece (₹)</label>
          <input type="number" step="0.01" value={piecePrice} onChange={(e) => setPiecePrice(e.target.value)} placeholder="e.g. 10" className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
      )}

      {sellingType === 'fixed_pack' && (
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pack sizes &amp; prices</label>
          <div className="flex flex-col gap-2">
            {variants.map((v) => (
              <div key={v.id} className="flex items-center gap-2">
                <input
                  value={v.label}
                  onChange={(e) => updateVariant(v.id, { label: e.target.value })}
                  placeholder="e.g. 500 ml"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-300"
                />
                <input
                  type="number"
                  step="0.01"
                  value={v.price || ''}
                  onChange={(e) => updateVariant(v.id, { price: Number(e.target.value) })}
                  placeholder="Price ₹"
                  className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button type="button" onClick={() => removeVariant(v.id)} className="text-red-400 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs text-brand-600 font-medium mt-1">
              <Plus size={13} /> Add pack size
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500">Compare-at price / MRP (optional)</label>
          <input type="number" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Offer badge (optional)</label>
          <input value={offerBadge} onChange={(e) => setOfferBadge(e.target.value)} placeholder="e.g. 10% OFF" className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500">
            Stock ({sellingType === 'weight' ? 'grams' : sellingType === 'volume' ? 'ml' : 'units'})
          </label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Stock status</label>
          <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value as Product['stockStatus'])} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300">
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-brand-500" />
          Active (visible to customers)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-brand-500" />
          Featured
        </label>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5">{error}</div>}

      <button type="submit" disabled={saving} className="bg-brand-500 text-white font-semibold text-sm py-3.5 rounded-xl disabled:opacity-50">
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}
      </button>
    </form>
  );
}
