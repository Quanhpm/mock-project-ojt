import { axiosClient } from "@/apis/axios.config";
import type { CustomerOption, CustomerSearchPageInfo } from "../models/customer.models";
import type { SearchCustomersRequest } from "../models/request.models";

interface SearchCustomersResponse {
  success: boolean;
  data: CustomerOption[];
  pageInfo: CustomerSearchPageInfo;
}

export const customerService = {
  async searchCustomers(payload: SearchCustomersRequest) {
    const response = await axiosClient.post<SearchCustomersResponse>(
      "/customers/search",
      payload,
    );

    return response.data;
  },
};
