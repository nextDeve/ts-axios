interface OnFulfilled<V> {
    (value: any): V | Promise<any>
}

interface OnRejected {
    (error: any): any
}

export interface Intercepter<V> {
    onFulfilled?: OnFulfilled<V>, //成功回调
    onRejected?: OnRejected  //失败回调
}

//V : AxiosRequestConfig  AxiosResponse
export default class InterceptorManager<V>{
    public intercepters: Array<Intercepter<V> | null> = []
    //每当调用use的时候，可以向拦截管理器中添加一个拦截器
    use(onFulfilled?: OnFulfilled<V>, onRejected?: OnRejected): number {
        this.intercepters.push({
            onFulfilled,
            onRejected
        })
        return this.intercepters.length - 1;
    }
    eject(id: number) {
        this.intercepters[id] = null;
    }
}
