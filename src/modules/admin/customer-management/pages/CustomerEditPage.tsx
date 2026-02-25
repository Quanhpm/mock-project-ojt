import { useParams } from "react-router-dom";
import { customers } from "@/mockdata";
import CustomerForm from "../components/CustomerForm";

export default function CustomerEditPage() {
  const { id } = useParams();
  const customer = customers.find(c => c.id === parseInt(id || ""));

  if (!customer) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6c757d" }}>
        <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
          Customer not found
        </div>
        <p style={{ fontSize: "14px" }}>
          The customer you're trying to edit doesn't exist. Please go back and select a valid customer.
        </p>
      </div>
    );
  }

  return (
    <div>
      <CustomerForm customer={customer} />
    </div>
  );
}
