import { httpClient } from '../httpClient';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

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

export interface ClientLoyaltyRule {
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

export interface LoyaltyCustomerProfile {
  _id: string;
  email: string;
  phone: string;
  name: string;
}

export interface LoyaltyFranchiseProfile {
  _id: string;
  name: string;
}

export interface ClientCustomerLoyaltyDetail {
  _id: string;
  customer_id: LoyaltyCustomerProfile;
  franchise_id: LoyaltyFranchiseProfile;
  loyalty_points: number;
  current_tier: LoyaltyTier;
  total_earned_points: number;
  total_orders: number;
  total_spent: number;
  is_active: boolean;
  is_deleted: boolean;
  first_order_date: string;
  created_at: string;
  updated_at: string;
}

export const getClientLoyaltyRuleByFranchise = async (
  franchiseId: string,
): Promise<ClientLoyaltyRule | null> => {
  const response = await httpClient.get<ClientLoyaltyRule>({
    url: `/clients/franchises/${franchiseId}/loyalty-rule`,
  });

  if (!response || !response.is_active || response.is_deleted) {
    return null;
  }

  return response;
};

export const getClientCustomerLoyaltyDetail = async (
  franchiseId: string,
): Promise<ClientCustomerLoyaltyDetail | null> => {
  const response = await httpClient.get<ClientCustomerLoyaltyDetail>({
    url: `/clients/franchises/${franchiseId}/customer-loyalty`,
  });

  if (!response || !response.is_active || response.is_deleted) {
    return null;
  }

  return response;
};
