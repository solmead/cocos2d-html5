export var Lock;
(function (Lock) {
    class Locker {
        constructor(maxLockTime) {
            this.maxLockTime = maxLockTime;
            this.locked = false;
            this.lastCalled = null;
            this.isLocked = () => {
                var seconds = 0;
                if (this.lastCalled) {
                    seconds = ((new Date()).getTime() - this.lastCalled.getTime()) / 1000;
                }
                return this.locked && seconds < this.maxLockTime;
            };
            this.lock = () => {
                this.locked = true;
                this.lastCalled = new Date();
            };
            this.unLock = () => {
                this.locked = false;
            };
            if (!this.maxLockTime) {
                this.maxLockTime = 30.0;
            }
        }
    }
    Lock.Locker = Locker;
})(Lock || (Lock = {}));
//# sourceMappingURL=Lock.js.map