// Admin utility API endpoints related to audit logs and inventory
import { httpClient } from "@/apis/httpClient";
import type { SearchResponse } from "@/apis/http.types";

// ======================== Types ========================

export interface AuditLogItem {
	id: string;
	entity_id?: string;
	entity_name?: string;
	action?: "CREATE" | "UPDATE" | "SOFT_DELETE" | "RESTORE" | "CHANGE_STATUS" | "OTHER";
	changed_by?: string;
	from_date?: string;
	to_date?: string;
	created_at?: string;
	updated_at?: string;
	[key: string]: unknown;
}

export interface SearchAuditLogsRequest {
	searchCondition: {
		keyword?: string;
		action?: "CREATE" | "UPDATE" | "SOFT_DELETE" | "RESTORE" | "CHANGE_STATUS" | "OTHER" | "";
		changed_by?: string;
		from_date?: string;
		to_date?: string;
	};
	pageInfo: {
		pageNum: number;
		pageSize: number;
	};
}

export interface SearchLogsByEntityRequest {
	entity_id: string;
	limit: number;
}

export interface AdminRoleSelectItem {
	value: string;
	code: string;
	name: string;
	scope?: "GLOBAL" | "FRANCHISE";
}

export interface InventoryItem {
	id: string;
	product_franchise_id: string;
	quantity: number;
	alert_threshold: number;
	is_active?: boolean;
	is_deleted?: boolean;
	created_at?: string;
	updated_at?: string;
	[key: string]: unknown;
}

export interface CreateInventoryRequest {
	product_franchise_id: string;
	quantity: number;
	alert_threshold: number;
}

export interface SearchInventoriesRequest {
	searchCondition: {
		product_franchise_id?: string;
		franchise_id?: string;
		product_id?: string;
		quantity?: number | string;
		is_active?: boolean | "";
		is_deleted?: boolean;
	};
	pageInfo: {
		pageNum: number;
		pageSize: number;
	};
}

export interface AdjustInventoryRequest {
	product_franchise_id: string;
	change: number;
	reason?: string;
}

export interface InventoryLogItem {
	id: string;
	inventory_id?: string;
	change?: number;
	reason?: string;
	created_at?: string;
	[key: string]: unknown;
}

// ======================== API Endpoints ========================

export const getAuditLogDetail = (logId: string): Promise<AuditLogItem | null> => {
	return httpClient.get<AuditLogItem>({
		url: `/audit-logs/${logId}`,
	});
};

export const searchAuditLogs = (
	data: SearchAuditLogsRequest,
): Promise<SearchResponse<AuditLogItem>> => {
	return httpClient.search<AuditLogItem, SearchAuditLogsRequest>({
		url: "/audit-logs/search",
		data,
	});
};

export const searchAuditLogsByEntity = (
	data: SearchLogsByEntityRequest,
): Promise<AuditLogItem[] | null> => {
	return httpClient.post<AuditLogItem[], SearchLogsByEntityRequest>({
		url: "/audit-logs/search-by-entity",
		data,
	});
};

export const getRolesSelect = (): Promise<AdminRoleSelectItem[] | null> => {
	return httpClient.get<AdminRoleSelectItem[]>({
		url: "/roles/select",
	});
};

export const createInventory = (
	data: CreateInventoryRequest,
): Promise<InventoryItem | null> => {
	return httpClient.post<InventoryItem, CreateInventoryRequest>({
		url: "/inventories",
		data,
	});
};

export const searchInventories = (
	data: SearchInventoriesRequest,
): Promise<SearchResponse<InventoryItem>> => {
	return httpClient.search<InventoryItem, SearchInventoriesRequest>({
		url: "/inventories/search",
		data,
	});
};

export const getInventoryById = (inventoryId: string): Promise<InventoryItem | null> => {
	return httpClient.get<InventoryItem>({
		url: `/inventories/${inventoryId}`,
	});
};

export const deleteInventory = (inventoryId: string): Promise<null> => {
	return httpClient.delete<null>({
		url: `/inventories/${inventoryId}`,
	});
};

export const restoreInventory = (
	inventoryId: string,
): Promise<InventoryItem | null> => {
	return httpClient.patch<InventoryItem>({
		url: `/inventories/${inventoryId}/restore`,
	});
};

export const adjustInventory = (
	data: AdjustInventoryRequest,
): Promise<InventoryItem | null> => {
	return httpClient.post<InventoryItem, AdjustInventoryRequest>({
		url: "/inventories/adjust",
		data,
	});
};

export const getLowStockByFranchise = (
	franchiseId: string,
): Promise<InventoryItem[] | null> => {
	return httpClient.get<InventoryItem[]>({
		url: `/inventories/low-stock/franchise/${franchiseId}`,
	});
};

export const getInventoryLogsByInventoryId = (
	inventoryId: string,
): Promise<InventoryLogItem[] | null> => {
	return httpClient.get<InventoryLogItem[]>({
		url: `/inventories/logs/${inventoryId}`,
	});
};