export class Dictionary {
    constructor() {
        this._keyMapTb = null;
        this._valueMapTb = null;
        this.__currId = 0;
        this.kys = new Array();
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.__currId = 2 << (0 | (Math.random() * 10));
    }
    __getKey() {
        this.__currId++;
        return "key_" + this.__currId;
    }
    add(key, value) {
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
    clear() {
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.kys = [];
    }
    containsKey(key) {
        return this.kys.asQueryable().contains(key);
    }
    remove(key) {
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
    get count() {
        return this.kys.length;
    }
    get length() {
        return this.kys.length;
    }
    set(key, value) {
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
    get(key) {
        if (key == null)
            return null;
        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key)
                return this._valueMapTb[keyId];
        }
        return null;
    }
    get keys() {
        return this.kys;
    }
}
//module Linq {
export class Queryable {
    constructor(array) {
        this.array = array;
        this.add = (item) => {
            this.array.push(item);
        };
        this.remove = (item) => {
            this.array.remove(item);
        };
        this.push = (item) => {
            this.array.push(item);
        };
        this.toArray = () => {
            return this.array.slice(0);
        };
        this.distinct = (compareFunction) => {
            var lst = new Queryable();
            this.forEach((t) => {
                if (!lst.contains(t, compareFunction)) {
                    lst.add(t);
                }
            });
            return lst;
        };
        this.where = (whereClause) => {
            if (!whereClause) {
                return new Queryable(this.array.slice(0));
            }
            var lst2 = [];
            this.array.forEach(item => {
                if (whereClause(item)) {
                    lst2.push(item);
                }
            });
            return new Queryable(lst2);
        };
        this.any = (whereClause) => {
            if (!whereClause) {
                return this.array.length > 0;
            }
            return this.where(whereClause).any();
        };
        this.forEach = (func) => {
            var list = this.array;
            if (func == null) {
                return false;
            }
            list.forEach((item, i) => {
                func(item);
            });
            return true;
        };
        this.sum = (func) => {
            if (!func) {
                func = (obj) => {
                    return obj;
                };
            }
            var cnt = 0;
            this.forEach(item => { cnt = cnt + func(item); });
            return cnt;
        };
        this.max = (func) => {
            if (!func) {
                func = (obj) => {
                    return obj;
                };
            }
            var mx = func(this.first());
            this.forEach(item => {
                var v = func(item);
                if (mx < v) {
                    mx = v;
                }
            });
            return mx;
        };
        this.min = (func) => {
            if (!func) {
                func = (obj) => {
                    return obj;
                };
            }
            var mx = func(this.first());
            this.forEach(item => {
                var v = func(item);
                if (mx > v) {
                    mx = v;
                }
            });
            return mx;
        };
        this.select = (selectItem) => {
            if (selectItem == null) {
                return new Queryable(this.array.slice(0));
            }
            return new Queryable(this.array.map(selectItem));
        };
        this.orderBy = (orderBy, isDescending = false) => {
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
        };
        this.orderByFunction = (orderBy, isDescending = false) => {
            isDescending = !!isDescending;
            if (orderBy == null) {
                return new Queryable(this.array.slice(0));
            }
            var clone = this.array.slice(0);
            clone.sort(orderBy);
            if (isDescending) {
                clone = clone.reverse();
            }
            return (new Queryable(clone));
        };
        this.reverse = () => {
            return new Queryable(this.array.reverse());
        };
        this.skip = (count) => {
            if (this.length < count) {
                return new Queryable([]);
            }
            this.array.splice(0, count);
            return new Queryable(this.array.slice(0));
        };
        this.take = (count) => {
            if (this.length == 0) {
                return new Queryable([]);
            }
            if (count > this.length) {
                count = this.length;
            }
            this.array.splice(count - 1, this.length - count);
            return new Queryable(this.array.slice(0));
        };
        this.first = () => {
            if (this.length == 0) {
                return null;
            }
            return this.array[0];
        };
        this.last = () => {
            if (this.length == 0) {
                return null;
            }
            return this.array[this.length - 1];
        };
        this.findItem = (selectItem) => {
            return this.where(selectItem).first();
        };
        this.find = (selectItem) => {
            return this.where(selectItem).first();
        };
        this.contains = (item, compareFunction) => {
            if (!compareFunction) {
                compareFunction = this.equals;
            }
            return this.where((item2) => compareFunction(item, item2)).any();
        };
        this.union = (arr) => {
            if (arr instanceof Queryable) {
                return new Queryable(this.array.concat(arr.toArray()));
            }
            else {
                return new Queryable(this.array.concat(arr));
            }
        };
        this.intersect = (arr, compareFunction) => {
            if (!compareFunction) {
                compareFunction = this.equals;
            }
            var q = null;
            if (arr instanceof Queryable) {
                q = arr;
            }
            else {
                q = new Queryable(this.array.concat(arr));
            }
            var lst2 = [];
            this.forEach((item) => {
                if (q.contains(item, compareFunction)) {
                    lst2.push(item);
                }
            });
            return new Queryable(lst2);
        };
        this.difference = (arr, compareFunction) => {
            if (!compareFunction) {
                compareFunction = this.equals;
            }
            var q = null;
            if (arr instanceof Queryable) {
                q = arr;
            }
            else {
                q = new Queryable(this.array.concat(arr));
            }
            var lst2 = [];
            this.forEach((item) => {
                if (!q.contains(item, compareFunction)) {
                    lst2.push(item);
                }
            });
            return new Queryable(lst2);
        };
        this.copy = () => {
            return new Queryable(this.array.slice(0));
        };
        this.asQueryable = () => {
            return new Queryable(this.array.slice(0));
        };
        if (this.array == null) {
            this.array = new Array();
        }
    }
    equals(x, y) {
        if (x === y)
            return true;
        // if both x and y are null or undefined and exactly the same
        if (!(x instanceof Object) || !(y instanceof Object))
            return false;
        // if they are not strictly equal, they both need to be Objects
        if (x.constructor !== y.constructor)
            return false;
        // they must have the exact same prototype chain, the closest we can do is
        // test there constructor.
        for (var p in x) {
            if (!x.hasOwnProperty(p))
                continue;
            // other properties were tested using x.constructor === y.constructor
            if (!y.hasOwnProperty(p))
                return false;
            // allows to compare x[ p ] and y[ p ] when set to undefined
            if (x[p] === y[p])
                continue;
            // if they have the same strict value or identity then they are equal
            if (typeof (x[p]) !== "object")
                return false;
            // Numbers, Strings, Functions, Booleans must be strictly equal
            if (!this.equals(x[p], y[p]))
                return false;
            // Objects and Arrays must be tested recursively
        }
        for (p in y) {
            if (y.hasOwnProperty(p) && !x.hasOwnProperty(p))
                return false;
            // allows x[ p ] to be set to undefined
        }
        return true;
    }
    get length() {
        return this.array.length;
    }
    get count() {
        return this.array.length;
    }
}
//}
Array.prototype.asQueryable = function () {
    return new Queryable(this);
};
Array.prototype.remove = function (item) {
    var index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
};
//# sourceMappingURL=LinqToJs.js.map