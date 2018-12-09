export const REPO_CHANGING_TYPE_IN = 1;
export const REPO_CHANGING_TYPE_OUT = -1;

export const ORDER_STATUS_PRODUCING = 1;
export const ORDER_STATUS_DELIVERED = 2;
export const ORDER_STATUS_SETTLED = 3;
export const ORDER_STATUS_COLLECTED = 4;


// 
export const MODE_ADD = "add";
export const MODE_EDIT = "edit";
export const MODE_VIEW = "view";


// stock
export const TYPE_STOCK_IN = "stock-in";
export const TYPE_STOCK_OUT = "stock-out";
export const TYPE_STOCK_IN_OUT = "repo-changing";

export const ROUTER_STOCK_IN = `/${TYPE_STOCK_IN}`
export const ROUTER_STOCK_IN_OUT = `/${TYPE_STOCK_IN_OUT}`
export const ROUTER_STOCK_OUT = `/${TYPE_STOCK_OUT}`
