import { AxiosRequestConfig, AxiosResponse } from './types'
import InterceptorManager, { Intercepter } from './AxiosInterceptorManager'
import qs from 'qs';
import parseHeaders from 'parse-headers';
let defaults: AxiosRequestConfig = {
    method: 'get',
    timeout: 0,
    url: '',
    headers: {
        common: {
            accept: 'application/json'
        }
    },
    transformRequest: (data: Record<string, any>, headers: any) => {
        headers['common']['conten-type'] = 'application/json';
        return JSON.stringify(data);
    },
    transformResponse: (response: Record<string, any>) => {
        return response.data
    }
}
let getStyleMethods = ['get', 'head', 'delete', 'options'];
getStyleMethods.forEach((method: string) => {
    defaults.headers![method] = {}
})
let postStyleMethods = ['put', 'post', 'patch'];
postStyleMethods.forEach((method: string) => {
    defaults.headers![method] = {
        'content-type': 'application/json'
    }
})
let allMethods = [...getStyleMethods, ...postStyleMethods];
export default class Axios {
    public defaults: AxiosRequestConfig = defaults;
    public interceptors = {
        request: new InterceptorManager<AxiosRequestConfig>(),
        response: new InterceptorManager<AxiosResponse>()
    }
    //T用来限制响应对象response里的data的类型
    request<T = any>(config: AxiosRequestConfig): Promise<AxiosRequestConfig | AxiosResponse<T>> {
        config.headers = Object.assign(this.defaults.headers, config.headers)
        if (config.transformRequest && config.data) {
            config.data = config.transformRequest(config.data, config.headers)
        }
        const chain: Array<Intercepter<AxiosRequestConfig> | Intercepter<AxiosResponse<T>>> = [
            {
                onFulfilled: this.dispatchRequest
            }
        ]
        this.interceptors.request.intercepters.forEach((intercepter: Intercepter<AxiosRequestConfig> | null) => {
            intercepter && chain.unshift(intercepter);
        })
        this.interceptors.response.intercepters.forEach((intercepter: Intercepter<AxiosResponse<T>> | null) => {
            intercepter && chain.push(intercepter);
        })
        let promise: Promise<AxiosRequestConfig | AxiosResponse<T>> = Promise.resolve(config);
        while (chain.length > 0) {
            const { onFulfilled, onRejected } = chain.shift()!;
            promise = promise.then(onFulfilled, onRejected)
        }
        return promise;
    }
    dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return new Promise<AxiosResponse<T>>(function (resolve, reject) {
            let request = new XMLHttpRequest();
            let { method, url, params, headers, data, timeout } = config;
            if (params && typeof params === 'object') {
                //将对象转为请求参数格式 x=??&xx=???
                params = qs.stringify(params)
                url += url.includes('?') ? '&' : '?' + params
            }
            request.open(method, url, true);
            request.responseType = 'json';
            request.onreadystatechange = function () {//状态变更函数
                if (request.readyState === 4) {
                    if (request.status >= 200 && request.status < 300) {

                        let response: AxiosResponse<T> = {
                            data: request.response ? request.response : request.responseText,
                            status: request.status,
                            statusText: request.statusText,
                            headers: parseHeaders(request.getAllResponseHeaders()),
                            config,
                            request
                        }
                        if (config.transformResponse) {
                            response = config.transformResponse(response);
                        }
                        resolve(response);
                    } else if (request.status >= 400 && request.status < 500) {
                        reject(`Error : Request failed with status code ${request.status}\n${request.statusText}`)
                    }
                }
            }
            /* if (headers) {
                for (let key in headers) {
                    request.setRequestHeader(key, headers[key])
                }
            } */
            if (headers) {
                for (let key in headers) {
                    // common 表示所有的请求方法都生效  或者所key是一个方法名
                    /**
                     * {
                     *      headers:{
                     *          common:{accept :'application/json'},
                     *          post:{'content-type':'application/json'}
                     *  }
                     * }
                     */
                    if (key === 'common' || allMethods.includes(key)) {
                        for (let key2 in headers[key]) {
                            request.setRequestHeader(key2, headers[key][key2])
                        }
                    } else {
                        request.setRequestHeader(key, headers[key])
                    }
                }
            }
            let body: string | null = null;
            if (data) {
                body = JSON.stringify(data)
            }
            request.onerror = function () {
                reject('net::ERR_INTERNET_DISCONNECTED')
            }
            if (timeout) {
                request.timeout = timeout;
                request.ontimeout = function () {
                    reject(`Error: Timeout of ${timeout}ms exceeded`)
                }
            }
            if (config.cancelToken) {
                config.cancelToken.then((message: string) => {
                    request.abort();
                    reject(message);
                })
            }
            request.send(body);
        })
    }
};
