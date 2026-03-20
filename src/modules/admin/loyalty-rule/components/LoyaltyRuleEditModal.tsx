import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Settings, Trophy, X } from "lucide-react";
import { useGetLoyaltyRuleById } from "./hooks/useGetLoyaltyRuleById";
import { useUpdateLoyaltyRule } from "./hooks/useUpdateLoyaltyRule";
import type { LoyaltyRule, LoyaltyTier, LoyaltyTierRule } from "./loyalty-rule.types";

const fixedTiers: LoyaltyTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

const tierBenefitSchema = z.object({
  order_discount_percent: z.number().min(0, "Discount không hợp lệ").optional(),
  earn_multiplier: z.number().min(0, "Multiplier không hợp lệ").optional(),
  free_shipping: z.boolean(),
});

const tierRuleSchema = z
  .object({
    enabled: z.boolean(),
    tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
    min_points: z.number().min(0, "Points from phải >= 0").optional(),
    max_points: z.number().optional(),
    benefit: tierBenefitSchema,
  });

const updateLoyaltyRuleSchema = z
  .object({
    description: z.string().trim().optional(),
    earn_amount_per_point: z.number().positive("Giá trị phải lớn hơn 0").optional(),
    redeem_value_per_point: z.number().positive("Giá trị phải lớn hơn 0").optional(),
    min_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0").optional(),
    max_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0").optional(),
    tier_rules: z.array(tierRuleSchema).length(4),
  })
  .refine((data) => data.tier_rules.some((tier) => tier.enabled), {
    message: "Cần bật ít nhất 1 tier",
    path: ["tier_rules"],
  });

const tierRulePayloadSchema = z
  .object({
    tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
    min_points: z.number().min(0, "Points from phải >= 0"),
    max_points: z.number().optional(),
    benefit: z.object({
      order_discount_percent: z.number().min(0, "Discount không hợp lệ"),
      earn_multiplier: z.number().min(0, "Multiplier không hợp lệ"),
      free_shipping: z.boolean(),
    }),
  })
  .refine((tier) => tier.max_points === undefined || tier.max_points >= tier.min_points, {
    message: "Points to phải lớn hơn hoặc bằng points from",
    path: ["max_points"],
  });

const updatePayloadSchema = z
  .object({
    description: z.string().trim().optional(),
    franchise_id: z.string().min(1, "Franchise là bắt buộc"),
    earn_amount_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
    redeem_value_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
    min_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
    max_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
    tier_rules: z.array(tierRulePayloadSchema).min(1, "Cần bật ít nhất 1 tier"),
  })
  .refine((data) => data.max_redeem_points >= data.min_redeem_points, {
    message: "Max redeem points phải lớn hơn hoặc bằng min redeem points",
    path: ["max_redeem_points"],
  });

type UpdateLoyaltyRuleFormValues = z.infer<typeof updateLoyaltyRuleSchema>;

interface LoyaltyRuleEditModalProps {
  isOpen: boolean;
  loyaltyRuleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyFormValues = {
  description: "",
  earn_amount_per_point: undefined,
  redeem_value_per_point: undefined,
  min_redeem_points: undefined,
  max_redeem_points: undefined,
  tier_rules: [
    {
      enabled: true,
      tier: "BRONZE",
      min_points: undefined,
      max_points: undefined,
      benefit: { order_discount_percent: undefined, earn_multiplier: undefined, free_shipping: false },
    },
    {
      enabled: true,
      tier: "SILVER",
      min_points: undefined,
      max_points: undefined,
      benefit: { order_discount_percent: undefined, earn_multiplier: undefined, free_shipping: false },
    },
    {
      enabled: true,
      tier: "GOLD",
      min_points: undefined,
      max_points: undefined,
      benefit: { order_discount_percent: undefined, earn_multiplier: undefined, free_shipping: false },
    },
    {
      enabled: true,
      tier: "PLATINUM",
      min_points: undefined,
      max_points: undefined,
      benefit: { order_discount_percent: undefined, earn_multiplier: undefined, free_shipping: false },
    },
  ],
} as unknown as UpdateLoyaltyRuleFormValues;

const mapRuleToFormValues = (data?: LoyaltyRule): UpdateLoyaltyRuleFormValues => {
  if (!data) return emptyFormValues;

  const tierMap = new Map(data.tier_rules.map((tier) => [tier.tier, tier]));

  return {
    description: data.description,
    earn_amount_per_point: data.earn_amount_per_point,
    redeem_value_per_point: data.redeem_value_per_point,
    min_redeem_points: data.min_redeem_points,
    max_redeem_points: data.max_redeem_points,
    tier_rules: fixedTiers.map((fixedTier) => {
      const existing = tierMap.get(fixedTier);
      if (!existing) {
        return {
          enabled: false,
          tier: fixedTier,
          min_points: undefined,
          max_points: undefined,
          benefit: { order_discount_percent: undefined, earn_multiplier: undefined, free_shipping: false },
        } as unknown as UpdateLoyaltyRuleFormValues["tier_rules"][number];
      }

      return {
        enabled: true,
        tier: fixedTier,
        min_points: existing.min_points,
        max_points: existing.max_points,
        benefit: {
          order_discount_percent: existing.benefit.order_discount_percent,
          earn_multiplier: existing.benefit.earn_multiplier,
          free_shipping: existing.benefit.free_shipping,
        },
      };
    }),
  };
};

const toFixedTierMap = (rule?: LoyaltyRule) => {
  return new Map<LoyaltyTier, LoyaltyTierRule>(
    (rule?.tier_rules ?? [])
      .filter((tier): tier is LoyaltyTierRule => fixedTiers.includes(tier.tier as LoyaltyTier))
      .map((tier) => [tier.tier as LoyaltyTier, tier]),
  );
};

export default function LoyaltyRuleEditModal({
  isOpen,
  loyaltyRuleId,
  onClose,
  onSuccess,
}: LoyaltyRuleEditModalProps) {
  const { loyaltyRule, isLoading, fetchById } = useGetLoyaltyRuleById();
  const { updateLoyaltyRule, isUpdating } = useUpdateLoyaltyRule();
  const lastFetchedIdRef = useRef<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<UpdateLoyaltyRuleFormValues>({
    resolver: zodResolver(updateLoyaltyRuleSchema),
    defaultValues: emptyFormValues,
    mode: "onChange",
  });

  const tierValues = watch("tier_rules");
  const existingTierMap = useMemo(() => toFixedTierMap(loyaltyRule ?? undefined), [loyaltyRule]);

  useEffect(() => {
    if (!isOpen) {
      lastFetchedIdRef.current = "";
      reset(emptyFormValues);
      return;
    }

    if (!loyaltyRuleId || lastFetchedIdRef.current === loyaltyRuleId) return;

    lastFetchedIdRef.current = loyaltyRuleId;
    void fetchById(loyaltyRuleId);
  }, [isOpen, loyaltyRuleId, fetchById, reset]);

  useEffect(() => {
    if (!isOpen || !loyaltyRule) return;
    reset(mapRuleToFormValues(loyaltyRule));
  }, [isOpen, loyaltyRule, reset]);

  const enabledTierCount = useMemo(() => tierValues?.filter((tier) => tier.enabled).length ?? 0, [tierValues]);

  const onSubmit = (data: UpdateLoyaltyRuleFormValues) => {
    if (!loyaltyRule) return;

    clearErrors();

    const mergedTierRules = fixedTiers
      .map((tierName, index) => {
        const formTier = data.tier_rules[index];
        const sourceTier = existingTierMap.get(tierName);
        if (!formTier?.enabled) return null;

        const minPoints = formTier.min_points ?? sourceTier?.min_points;
        const discount = formTier.benefit.order_discount_percent ?? sourceTier?.benefit.order_discount_percent;
        const multiplier = formTier.benefit.earn_multiplier ?? sourceTier?.benefit.earn_multiplier;

        let hasManualError = false;
        if (minPoints === undefined) {
          setError(`tier_rules.${index}.min_points`, {
            type: "manual",
            message: "Points from là bắt buộc",
          });
          hasManualError = true;
        }
        if (discount === undefined) {
          setError(`tier_rules.${index}.benefit.order_discount_percent`, {
            type: "manual",
            message: "Discount là bắt buộc",
          });
          hasManualError = true;
        }
        if (multiplier === undefined) {
          setError(`tier_rules.${index}.benefit.earn_multiplier`, {
            type: "manual",
            message: "Multiplier là bắt buộc",
          });
          hasManualError = true;
        }

        if (hasManualError) return "invalid" as const;

        return {
          tier: tierName,
          min_points: minPoints as number,
          max_points: formTier.max_points ?? sourceTier?.max_points,
          benefit: {
            order_discount_percent: discount as number,
            earn_multiplier: multiplier as number,
            free_shipping: formTier.benefit.free_shipping,
          },
        };
      })
      .filter((tier): tier is Exclude<typeof tier, null | "invalid"> => tier !== null && tier !== "invalid");

    if (mergedTierRules.length === 0) {
      setError("tier_rules", { type: "manual", message: "Cần bật ít nhất 1 tier" });
      return;
    }

    if (data.tier_rules.some((tier, index) => tier.enabled && !mergedTierRules.find((merged) => merged.tier === fixedTiers[index]))) {
      return;
    }

    const mergedPayload = {
      franchise_id: loyaltyRule.franchise_id,
      description: data.description?.trim() ?? loyaltyRule.description,
      earn_amount_per_point: data.earn_amount_per_point ?? loyaltyRule.earn_amount_per_point,
      redeem_value_per_point: data.redeem_value_per_point ?? loyaltyRule.redeem_value_per_point,
      min_redeem_points: data.min_redeem_points ?? loyaltyRule.min_redeem_points,
      max_redeem_points: data.max_redeem_points ?? loyaltyRule.max_redeem_points,
      tier_rules: mergedTierRules,
    };

    const validated = updatePayloadSchema.safeParse(mergedPayload);
    if (!validated.success) {
      const issue = validated.error.issues[0];
      if (issue?.path?.[0] === "max_redeem_points") {
        setError("max_redeem_points", { type: "manual", message: issue.message });
      }
      return;
    }

    updateLoyaltyRule(
      loyaltyRuleId,
      validated.data,
      () => {
        onSuccess();
        onClose();
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div onClick={(e) => e.stopPropagation()} className="relative z-10 w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col">
        <header className="px-8 py-6 flex justify-between items-start border-b border-white/40">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#6f4315] leading-none">Edit Loyalty Rule</h1>
            <p className="mt-2 text-[#51443a] text-sm">Update points, redemption values, and tier benefits.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-[#f1e6df] transition-colors">
            <X size={18} className="text-[#51443a]" />
          </button>
        </header>

        {isLoading ? (
          <div className="p-10 flex items-center justify-center gap-3 text-[#6b7280]">
            <Loader2 size={20} className="animate-spin" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-10 bg-white">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-[#8b5a2b]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#51443a]">General Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#51443a] mb-1">Rule Description</label>
                  <input {...register("description")} className="w-full bg-[#f1e6df]/70 border-none focus:ring-0 border-b-2 border-transparent focus:border-[#8b5a2b] rounded-sm px-4 py-3 text-sm transition-all" placeholder="e.g. Seasonal Holiday Multiplier" type="text" />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#51443a] mb-1">Applicable Franchise</label>
                  <input disabled value={loyaltyRule?.franchise_name || loyaltyRule?.franchise_id || ""} className="w-full bg-[#ece0da]/80 text-[#6b7280] border border-[#d5c3b6] rounded-sm px-4 py-3 text-sm cursor-not-allowed" type="text" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#51443a] mb-1">Spend per 1 Point</label>
                  <input type="number" min={1} {...register("earn_amount_per_point", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="e.g. 10000" className="w-full bg-[#f1e6df]/70 border-none focus:ring-0 border-b-2 border-transparent focus:border-[#8b5a2b] rounded-sm px-4 py-3 text-sm" />
                  {errors.earn_amount_per_point && <p className="text-xs text-red-500 mt-1">{errors.earn_amount_per_point.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#51443a] mb-1">Redemption Value</label>
                  <input type="number" min={1} {...register("redeem_value_per_point", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="e.g. 1000" className="w-full bg-[#f1e6df]/70 border-none focus:ring-0 border-b-2 border-transparent focus:border-[#8b5a2b] rounded-sm px-4 py-3 text-sm" />
                  {errors.redeem_value_per_point && <p className="text-xs text-red-500 mt-1">{errors.redeem_value_per_point.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#51443a] mb-1">Min Redeem Points</label>
                  <input type="number" min={1} {...register("min_redeem_points", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="e.g. 10" className="w-full bg-[#f1e6df]/70 border-none focus:ring-0 border-b-2 border-transparent focus:border-[#8b5a2b] rounded-sm px-4 py-3 text-sm" />
                  {errors.min_redeem_points && <p className="text-xs text-red-500 mt-1">{errors.min_redeem_points.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#51443a] mb-1">Max Redeem Points</label>
                  <input type="number" min={1} {...register("max_redeem_points", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="e.g. 500" className="w-full bg-[#f1e6df]/70 border-none focus:ring-0 border-b-2 border-transparent focus:border-[#8b5a2b] rounded-sm px-4 py-3 text-sm" />
                  {errors.max_redeem_points && <p className="text-xs text-red-500 mt-1">{errors.max_redeem_points.message}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy size={18} className="text-[#8b5a2b]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#51443a]">Tier Benefits</h2>
                </div>
                <p className="text-xs font-semibold text-[#51443a]">Enabled: {enabledTierCount}/4</p>
              </div>

              {errors.tier_rules?.message && <p className="text-xs text-red-500">{errors.tier_rules.message}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-2">
                {fixedTiers.map((fixedTier, index) => {
                  const tierValue = tierValues?.[index];
                  const tierError = errors.tier_rules?.[index];
                  const isEnabled = tierValue?.enabled ?? true;

                  return (
                    <div key={fixedTier} className={`bg-[#fdf1ea]/60 border-2 p-5 rounded-lg space-y-4 transition-all ${isEnabled ? "border-transparent hover:border-[#8b5a2b]/40" : "border-[#d5c3b6] opacity-60"}`}>
                      <div className="flex justify-between items-center gap-2">
                        <input {...register(`tier_rules.${index}.tier`)} className="text-xs font-black tracking-widest uppercase text-[#6f4315] bg-transparent border-none p-0 focus:ring-0 w-full" readOnly />

                        <button type="button" onClick={() => setValue(`tier_rules.${index}.enabled`, !isEnabled, { shouldValidate: true, shouldDirty: true })} className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors ${isEnabled ? "bg-[#8b5a2b] text-white hover:bg-[#6f4315]" : "bg-[#ece0da] text-[#51443a] hover:bg-[#d5c3b6]"}`}>
                          {isEnabled ? "Tắt" : "Bật"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-[#51443a] block mb-1 uppercase tracking-widest">Points From</label>
                          <input type="number" min={0} disabled={!isEnabled} {...register(`tier_rules.${index}.min_points`, { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="e.g. 0" className="w-full text-xs bg-white border border-[#d5c3b6] rounded-sm px-2 py-2 focus:border-[#8b5a2b] focus:ring-0 disabled:bg-[#f5f5f5]" />
                          {tierError?.min_points && <p className="text-[10px] text-red-500 mt-1">{tierError.min_points.message}</p>}
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#51443a] block mb-1 uppercase tracking-widest">Points To</label>
                          <input type="number" min={0} disabled={!isEnabled} {...register(`tier_rules.${index}.max_points`, { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="Optional" className="w-full text-xs bg-white border border-[#d5c3b6] rounded-sm px-2 py-2 focus:border-[#8b5a2b] focus:ring-0 disabled:bg-[#f5f5f5]" />
                          {tierError?.max_points && <p className="text-[10px] text-red-500 mt-1">{tierError.max_points.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-medium text-[#201b17]">Discount %</span>
                          <input type="number" min={0} disabled={!isEnabled} {...register(`tier_rules.${index}.benefit.order_discount_percent`, { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="0" className="w-16 text-center text-xs bg-white border border-[#d5c3b6] rounded-sm py-1.5 focus:border-[#8b5a2b] focus:ring-0 disabled:bg-[#f5f5f5]" />
                          {tierError?.benefit?.order_discount_percent && <p className="text-[10px] text-red-500 mt-1">{tierError.benefit.order_discount_percent.message}</p>}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-medium text-[#201b17]">Multiplier</span>
                          <input type="number" min={0} step="0.01" disabled={!isEnabled} {...register(`tier_rules.${index}.benefit.earn_multiplier`, { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="1.0" className="w-16 text-center text-xs bg-white border border-[#d5c3b6] rounded-sm py-1.5 focus:border-[#8b5a2b] focus:ring-0 disabled:bg-[#f5f5f5]" />
                          {tierError?.benefit?.earn_multiplier && <p className="text-[10px] text-red-500 mt-1">{tierError.benefit.earn_multiplier.message}</p>}
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] font-medium text-[#201b17]">Free Shipping</span>
                          <button type="button" disabled={!isEnabled} onClick={() => setValue(`tier_rules.${index}.benefit.free_shipping`, !tierValue?.benefit?.free_shipping, { shouldValidate: true, shouldDirty: true })} className={`w-10 h-5 rounded-full relative transition-colors disabled:opacity-50 ${tierValue?.benefit?.free_shipping ? "bg-[#8b5a2b]" : "bg-[#d5c3b6]"}`}>
                            <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${tierValue?.benefit?.free_shipping ? "right-1" : "left-1"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <footer className="pt-6 bg-[#f7ece5] px-8 py-6 -mx-8 -mb-8 flex justify-end gap-4 items-center border-t border-[#d5c3b6]/40 sticky bottom-0">
              <button type="button" onClick={onClose} disabled={isUpdating} className="px-6 py-2.5 text-sm font-bold tracking-wide text-[#51443a] hover:text-[#201b17] transition-colors disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={isUpdating} className="px-12 py-3 bg-[#8B5A2B] text-white text-sm font-bold tracking-widest uppercase rounded-md shadow-lg hover:bg-[#6f4315] transition-all disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2">
                {isUpdating && <Loader2 size={14} className="animate-spin" />}
                Save Rule
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
