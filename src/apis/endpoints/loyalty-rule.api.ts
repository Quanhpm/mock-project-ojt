import { httpClient } from "@/apis";
import type { SearchResponse } from "@/apis/http.types";
import type {
  LoyaltyRule,
  LoyaltyRuleCreatePayload,
  LoyaltyRuleSearchPayload,
  LoyaltyRuleUpdatePayload,
} from "@/modules/admin/loyalty-rule/components/loyalty-rule.types";

export type LoyaltyRuleSearchResponse = SearchResponse<LoyaltyRule>;

export const loyaltyRuleApi = {
  searchLoyaltyRules: (data: LoyaltyRuleSearchPayload): Promise<LoyaltyRuleSearchResponse> => {
    return httpClient.search<LoyaltyRule, LoyaltyRuleSearchPayload>({
      url: "/loyalty-rules/search",
      data,
    });
  },

  getLoyaltyRuleById: (id: string): Promise<LoyaltyRule | null> => {
    return httpClient.get<LoyaltyRule>({ url: `/loyalty-rules/${id}` });
  },

  createLoyaltyRule: (data: LoyaltyRuleCreatePayload): Promise<LoyaltyRule | null> => {
    return httpClient.post<LoyaltyRule, LoyaltyRuleCreatePayload>({
      url: "/loyalty-rules",
      data,
    });
  },

  updateLoyaltyRule: (id: string, data: LoyaltyRuleUpdatePayload): Promise<LoyaltyRule | null> => {
    return httpClient.put<LoyaltyRule, LoyaltyRuleUpdatePayload>({
      url: `/loyalty-rules/${id}`,
      data,
    });
  },
};
