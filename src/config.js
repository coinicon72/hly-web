// export const API_BASE_URL = "http://localhost:8080/api/data/";

export const API_SERVER = "http://localhost:8081";
// export const API_SERVER = "http://175.6.57.235:8081";
export const API_BASE_URL = `${API_SERVER}/api/data/`;

export const EXPORT_BASE_URL = `${API_SERVER}/export`;
// export const EXPORT_BASE_URL = `http://localhost:8081/export`;

// 
export const MODE_ADD = "add";
export const MODE_EDIT = "edit";
export const MODE_VIEW = "view";


// stock
export const TYPE_STOCK_IN = "stock-in";
export const TYPE_STOCK_OUT = "stock-out";
export const TYPE_STOCK_IN_OUT = "stock-in-out";

export const ROUTER_STOCK_IN = `/${TYPE_STOCK_IN}`
export const ROUTER_STOCK_IN_OUT = `/${TYPE_STOCK_IN_OUT}`
export const ROUTER_STOCK_OUT = `/${TYPE_STOCK_OUT}`
