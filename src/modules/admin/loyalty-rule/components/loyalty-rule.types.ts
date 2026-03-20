export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface LoyaltyTierBenefit {
  order_discount_percent: number;
  earn_multiplier: number;
  free_shipping: boolean;
}

export interface LoyaltyTierRule {
  tier: LoyaltyTier;
  min_points: number;
  max_points?: number;
  benefit: LoyaltyTierBenefit;
}

export interface LoyaltyRule {
  id: string;
  franchise_id: string;
  franchise_name?: string;
  earn_amount_per_point: number;
  redeem_value_per_point: number;
  min_redeem_points: number;
  max_redeem_points: number;
  tier_rules: LoyaltyTierRule[];
  description: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyRuleCreatePayload {
  franchise_id: string;
  earn_amount_per_point: number;
  redeem_value_per_point: number;
  min_redeem_points: number;
  max_redeem_points: number;
  tier_rules: LoyaltyTierRule[];
  description?: string;
}

export interface LoyaltyRuleUpdatePayload {
  franchise_id: string;
  earn_amount_per_point: number;
  redeem_value_per_point: number;
  min_redeem_points: number;
  max_redeem_points: number;
  tier_rules: LoyaltyTierRule[];
  description?: string;
}

export interface LoyaltyRuleSearchCondition {
  franchise_id?: string;
  earn_amount_per_point?: number | "";
  redeem_value_per_point?: number | "";
  tier?: LoyaltyTier | "";
  is_active?: boolean | "";
  is_deleted?: boolean | "";
}

export interface LoyaltyRuleSearchPayload {
  searchCondition: LoyaltyRuleSearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}
