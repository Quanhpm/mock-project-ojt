import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCart, getCustomerCarts } from '@/apis/endpointsCLIENT/cart.api';
import { useCartCount } from '@/modules/client/cart/hooks';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import { ROUTER_URL } from '@/routes/router.const';

function FloatingCartButton() {
  const navigate = useNavigate();
  const customerId = useClientAuthStore((state) => state.user?.id);
  const { count, isLoading } = useCartCount();
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  const hasDraggedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) {
      hasDraggedRef.current = true;
    }
  }, []);

  const handleOpenCart = useCallback(async () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      try {
        await getCart();
      } catch {
        if (customerId) {
          await getCustomerCarts(customerId, 'ACTIVE');
        }
      }

      navigate(ROUTER_URL.HOME_ROUTER.CART);
    } finally {
      setIsNavigating(false);
    }
  }, [customerId, isNavigating, navigate]);

  return (
    <div
      ref={dragConstraintsRef}
      className="pointer-events-none fixed inset-0 z-[70] xl:hidden"
      aria-hidden={false}
    >
      <motion.div
        drag
        dragConstraints={dragConstraintsRef}
        dragElastic={0.14}
        dragMomentum={false}
        initial={{ opacity: 0, y: 20, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        onDragStart={() => {
          hasDraggedRef.current = false;
        }}
        onDrag={handleDrag}
        className="pointer-events-auto absolute bottom-5 right-4 sm:bottom-6 sm:right-6"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            void handleOpenCart();
          }}
          disabled={isNavigating}
          aria-busy={isNavigating || isLoading}
          aria-label={count > 0 ? `Mo gio hang, ${count} san pham` : 'Mo gio hang'}
          className="relative flex h-14 w-14 cursor-grab items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(135deg,var(--cf-primary)_0%,var(--cf-dark)_100%)] text-white shadow-[0px_18px_40px_rgba(75,48,38,0.28)] outline-none transition-transform active:cursor-grabbing focus:ring-4 focus:ring-[var(--cf-primary)]/20 sm:h-16 sm:w-16"
        >
          <motion.span
            animate={isLoading ? { scale: [1, 1.08, 1] } : undefined}
            transition={{ duration: 1, repeat: isLoading ? Number.POSITIVE_INFINITY : 0 }}
            className="flex items-center justify-center"
          >
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.25} />
          </motion.span>

          <AnimatePresence initial={false} mode="popLayout">
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ opacity: 0, scale: 0.55, y: 4 }}
                animate={{ opacity: 1, scale: [1, 1.18, 1], y: 0 }}
                exit={{ opacity: 0, scale: 0.55, y: 4 }}
                transition={{ duration: 0.26, ease: 'easeOut' }}
                className="absolute -right-1.5 -top-1.5 flex min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 py-1 text-[11px] font-bold leading-none text-white shadow-[0px_10px_18px_rgba(239,68,68,0.38)]"
              >
                {count > 99 ? '99+' : count}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default FloatingCartButton;
