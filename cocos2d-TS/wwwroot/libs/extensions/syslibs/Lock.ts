

export module Lock {

    export class Locker {

        private locked = false;
        private lastCalled: Date = null;

        constructor(public maxLockTime?: number) {
            if (!this.maxLockTime) {
                this.maxLockTime = 30.0;
            }
        }

        public isLocked = (): boolean => {
            var seconds = 0;
            if (this.lastCalled) {
                seconds = ((new Date()).getTime() - this.lastCalled.getTime()) / 1000;
            }
            return this.locked && seconds < this.maxLockTime;
        }

        public lock = (): void => {
            this.locked = true;
            this.lastCalled = new Date();
        }

        public unLock = (): void => {
            this.locked = false;
        }
    }

}