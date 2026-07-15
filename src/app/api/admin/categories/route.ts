import { createSlugCrudHandlers } from "@/lib/admin-crud";

const handlers = createSlugCrudHandlers("categories", "name", "sort_order");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
