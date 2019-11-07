//+++++++++++++++++++++++++something about loader start+++++++++++++++++++++++++++
class ImagePool {
    constructor() {
        this._pool = new Array(10);
        this._MAX = 10;
        this._smallImg = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
        this.count = 0;
    }
    get() {
        if (this.count > 0) {
            this.count--;
            var result = this._pool[this.count];
            this._pool[this.count] = null;
            return result;
        }
        else {
            return new Image();
        }
    }
    put(img) {
        var pool = this._pool;
        if (img instanceof HTMLImageElement && this.count < this._MAX) {
            img.src = this._smallImg;
            pool[this.count] = img;
            this.count++;
        }
    }
}
export var imagePool = new ImagePool();
class Loader {
    constructor() {
    }
}
export var loader = new Loader();
//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++
//# sourceMappingURL=CCLoader.js.map