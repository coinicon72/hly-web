// export const API_BASE_URL = "http://localhost:8080/api/data/";

// export const API_SERVER = "http://localhost:8081";
export const API_SERVER = process.env.REACT_APP_SERVER_URL //"http://175.6.57.235:8081";
export const API_BASE_URL = `${API_SERVER}/api`;
export const DATA_API_BASE_URL = `${API_SERVER}/api/data`;

export const EXPORT_BASE_URL = `${API_SERVER}/export`;
// export const EXPORT_BASE_URL = `http://localhost:8081/export`;
