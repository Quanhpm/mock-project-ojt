import ProductEditForm from "../components/ProductEditForm";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package, Upload, X } from "lucide-react";
import { mockProducts, mockCategories } from "@/mockdata";
import { mockFranchises } from "@/mockdata";

export default function ProductActionPage() {
  return <ProductEditForm />;
}

