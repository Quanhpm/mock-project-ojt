import { Link } from 'react-router-dom';
import { slugify } from '@/utils/slugify.util';

interface ProductCardProps {
  id: number;
  title: string;
  img: string;
  name: string;
}

function ProductCard({ title, img, name }: ProductCardProps) {
  const slug = slugify(name);

  return (
    <Link
      to={`/product/${slug}`}
      className="group block cursor-pointer"
    >
      <div className="aspect-square rounded-3xl overflow-hidden border-4 border-transparent group-hover:border-[var(--cf-primary)] transition-all duration-300 bg-[var(--cf-surface)] group-hover:-translate-y-1">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <p className="mt-4 text-center font-bold text-sm uppercase tracking-wider leading-tight text-[var(--cf-primary)]">
        {title}
      </p>
    </Link>
  );
}

export default ProductCard;
