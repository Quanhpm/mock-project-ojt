export const ADMIN_GLOBAL_FRANCHISE_QUERY_KEY = "franchiseId";

const cloneSearchParams = (search: string | URLSearchParams) => {
  return new URLSearchParams(
    search instanceof URLSearchParams ? search.toString() : search,
  );
};

export const readAdminGlobalFranchiseId = (searchParams: URLSearchParams) => {
  return searchParams.get(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY)?.trim() || null;
};

export const createAdminGlobalFranchiseSearchParams = (
  search: string | URLSearchParams,
  franchiseId: string | null,
) => {
  const nextSearchParams = cloneSearchParams(search);

  if (franchiseId) {
    nextSearchParams.set(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY, franchiseId);
  } else {
    nextSearchParams.delete(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY);
  }

  return nextSearchParams;
};

export const withAdminGlobalFranchiseId = (
  path: string,
  franchiseId: string | null,
) => {
  const targetUrl = new URL(path, "http://codex.local");

  if (franchiseId) {
    targetUrl.searchParams.set(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY, franchiseId);
  } else {
    targetUrl.searchParams.delete(ADMIN_GLOBAL_FRANCHISE_QUERY_KEY);
  }

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
};
