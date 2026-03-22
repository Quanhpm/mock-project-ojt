import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditProductModal from "../components/EditProductModal";
import { useGetProductById } from "../components/hooks/useGetProductById";

export default function ProductActionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, fetchProduct } = useGetProductById();

  useEffect(() => {
    if (!id) {
      navigate("/admin/products", { replace: true });
      return;
    }

    void fetchProduct(id);
  }, [fetchProduct, id, navigate]);

  return (
    <EditProductModal
      isOpen
      product={product}
      isLoading={isLoading}
      onClose={() => navigate("/admin/products")}
      onUpdated={() => navigate("/admin/products")}
    />
  );
}

