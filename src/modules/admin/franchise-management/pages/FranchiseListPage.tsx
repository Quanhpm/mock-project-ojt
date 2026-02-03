import React from "react";

interface Franchise {
  id: string;
  title: string;
  status: "draft" | "published";
  createdAt: string;
}

// dữ liệu giả lập
const mockFranchises: Franchise[] = [
  {
    id: "1",
    title: "Nhượng quyền Cafe Highlands",
    status: "published",
    createdAt: "2024-10-01",
  },
  {
    id: "2",
    title: "Nhượng quyền Cafe OJT",
    status: "draft",
    createdAt: "2024-10-05",
  },
];

export default function FranchiseListPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Franchise Management</h1>

      <ul>
        {mockFranchises.map((item) => (
          <li key={item.id}>
            {item.title} – {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
