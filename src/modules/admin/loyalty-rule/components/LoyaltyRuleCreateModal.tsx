import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Settings, Trophy, X } from "lucide-react";
import { useCreateLoyaltyRule } from "./hooks/useCreateLoyaltyRule";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import type { LoyaltyTier } from "./loyalty-rule.types";

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
  })
  .refine((tier) => !tier.enabled || tier.min_points !== undefined, {
    message: "Points from là bắt buộc",
    path: ["min_points"],
  })
  .refine((tier) => !tier.enabled || tier.benefit.order_discount_percent !== undefined, {
    message: "Discount là bắt buộc",
    path: ["benefit", "order_discount_percent"],
  })
  .refine((tier) => !tier.enabled || tier.benefit.earn_multiplier !== undefined, {
    message: "Multiplier là bắt buộc",
    path: ["benefit", "earn_multiplier"],
  })
  .refine((tier) => !tier.enabled || tier.max_points === undefined || tier.min_points === undefined || tier.max_points >= tier.min_points, {
    message: "Points to phải lớn hơn hoặc bằng points from",
    path: ["max_points"],
  });

const createLoyaltyRuleSchema = z
  .object({
    description: z.string().trim().optional(),
    franchise_id: z.string().min(1, "Franchise là bắt buộc"),
    earn_amount_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
    redeem_value_per_point: z.number().positive("Giá trị phải lớn hơn 0"),
    min_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
    max_redeem_points: z.number().int().positive("Giá trị phải lớn hơn 0"),
    tier_rules: z.array(tierRuleSchema).length(4),
  })
  .refine((data) => data.max_redeem_points >= data.min_redeem_points, {
    message: "Max redeem points phải lớn hơn hoặc bằng min redeem points",
    path: ["max_redeem_points"],
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

const createPayloadSchema = z
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

type CreateLoyaltyRuleFormValues = z.infer<typeof createLoyaltyRuleSchema>;

interface LoyaltyRuleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultValues = {
  description: "",
  franchise_id: "",
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
} as unknown as CreateLoyaltyRuleFormValues;

export default function LoyaltyRuleCreateModal({ isOpen, onClose, onSuccess }: LoyaltyRuleCreateModalProps) {
  const { createLoyaltyRule, isCreating } = useCreateLoyaltyRule();
  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [franchisesLoading, setFranchisesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateLoyaltyRuleFormValues>({
    resolver: zodResolver(createLoyaltyRuleSchema),
    defaultValues,
    mode: "onChange",
  });

  const tierValues = watch("tier_rules");

  useEffect(() => {
    if (!isOpen) return;
    reset(defaultValues);
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    setFranchisesLoading(true);
    franchiseApi
      .searchFranchises({
        searchCondition: { is_deleted: false, is_active: true },
        pageInfo: { pageNum: 1, pageSize: 100 },
      })
      .then((res) => setFranchises(res?.data ?? []))
      .catch(() => setFranchises([]))
      .finally(() => setFranchisesLoading(false));
  }, [isOpen]);

  const enabledTierCount = useMemo(() => tierValues?.filter((tier) => tier.enabled).length ?? 0, [tierValues]);

  const onSubmit = (data: CreateLoyaltyRuleFormValues) => {
    const enabledTiers = data.tier_rules
      .filter((tier) => tier.enabled)
      .map((tier) => ({
        tier: tier.tier,
        min_points: tier.min_points,
        max_points: tier.max_points,
        benefit: tier.benefit,
      }));

    const payload = {
      franchise_id: data.franchise_id,
      earn_amount_per_point: data.earn_amount_per_point,
      redeem_value_per_point: data.redeem_value_per_point,
      min_redeem_points: data.min_redeem_points,
      max_redeem_points: data.max_redeem_points,
      tier_rules: enabledTiers,
      description: data.description?.trim() || undefined,
    };

    const validated = createPayloadSchema.safeParse(payload);
    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      if (firstIssue?.path?.[0] === "max_redeem_points") {
        setError("max_redeem_points", { type: "manual", message: firstIssue.message });
      }
      if (firstIssue?.path?.[0] === "tier_rules") {
        setError("tier_rules", { type: "manual", message: firstIssue.message });
      }
      return;
    }

    createLoyaltyRule(
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

      <div onClick={(e) => e.stopPropagation()} className="relative z-10 w-[min(100%,calc(100vw-24px))] max-w-5xl max-h-[calc(100dvh-24px)] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col">
        <header className="px-8 py-6 flex justify-between items-start border-b border-white/40 max-md:flex-col max-md:gap-4 max-md:px-4 max-md:py-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#6f4315] leading-none">Create New Loyalty Rule</h1>
            <p className="mt-2 text-[#51443a] text-sm">Set up points, redemption values, and tier benefits.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-[#f1e6df] transition-colors">
            <X size={18} className="text-[#51443a]" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-10 bg-white max-md:p-4">
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
                <select {...register("franchise_id")} disabled={franchisesLoading} className="w-full bg-[#f1e6df]/70 border-none focus:ring-0 border-b-2 border-transparent focus:border-[#8b5a2b] rounded-sm px-4 py-3 text-sm appearance-none">
                  <option value="">{franchisesLoading ? "Loading..." : "Select franchise"}</option>
                  {franchises.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {errors.franchise_id && <p className="text-xs text-red-500 mt-1">{errors.franchise_id.message}</p>}
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
                        {isEnabled ? "Tat" : "Bat"}
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
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-medium text-[#201b17]">Multiplier</span>
                        <input type="number" min={0} step="0.01" disabled={!isEnabled} {...register(`tier_rules.${index}.benefit.earn_multiplier`, { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} placeholder="1.0" className="w-16 text-center text-xs bg-white border border-[#d5c3b6] rounded-sm py-1.5 focus:border-[#8b5a2b] focus:ring-0 disabled:bg-[#f5f5f5]" />
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

          <footer className="pt-6 bg-[#f7ece5] px-8 py-6 -mx-8 -mb-8 flex justify-end gap-4 items-center border-t border-[#d5c3b6]/40 sticky bottom-0 max-md:flex-col max-md:items-stretch max-md:px-4 max-md:py-4 max-md:-mx-4 max-md:-mb-4">
            <button type="button" onClick={onClose} disabled={isCreating} className="px-6 py-2.5 text-sm font-bold tracking-wide text-[#51443a] hover:text-[#201b17] transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isCreating} className="px-12 py-3 bg-[#8B5A2B] text-white text-sm font-bold tracking-widest uppercase rounded-md shadow-lg hover:bg-[#6f4315] transition-all disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2">
              {isCreating && <Loader2 size={14} className="animate-spin" />}
              Save Rule
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
