export default function PriceTag({
  price,
  mrp,
  size = 'md',
}: {
  price: number;
  mrp?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }[size];
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-bold text-gray-900 ${sizeClasses}`}>₹{price.toFixed(2).replace(/\.00$/, '')}</span>
      {mrp && mrp > price && (
        <span className="text-xs text-gray-400 line-through">₹{mrp.toFixed(2).replace(/\.00$/, '')}</span>
      )}
    </div>
  );
}
