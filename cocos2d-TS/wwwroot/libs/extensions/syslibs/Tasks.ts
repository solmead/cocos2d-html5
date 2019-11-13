import { Lock } from "./Lock";
import { Queryable } from "./LinqToJs";
import * as $ from "jquery";

declare global {
    interface Window {
        requestAnimFrame: (callback: () => void) => number;
        gl: RenderingContext;
        ENABLE_IMAEG_POOL: boolean
    }
    interface Array<T> {
        asQueryable(): Queryable<T>;
        remove(item: T): void;
    }
}

//export module Tasks {


    export interface IException {
        message: string
    }

    export class EventHandler {

        private onTrigger: Array<((data?: any) => any)> = [];

        constructor() {

        }
        trigger = (data?: any): void => {
            this.onTrigger.forEach((fn) => {
                fn(data);
            });
        };

        addListener = (callback: (data?: any) => any): void => {
            this.onTrigger.push(callback);
        }
    }

    export class Task<TT> {

        public promise:Promise<TT> = null;

        private resolveFunc: (value?: TT | PromiseLike<TT> )=>void;

        constructor(private func: (cback?: (val?: TT) => void) => void) {
            //super((resolve, reject) => {
            //        resolveFunc = resolve;
            //});

            this.promise = new Promise<TT>((resolve) => {
                this.resolveFunc = resolve;
            });

            if (!this.func) {
                this.func = (rFunc: (val?: TT) => void):void => {
                    return rFunc();
                };
            }
            else if (func.length === 0) {
                var bfunc = this.func;
                this.func = (rFunc: (val?: TT) => void) => {
                    bfunc();
                    rFunc();
                };
            }

        }

        public then = (onFulfilled: (value?: TT) => TT | PromiseLike<TT>): Promise<TT> => {
            return this.promise.then(onFulfilled);
        }

        public start = ():void => {
            this.func((val?: TT) => {
                this.resolveFunc(val);
            });
        }


    }

    export interface IDebouncedTask<TT> extends Task<TT> {
        trigger: () => void;
        call: () => void;
    }

    export class RecurringTask {

        private _isRunning: boolean = false;

        private locker = new Lock.Locker();
        private timedCall = (): void => {
            if (!this.isLocked() && this.callback) {
                this.callback();
            }
            if (this.isRunning) {
                setTimeout(() => { this.timedCall(); }, this.timeout);
            }
        }


        constructor(private callback: () => void, private timeout: number, private maxLockTime?: number) {

        }


        get isRunning(): boolean {
            return this._isRunning;
        }
        //private set isRunning(value: boolean) {
        //    this._isRunning = value;
        //}

        setTimeOut = (time: number): void => {
            this.timeout = time;
        }
        lock = (): void => {
            this.locker.lock();
        }
        unLock = (): void => {
            this.locker.unLock();
        }
        isLocked = (): boolean => {
            return this.locker.isLocked();
        }
        start = (): void => {
            if (!this.isRunning) {
                this._isRunning = true;
                this.timedCall();
            }
        }
        stop = (): void => {
            this._isRunning = false;
        }


    }


    export class AnimationTask {

        private _isRunning: boolean = false;


        private draw = (): void => {
            if (this.callback) {
                this.callback();
            }
            window.requestAnimationFrame(() => this.draw());
        }

        private timedCall = (): void => {
            window.requestAnimationFrame(() => this.draw());
        }


        constructor(private callback: () => void) {

        }


        get isRunning(): boolean {
            return this._isRunning;
        }

        start = (): void => {
            if (!this.isRunning) {
                this._isRunning = true;
                this.timedCall();
            }
        }
        stop = (): void => {
            this._isRunning = false;
        }


    }



    export function runAfterWait(waitTimeMilliSeconds: number): IDebouncedTask<void> {

        var t = new Task<void>((cback) => {
            cback();
        }) as IDebouncedTask<void>;

        var timer:number = null;

        var throttle =():void=> {
            clearTimeout(timer);
            timer = window.setTimeout( ()=> {
                    t.start();
                },
                waitTimeMilliSeconds || 500);
        }

        t.trigger = (): void => {
            throttle();
        }
        t.call = (): void => {
            clearTimeout(timer);
            t.start();
        }
        return t;
    }

    export function debounced(): IDebouncedTask<void> {
        var t = new Task<void>((cback) => {
            cback();
        }) as IDebouncedTask<void>;

        t.trigger = (): void => {
            t.start();
        }
        t.call = (): void => {
            t.start();
        }
        return t;
    }
    //export function debouncedAtEnd(waitTimeMilliSeconds: number): IDebouncedTask<void> {
    //    var t = new Task<void>((cback) => {
    //        setTimeout(cback, waitTimeMilliSeconds);
    //    }) as IDebouncedTask<void>;


    //    t.trigger = (): void => {
    //        t.start();
    //    }
    //    t.call = (): void => {
    //        t.start();
    //    }

    //    return t;
    //}

    export function delay(msec: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, msec);
        });
    }

    export function whenReady(): Promise<void> {
        return new Promise<void>((resolve) => {
            $(() => {
                resolve();
            });
        });
    }




    export function whenTrue(trueFunc: () => boolean): Promise<void> {
        if (!trueFunc || trueFunc()) {
            return new Promise<void>((resolve) => {
                resolve();
            });
        }
        return new Promise<void>((resolve) => {
            var obj = new RecurringTask(() => {
                obj.lock();
                if (trueFunc()) {
                    resolve();
                    obj.stop();
                }
                obj.unLock();
            }, 100);
            obj.start();
        });
    }

//}
