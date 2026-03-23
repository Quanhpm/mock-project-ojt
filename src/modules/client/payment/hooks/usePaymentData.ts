import { useState, useEffect } from "react";
import { getPaymentById } from "@/apis/endpointsCLIENT/payment.api";
import type { PaymentResponse } from "@/apis/endpointsCLIENT/payment.api";
import { getCustomerProfile } from "@/apis";
import type { CustomerUser } from "@/apis";
import { getFranchiseDetail } from "@/apis";

export function usePaymentData(paymentId: string) {
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
    const [userInfo, setUserInfo] = useState<CustomerUser>();
    const [franchiseName, setFranchiseName] = useState<string>();

    useEffect(() => {
        if (!paymentId) return;

        const fetchData = async () => {
            try {
                const paymentRes = await getPaymentById(paymentId);
                if (paymentRes) setPaymentData(paymentRes);

                const userRes = await getCustomerProfile();
                if (userRes) setUserInfo(userRes);

                console.log("payment data: ", paymentRes);
            } catch (error) {
                console.error("Fetch data failed:", error);
            }
        };

        fetchData();
    }, [paymentId]);

    useEffect(() => {
        if (!paymentData?.franchise_id) return;

        const fetchFranchise = async () => {
            try {
                const response = await getFranchiseDetail(paymentData.franchise_id);
                setFranchiseName(response?.name);
            } catch (error) {
                console.error("Failed to fetch franchise:", error);
            }
        };

        fetchFranchise();
    }, [paymentData]);

    return { paymentData, userInfo, franchiseName };
}