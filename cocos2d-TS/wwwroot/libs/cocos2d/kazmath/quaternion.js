import { EPSILON, square } from "./utility";
import { Vec3 } from "./Vec3";
import { degreesToRadians } from "../core/platform/index";
/**
 * The Quaternion class
 * @param {Number|cc.math.Quaternion} [x=0]
 * @param {Number} [y=0]
 * @param {Number} [z=0]
 * @param {Number} [w=0]
 * @constructor
 */
export class Quaternion {
    constructor(_x, _y, _z, _w) {
        if (_x && _y === undefined) {
            _x = _x;
            this.x = _x.x;
            this.y = _x.y;
            this.z = _x.z;
            this.w = _x.w;
        }
        else {
            this.x = _x || 0;
            this.y = _y || 0;
            this.z = _z || 0;
            this.w = _w || 0;
        }
    }
    /**
     * Sets the conjugate of quaternion to self
     * @param {cc.math.Quaternion} quaternion
     */
    conjugate(quaternion) {
        this.x = -quaternion.x;
        this.y = -quaternion.y;
        this.z = -quaternion.z;
        this.w = quaternion.w;
        return this;
    }
    /**
     * Returns the dot product of the current quaternion and parameter quaternion
     * @param quaternion
     * @returns {number}
     */
    dot(quaternion) {
        // A dot B = B dot A = AtBt + AxBx + AyBy + AzBz
        return (this.w * quaternion.w + this.x * quaternion.x + this.y * quaternion.y + this.z * quaternion.z);
    }
    /**
     * Returns the exponential of the quaternion, this function doesn't implemented.
     * @returns {cc.math.Quaternion}
     */
    exponential() {
        return this;
    }
    /**
     * Makes the current quaternion an identity quaternion
     */
    identity() {
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        this.w = 1.0;
        return this;
    }
    /**
     * Inverses the value of current Quaternion
     */
    inverse() {
        var len = this.length();
        if (Math.abs(len) > EPSILON) {
            this.x = 0.0;
            this.y = 0.0;
            this.z = 0.0;
            this.w = 0.0;
            return this;
        }
        ///Get the conjugute and divide by the length
        this.conjugate(this).scale(1.0 / len);
        return this;
    }
    /**
     * Returns true if the quaternion is an identity quaternion
     * @returns {boolean}
     */
    isIdentity() {
        return (this.x === 0.0 && this.y === 0.0 && this.z === 0.0 && this.w === 1.0);
    }
    /**
     * Returns the length of the quaternion
     * @returns {number}
     */
    length() {
        return Math.sqrt(this.lengthSq());
    }
    /**
     * Returns the length of the quaternion squared (prevents a sqrt)
     * @returns {number}
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    /**
     * Uses current quaternion multiplies other quaternion.
     * @param {cc.math.Quaternion} quaternion
     * @returns {cc.math.Quaternion}
     */
    multiply(quaternion) {
        var x = this.x, y = this.y, z = this.z, w = this.w;
        this.w = w * quaternion.w - x * quaternion.x - y * quaternion.y - z * quaternion.z;
        this.x = w * quaternion.x + x * quaternion.w + y * quaternion.z - z * quaternion.y;
        this.y = w * quaternion.y + y * quaternion.w + z * quaternion.x - x * quaternion.z;
        this.z = w * quaternion.z + z * quaternion.w + x * quaternion.y - y * quaternion.x;
        return this;
    }
    /**
     * Normalizes a quaternion
     * @returns {cc.math.Quaternion}
     */
    normalize() {
        var length = this.length();
        if (Math.abs(length) <= EPSILON)
            throw new Error("current quaternion is an invalid value");
        this.scale(1.0 / length);
        return this;
    }
    /**
     * Rotates a quaternion around an axis and an angle
     * @param {cc.math.Vec3} axis
     * @param {Number} angle
     */
    rotationAxis(axis, angle) {
        var rad = angle * 0.5, scale = Math.sin(rad);
        this.w = Math.cos(rad);
        this.x = axis.x * scale;
        this.y = axis.y * scale;
        this.z = axis.z * scale;
        return this;
    }
    /**
     * Interpolate with other quaternions
     * @param {cc.math.Quaternion} quaternion
     * @param {Number} t
     * @returns {cc.math.Quaternion}
     */
    slerp(quaternion, t) {
        if (this.x === quaternion.x && this.y === quaternion.y && this.z === quaternion.z && this.w === quaternion.w) {
            return this;
        }
        var ct = this.dot(quaternion), theta = Math.acos(ct), st = Math.sqrt(1.0 - square(ct));
        var stt = Math.sin(t * theta) / st, somt = Math.sin((1.0 - t) * theta) / st;
        var temp2 = new Quaternion(quaternion);
        this.scale(somt);
        temp2.scale(stt);
        this.add(temp2);
        return this;
    }
    //AxisAndAngle
    /**
     * Get the axis and angle of rotation from a quaternion
     * @returns {{axis: cc.math.Vec3, angle: number}}
     */
    toAxisAndAngle() {
        var tempAngle; // temp angle
        var scale; // temp vars
        var retAngle, retAxis = new Vec3();
        tempAngle = Math.acos(this.w);
        scale = Math.sqrt(square(this.x) + square(this.y) + square(this.z));
        if (((scale > -EPSILON) && scale < EPSILON)
            || (scale < 2 * Math.PI + EPSILON && scale > 2 * Math.PI - EPSILON)) { // angle is 0 or 360 so just simply set axis to 0,0,1 with angle 0
            retAngle = 0.0;
            retAxis.x = 0.0;
            retAxis.y = 0.0;
            retAxis.z = 1.0;
        }
        else {
            retAngle = tempAngle * 2.0; // angle in radians
            retAxis.x = this.x / scale;
            retAxis.y = this.y / scale;
            retAxis.z = this.z / scale;
            retAxis.normalize();
        }
        return { axis: retAxis, angle: retAngle };
    }
    /**
     * Scale a quaternion
     * @param {Number} scale
     */
    scale(scale) {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
        this.w *= scale;
        return this;
    }
    /**
     * Assign current quaternion value from a quaternion.
     * @param {cc.math.Quaternion} quaternion
     * @returns {cc.math.Quaternion}  current quaternion
     */
    assignFrom(quaternion) {
        this.x = quaternion.x;
        this.y = quaternion.y;
        this.z = quaternion.z;
        this.w = quaternion.w;
        return this;
    }
    /**
     * Adds other quaternion
     * @param {cc.math.Quaternion} quaternion
     * @returns {cc.math.Quaternion}
     */
    add(quaternion) {
        this.x += quaternion.x;
        this.y += quaternion.y;
        this.z += quaternion.z;
        this.w += quaternion.w;
        return this;
    }
    /**
     * Current quaternion multiplies a vec3
     * @param {cc.math.Vec3} vec
     * @returns {cc.math.Vec3}
     */
    multiplyVec3(vec) {
        var x = this.x, y = this.y, z = this.z, retVec = new Vec3(vec);
        var uv = new Vec3(x, y, z), uuv = new Vec3(x, y, z);
        uv.cross(vec);
        uuv.cross(uv);
        uv.scale((2.0 * this.w));
        uuv.scale(2.0);
        retVec.add(uv);
        retVec.add(uuv);
        return retVec;
    }
    /**
     *  Creates a quaternion from a rotation matrix
     * @param mat3
     * @returns {*}
     */
    static rotationMatrix(mat3) {
        if (!mat3)
            return null;
        var x, y, z, w;
        var m4x4 = [], mat = mat3.mat, scale = 0.0;
        /*    0 3 6
         1 4 7
         2 5 8

         0 1 2 3
         4 5 6 7
         8 9 10 11
         12 13 14 15*/
        m4x4[0] = mat[0];
        m4x4[1] = mat[3];
        m4x4[2] = mat[6];
        m4x4[4] = mat[1];
        m4x4[5] = mat[4];
        m4x4[6] = mat[7];
        m4x4[8] = mat[2];
        m4x4[9] = mat[5];
        m4x4[10] = mat[8];
        m4x4[15] = 1;
        var pMatrix = m4x4; //[0];
        var diagonal = pMatrix[0] + pMatrix[5] + pMatrix[10] + 1;
        if (diagonal > EPSILON) {
            // Calculate the scale of the diagonal
            scale = Math.sqrt(diagonal) * 2;
            // Calculate the x, y, x and w of the quaternion through the respective equation
            x = (pMatrix[9] - pMatrix[6]) / scale;
            y = (pMatrix[2] - pMatrix[8]) / scale;
            z = (pMatrix[4] - pMatrix[1]) / scale;
            w = 0.25 * scale;
        }
        else {
            // If the first element of the diagonal is the greatest value
            if (pMatrix[0] > pMatrix[5] && pMatrix[0] > pMatrix[10]) {
                // Find the scale according to the first element, and double that value
                scale = Math.sqrt(1.0 + pMatrix[0] - pMatrix[5] - pMatrix[10]) * 2.0;
                // Calculate the x, y, x and w of the quaternion through the respective equation
                x = 0.25 * scale;
                y = (pMatrix[4] + pMatrix[1]) / scale;
                z = (pMatrix[2] + pMatrix[8]) / scale;
                w = (pMatrix[9] - pMatrix[6]) / scale;
            }
            // Else if the second element of the diagonal is the greatest value
            else if (pMatrix[5] > pMatrix[10]) {
                // Find the scale according to the second element, and double that value
                scale = Math.sqrt(1.0 + pMatrix[5] - pMatrix[0] - pMatrix[10]) * 2.0;
                // Calculate the x, y, x and w of the quaternion through the respective equation
                x = (pMatrix[4] + pMatrix[1]) / scale;
                y = 0.25 * scale;
                z = (pMatrix[9] + pMatrix[6]) / scale;
                w = (pMatrix[2] - pMatrix[8]) / scale;
            }
            else {
                // Else the third element of the diagonal is the greatest value
                // Find the scale according to the third element, and double that value
                scale = Math.sqrt(1.0 + pMatrix[10] - pMatrix[0] - pMatrix[5]) * 2.0;
                // Calculate the x, y, x and w of the quaternion through the respective equation
                x = (pMatrix[2] + pMatrix[8]) / scale;
                y = (pMatrix[9] + pMatrix[6]) / scale;
                z = 0.25 * scale;
                w = (pMatrix[4] - pMatrix[1]) / scale;
            }
        }
        return new Quaternion(x, y, z, w);
    }
    /**
     * Create a quaternion from yaw, pitch and roll
     * @param yaw
     * @param pitch
     * @param roll
     * @returns {cc.math.Quaternion}
     */
    static rotationYawPitchRoll(yaw, pitch, roll) {
        var ex, ey, ez; // temp half euler angles
        var cr, cp, cy, sr, sp, sy, cpcy, spsy; // temp vars in roll,pitch yaw
        ex = degreesToRadians(pitch) / 2.0; // convert to rads and half them
        ey = degreesToRadians(yaw) / 2.0;
        ez = degreesToRadians(roll) / 2.0;
        cr = Math.cos(ex);
        cp = Math.cos(ey);
        cy = Math.cos(ez);
        sr = Math.sin(ex);
        sp = Math.sin(ey);
        sy = Math.sin(ez);
        cpcy = cp * cy;
        spsy = sp * sy;
        var ret = new Quaternion();
        ret.w = cr * cpcy + sr * spsy;
        ret.x = sr * cpcy - cr * spsy;
        ret.y = cr * sp * cy + sr * cp * sy;
        ret.z = cr * cp * sy - sr * sp * cy;
        ret.normalize();
        return ret;
    }
    /**
     * <p>
     *     Adapted from the OGRE engine!                                                            <br/>
     *     Gets the shortest arc quaternion to rotate this vector to the destination vector.        <br/>
     *     @remarks                                                                                <br/>
     *     If you call this with a destination vector that is close to the inverse                  <br/>
     *     of this vector, we will rotate 180 degrees around the 'fallbackAxis'                     <br/>
     *     (if specified, or a generated axis if not) since in this case ANY axis of rotation is valid.
     * </p>
     * @param {cc.math.Vec3} vec1
     * @param {cc.math.Vec3} vec2
     * @param {cc.math.Vec3} fallback
     * @returns {cc.math.Quaternion}
     */
    static rotationBetweenVec3(vec1, vec2, fallback) {
        var v1 = new Vec3(vec1), v2 = new Vec3(vec2);
        v1.normalize();
        v2.normalize();
        var a = v1.dot(v2), quaternion = new Quaternion();
        if (a >= 1.0) {
            quaternion.identity();
            return quaternion;
        }
        if (a < (1e-6 - 1.0)) {
            if (Math.abs(fallback.lengthSq()) < EPSILON) {
                quaternion.rotationAxis(fallback, Math.PI);
            }
            else {
                var axis = new Vec3(1.0, 0.0, 0.0);
                axis.cross(vec1);
                //If axis is zero
                if (Math.abs(axis.lengthSq()) < EPSILON) {
                    axis.fill(0.0, 1.0, 0.0);
                    axis.cross(vec1);
                }
                axis.normalize();
                quaternion.rotationAxis(axis, Math.PI);
            }
        }
        else {
            var s = Math.sqrt((1 + a) * 2), invs = 1 / s;
            v1.cross(v2);
            quaternion.x = v1.x * invs;
            quaternion.y = v1.y * invs;
            quaternion.z = v1.z * invs;
            quaternion.w = s * 0.5;
            quaternion.normalize();
        }
        return quaternion;
    }
}
//# sourceMappingURL=quaternion.js.map