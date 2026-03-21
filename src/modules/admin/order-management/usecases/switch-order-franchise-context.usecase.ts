import { getProfile, switchContext } from "@/apis/endpoints/auth.api";

export const switchOrderFranchiseContextUsecase = async (franchiseId: string) => {
  await switchContext(franchiseId);

  const updatedProfile = await getProfile();

  if (!updatedProfile) {
    throw new Error("Không thể lấy profile sau khi chuyển chi nhánh");
  }

  return updatedProfile;
};
