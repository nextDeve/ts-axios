import axios, { AxiosResponse, AxiosRequestConfig } from "./axios";
const baseURL = 'http://localhost:8080';
//服务器返回的对象
interface User {
    name: string;
    password: string
}
let user: User = {
    name: 'ts',
    password: '123456'
}
//请求拦截器里面 先加的后执行
console.time('cost')
axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
    if (config.params && config.params.name === 'ts') {
        config.headers!.name += '1';
    }
    return config;
}, error => Promise.reject(error))
let request = axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
    if (config.params && config.params.name === 'ts') {
        config.headers!.name += '2';
    }
    return config;
})
axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
    return new Promise(function (resolve) {
        if (config.params && config.params.name === 'ts') {
            config.headers!.name += "3";
        }
        resolve(config);
    })
    /*     return config; */
    /*     return Promise.reject('请求失败！'); */
})

axios.interceptors.request.eject(request)

let response = axios.interceptors.response.use((response: AxiosResponse) => {
    response.data.name && (response.data.name += '1');
    return response;
})
axios.interceptors.response.use((response: AxiosResponse) => {
    response.data.name && (response.data.name += '2');
    return response;
})
axios.interceptors.response.use((response: AxiosResponse) => {
    response.data.name && (response.data.name += '3');
    return response;
})

axios.interceptors.response.eject(response)

//拦截器测试
let interceptorsConfig: AxiosRequestConfig = {
    method: 'get',
    url: baseURL + '/get',
    headers: {
        'content-Type': 'application/json',
        'name': 'ts'
    },
    params: { name: 'ts' }
}

axios(interceptorsConfig).then((response: AxiosResponse) => {
    console.timeEnd('cost')
    console.log('拦截器测试', response.config.headers);
    return response.data;
}).then((data: any) => {
    console.log('拦截器测试', data);
}).catch((error: any) => {
    console.log('拦截器测试', error);
})


//GET 请求
let getConfig: AxiosRequestConfig = {
    method: 'get',
    url: baseURL + '/get',
    params: user
}
axios(getConfig).then((response: AxiosResponse) => {
    console.log('GET 请求', response);
    return response.data;
}).then((data: any) => {
    console.log('GET 请求', data);
}).catch((error: any) => {
    console.log('GET 请求', error);
})
//POST 请求
let postConfig: AxiosRequestConfig = {
    method: 'post',
    url: baseURL + '/post',
    headers: {
        'Content-Type': 'application/json'
    },
    data: user
}
axios(postConfig).then((response: AxiosResponse) => {
    console.log('POST 请求', response);
    return response.data;
}).then((data: any) => {
    console.log('POST 请求', data);
}).catch((error: any) => {
    console.log('POST 请求', error);
})

//超时请求
let postTimeoutConfig: AxiosRequestConfig = {
    method: 'post',
    url: baseURL + '/post_timeout?timeout=3000',
    timeout: 1000
}
axios(postTimeoutConfig).then((response: AxiosResponse) => {
    console.log('超时请求', response);
    return response.data;
}).then((data: any) => {
    console.log('超时请求', data);
}).catch((error: any) => {
    console.log('超时请求', error);
})

//错误请求
let errorConfig: AxiosRequestConfig = {
    method: 'post',
    url: baseURL + '/post_status?code=400',
}
axios(errorConfig).then((response: AxiosResponse) => {
    console.log('错误请求', response);
    return response.data;
}).then((data) => {
    console.log('错误请求', data);
}).catch((error) => {
    console.log('错误请求', error);
})
//取消请求
const CancelToken = axios.cancelToken;
const source = CancelToken.source();
const isCancel = axios.isCancel;
let cancelConfig: AxiosRequestConfig = {
    method: 'post',
    url: baseURL + '/post_timeout?timeout=4000',
    cancelToken: source.token
}
axios(cancelConfig).then((response: AxiosResponse) => {
    console.log('错误请求', response);
    return response.data;
}).then((data) => {
    console.log('错误请求', data);
}).catch((error) => {
    if (isCancel(error)) {
        console.log('取消请求', error);
    } else {
        console.log('错误请求', error);
    }
})
setTimeout(() => {
    source.cancel('用户取消了请求！')
}, 2000)
