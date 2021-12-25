const isDebug = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export const HTTPAPI = 'http://101.201.50.54:2021';

// export const APIS = 'http://192.168.3.20:2021';
export const APIS = isDebug ? 'http://127.0.0.1:2021' : HTTPAPI;

export const API_HOST = isDebug ? '/base' : HTTPAPI;
