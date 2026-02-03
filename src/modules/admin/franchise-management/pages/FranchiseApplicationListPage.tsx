import React from "react";

type ApplicationStatus = "pending" | "contacted" | "approved" | "rejected";

interface FranchiseApplication {
    id: string;
    applicantName: string;   // người yêu cầu nhượng quyền
    phone: string;
    email: string;
    brandName: string;       // xin nhượng quyền thương hiệu nào
    location: string;        // khu vực mong muốn
    status: ApplicationStatus;
    createdAt: string;
}

const mockApplications: FranchiseApplication[] = [
    {
        id: "APP-001",
        applicantName: "Nguyễn Văn A",
        phone: "0909123456",
        email: "a@gmail.com",
        brandName: "Cafe Highlands",
        location: "TP. Hồ Chí Minh",
        status: "pending",
        createdAt: "2024-10-01",
    },
    {
        id: "APP-002",
        applicantName: "Trần Thị B",
        phone: "0912345678",
        email: "b@gmail.com",
        brandName: "Cafe OJT",
        location: "Đà Nẵng",
        status: "approved",
        createdAt: "2024-10-05",
    },
];

function statusText(status: ApplicationStatus) {
    switch (status) {
        case "pending":
            return "Chờ xử lý";
        case "contacted":
            return "Đã liên hệ";
        case "approved":
            return "Đã duyệt";
        case "rejected":
            return "Từ chối";
        default:
            return status;
    }
}

export default function FranchiseApplicationListPage() {
    return (
        <div style={{ padding: 24 }}>
            <h1>Franchise Applications</h1>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
                <thead>
                    <tr>
                        <th align="left">ID</th>
                        <th align="left">Applicant</th>
                        <th align="left">Brand</th>
                        <th align="left">Location</th>
                        <th>Status</th>
                        <th align="left">Created</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {mockApplications.map((a) => (
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>
                                <div>{a.applicantName}</div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>
                                    {a.phone} • {a.email}
                                </div>
                            </td>
                            <td>{a.brandName}</td>
                            <td>{a.location}</td>
                            <td style={{ textAlign: "center" }}>{statusText(a.status)}</td>
                            <td>{a.createdAt}</td>
                            <td style={{ textAlign: "center" }}>
                                <button>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
