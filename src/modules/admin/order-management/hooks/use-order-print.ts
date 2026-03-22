import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useToast } from "@/hooks/use-toast.hook";

interface UseOrderPrintOptions {
  documentTitle?: string;
}

export const useOrderPrint = (options: UseOrderPrintOptions = {}) => {
  const { documentTitle } = options;
  const { error: showError } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: documentTitle || "order-invoice",
    onPrintError: (_errorLocation, error) => {
      console.error("[OrderPrint] Failed to open print preview", error);
      showError("Không thể mở chế độ in. Vui lòng thử lại.");
    },
  });

  return {
    printRef,
    handleExportPdf,
  };
};
