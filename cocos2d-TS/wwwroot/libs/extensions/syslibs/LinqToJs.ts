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



//interface IEnumerable<T> extends Array<T> {

//}

//interface IList<T> extends Array<T> {

//}
//interface List<T> extends Array<T> {

//}
//interface Dictionary<T1, T2> extends Object {

//}

export interface KeyValuePair<tKey, tValue> {
    key: tKey;
    value: tValue;
}

export class Dictionary<keyType, objType> {
    private _keyMapTb: any = null;
    private _valueMapTb: any = null;
    private __currId = 0;

    private kys: Array<keyType> = new Array<keyType>();

    constructor() {
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.__currId = 2 << (0 | (Math.random() * 10));
    }

    private __getKey(): string {
        this.__currId++;
        return "key_" + this.__currId;
    }

    add(key: keyType, value?: objType): void {
        if (key == null)
            return;
        var keyId = this.__getKey();
        this._keyMapTb[keyId] = key;
        this._valueMapTb[keyId] = value;

        this.kys = [];
        var locKeyMapTb = this._keyMapTb;
        for (var ky in locKeyMapTb)
            this.kys.push(locKeyMapTb[ky]);


    }
    clear(): void {
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.kys = [];
    }
    containsKey(key: keyType): boolean {
        return this.kys.asQueryable().contains(key);
    }
    remove(key: keyType): boolean {
        if (key == null)
            return;

        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key) {
                delete this._valueMapTb[keyId];
                delete locKeyMapTb[keyId];
                return;
            }
        }

        this.kys = [];
        var locKeyMapTb = this._keyMapTb;
        for (var ky in locKeyMapTb)
            this.kys.push(locKeyMapTb[ky]);
    }
    get count():number {
        return this.kys.length;
    }
    get length(): number {
        return this.kys.length;
    }
    set(key: keyType, value: objType):void {
        if (key == null)
            return;
        var keyId = this.__getKey();
        this._keyMapTb[keyId] = key;
        this._valueMapTb[keyId] = value;

        this.kys = [];
        var locKeyMapTb = this._keyMapTb;
        for (var ky in locKeyMapTb)
            this.kys.push(locKeyMapTb[ky]);

    }
    get(key: keyType): objType {
        if (key == null)
            return null;

        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key)
                return this._valueMapTb[keyId];
        }
        return null;
    }

    get keys(): Array<keyType> {
        return this.kys;
    }

}



//module Linq {
 export   class Queryable<T> {

        constructor(private array?: Array<any>) {
            if (this.array == null) {
                this.array = new Array<T>();
            }
        }

        private equals(x: any, y: any): boolean {
            if (x === y) return true;
            // if both x and y are null or undefined and exactly the same

            if (!(x instanceof Object) || !(y instanceof Object)) return false;
            // if they are not strictly equal, they both need to be Objects

            if (x.constructor !== y.constructor) return false;
            // they must have the exact same prototype chain, the closest we can do is
            // test there constructor.

            for (var p in x) {
                if (!x.hasOwnProperty(p)) continue;
                // other properties were tested using x.constructor === y.constructor

                if (!y.hasOwnProperty(p)) return false;
                // allows to compare x[ p ] and y[ p ] when set to undefined

                if (x[p] === y[p]) continue;
                // if they have the same strict value or identity then they are equal

                if (typeof (x[p]) !== "object") return false;
                // Numbers, Strings, Functions, Booleans must be strictly equal

                if (!this.equals(x[p], y[p])) return false;
                // Objects and Arrays must be tested recursively
            }

            for (p in y) {
                if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
                // allows x[ p ] to be set to undefined
            }
            return true;
        }

        add = (item: T): void => {
            this.array.push(item);
        }

        remove = (item: T): void => {
            this.array.remove(item);
        }

        push = (item: T): void => {
            this.array.push(item);
        }


        toArray = (): Array<T> => {
            return this.array.slice(0);
        }

        get length(): number {
            return this.array.length;
        }
        get count(): number {
            return this.array.length;
        }

        distinct = (compareFunction?: (obj1: T, obj2: T) => boolean): Queryable<T> => {
            var lst = new Queryable<T>();
            this.forEach((t) => {
                if (!lst.contains(t, compareFunction)) {
                    lst.add(t);
                }
            });

            return lst;
        }

        where = (whereClause: (obj: T) => boolean): Queryable<T> => {
            if (!whereClause) {
                return new Queryable<T>(this.array.slice(0));
            }
            var lst2: any[] = [];
            this.array.forEach(item => {
                if (whereClause(item)) {
                    lst2.push(item);
                }
            });
            return new Queryable<T>(lst2);
        }

        any = (whereClause?: (obj: T) => boolean): boolean => {
            if (!whereClause) {
                return this.array.length > 0;
            }
            return this.where(whereClause).any();
        }

        forEach = (func: (obj: T) => any): boolean => {
            var list = this.array;
            if (func == null) {
                return false;
            }
            list.forEach((item: T, i: number) => {
                func(item);
            });
            return true;
        }

        sum = (func?: (obj: T) => number): number => {
            if (!func) {
                func = (obj: T): number => {
                    return <number><any>obj;
                }
            }
            var cnt: number = 0;
            this.forEach(item => { cnt = cnt + func(item); });
            return cnt;
        }
        max = (func?: (obj: T) => number): number => {
            if (!func) {
                func = (obj: T): number => {
                    return <number><any>obj;
                }
            }
            var mx: number = func(this.first());
            this.forEach(item => {
                var v: number = func(item);
                if (mx < v) {
                    mx = v;
                }
            });
            return mx;
        }
        min = (func?: (obj: T) => number): number => {
            if (!func) {
                func = (obj: T): number => {
                    return <number><any>obj;
                }
            }
            var mx: number = func(this.first());
            this.forEach(item => {
                var v: number = func(item);
                if (mx > v) {
                    mx = v;
                }
            });
            return mx;
        }

        select = <T2>(selectItem: (obj: T) => T2): Queryable<T2> => {
            if (selectItem == null) {
                return new Queryable<T2>(this.array.slice(0));
            }
            return new Queryable<T2>(this.array.map(selectItem));
        }

        orderBy = (orderBy: (obj: T) => any, isDescending = false): Queryable<T> => {

            return this.orderByFunction((ob1, ob2) => {
                var v1 = orderBy(ob1);
                var v2 = orderBy(ob2);
                if (v1 > v2) {
                    return 1;
                }
                if (v1 < v2) {
                    return -1;
                }
                return 0;
            }, isDescending);
        }

        orderByFunction = (orderBy?: (obj1: T, obj2: T) => number, isDescending = false): Queryable<T> => {
            isDescending = !!isDescending;
            if (orderBy == null) {
                return new Queryable<T>(this.array.slice(0));
            }
            var clone = this.array.slice(0);
            clone.sort(orderBy);
            if (isDescending) {
                clone = clone.reverse();
            }
            return (new Queryable<T>(clone));
        }

        reverse = (): Queryable<T> => {
            return new Queryable<T>(this.array.reverse());
        }

        skip = (count: number): Queryable<T> => {
            if (this.length < count) {
                return new Queryable<T>([]);
            }
            this.array.splice(0, count);
            return new Queryable<T>(this.array.slice(0));
        }

        take = (count: number): Queryable<T> => {
            if (this.length == 0) {
                return new Queryable<T>([]);
            }
            if (count > this.length) {
                count = this.length;
            }
            this.array.splice(count - 1, this.length - count)
            return new Queryable<T>(this.array.slice(0));
        }

        first = (): T => {
            if (this.length == 0) {
                return null;
            }
            return this.array[0];
        }
        last = (): T => {
            if (this.length == 0) {
                return null;
            }
            return this.array[this.length - 1];
        }


        findItem = (selectItem: (obj: T) => boolean): T => {
            return this.where(selectItem).first();
        }

        find = (selectItem: (obj: T) => boolean): T => {
            return this.where(selectItem).first();
        }

        contains = (item: T, compareFunction?: (obj1: T, obj2: T) => boolean): boolean => {
            if (!compareFunction) {
                compareFunction = this.equals;
            }
            return this.where((item2: any) => compareFunction(item, item2)).any();
        };

        union = (arr: Array<T> | Queryable<T>): Queryable<T> => {
            if (arr instanceof Queryable) {
                return new Queryable<T>(this.array.concat((<Queryable<T>>arr).toArray()));
            } else {

                return new Queryable<T>(this.array.concat(arr));
            }
        }

        intersect = (arr: Array<T> | Queryable<T>, compareFunction?: (obj1: T, obj2: T) => boolean): Queryable<T> => {
            if (!compareFunction) {
                compareFunction = this.equals;
            }
            var q: Queryable<T> = null;
            if (arr instanceof Queryable) {
                q = <Queryable<T>>arr;
            } else {
                q = new Queryable<T>(this.array.concat(arr));
            }
            var lst2: any[] = [];
            this.forEach((item: any) => {
                if (q.contains(item, compareFunction)) {
                    lst2.push(item);
                }
            });
            return new Queryable<T>(lst2);

        }

        difference = (arr: Array<T> | Queryable<T>, compareFunction?: (obj1: T, obj2: T) => boolean): Queryable<T> => {
            if (!compareFunction) {
                compareFunction = this.equals;
            }
            var q: Queryable<T> = null;
            if (arr instanceof Queryable) {
                q = <Queryable<T>>arr;
            } else {
                q = new Queryable<T>(this.array.concat(arr));
            }
            var lst2: any[] = [];
            this.forEach((item: any) => {
                if (!q.contains(item, compareFunction)) {
                    lst2.push(item);
                }
            });
            return new Queryable<T>(lst2);
        }

        copy = (): Queryable<T> => {
            return new Queryable<T>(this.array.slice(0));
        }
        asQueryable = (): Queryable<T> => {
            return new Queryable<T>(this.array.slice(0));
        }
    }
//}

Array.prototype.asQueryable = function (): Queryable<any> {
    return new Queryable<any>(this);
};
Array.prototype.remove = function (item: any): void {
    var index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
};