import AxiosInterceptorManager from './AxiosInterceptorManager'
export type Methods = 'get' | 'GET' | 'post' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE' | 'option' | 'OPTION'

export interface AxiosRequestConfig {
    url: string;
    method: Methods;
    params?: any;
    headers?: any;
    data?: Record<string, any>;
    timeout?: number;
    transformRequest?: (data: Record<string, any>, headers: any) => any;
    transformResponse?: (data: Record<string, any>) => any;
    cancelToken?: any,
    isCancel?: any;
}
//Axios.prototype.request
//Promise 的泛型T代表此promise变成成功态之后的resolve的值  resolve(value)
export interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>
    interceptors: {
        request: AxiosInterceptorManager<AxiosRequestConfig>;
        response: AxiosInterceptorManager<AxiosResponse>;
    },
    cancelToken?: any,
    isCancel?: any;
}
//泛型 T 代表响应体的类型
export interface AxiosResponse<T = any> {
    data: T,
    status: number,
    statusText: string,
    headers: Record<string, any>,
    config: AxiosRequestConfig,
    request: XMLHttpRequest
}