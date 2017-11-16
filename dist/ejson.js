(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }
        g.ejson = f();
    }
})(function() {
    var define, module, exports;
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f;
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s;
    }({
        1: [ function(require, module, exports) {
            "use strict";
            var base64 = require("base64-js");
            var ieee754 = require("ieee754");
            exports.Buffer = Buffer;
            exports.SlowBuffer = SlowBuffer;
            exports.INSPECT_MAX_BYTES = 50;
            var K_MAX_LENGTH = 2147483647;
            exports.kMaxLength = K_MAX_LENGTH;
            Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
            if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
                console.error("This browser lacks typed array (Uint8Array) support which is required by " + "`buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
            }
            function typedArraySupport() {
                try {
                    var arr = new Uint8Array(1);
                    arr.__proto__ = {
                        __proto__: Uint8Array.prototype,
                        foo: function() {
                            return 42;
                        }
                    };
                    return arr.foo() === 42;
                } catch (e) {
                    return false;
                }
            }
            function createBuffer(length) {
                if (length > K_MAX_LENGTH) {
                    throw new RangeError("Invalid typed array length");
                }
                var buf = new Uint8Array(length);
                buf.__proto__ = Buffer.prototype;
                return buf;
            }
            function Buffer(arg, encodingOrOffset, length) {
                if (typeof arg === "number") {
                    if (typeof encodingOrOffset === "string") {
                        throw new Error("If encoding is specified then the first argument must be a string");
                    }
                    return allocUnsafe(arg);
                }
                return from(arg, encodingOrOffset, length);
            }
            if (typeof Symbol !== "undefined" && Symbol.species && Buffer[Symbol.species] === Buffer) {
                Object.defineProperty(Buffer, Symbol.species, {
                    value: null,
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
            }
            Buffer.poolSize = 8192;
            function from(value, encodingOrOffset, length) {
                if (typeof value === "number") {
                    throw new TypeError('"value" argument must not be a number');
                }
                if (isArrayBuffer(value)) {
                    return fromArrayBuffer(value, encodingOrOffset, length);
                }
                if (typeof value === "string") {
                    return fromString(value, encodingOrOffset);
                }
                return fromObject(value);
            }
            Buffer.from = function(value, encodingOrOffset, length) {
                return from(value, encodingOrOffset, length);
            };
            Buffer.prototype.__proto__ = Uint8Array.prototype;
            Buffer.__proto__ = Uint8Array;
            function assertSize(size) {
                if (typeof size !== "number") {
                    throw new TypeError('"size" argument must be a number');
                } else if (size < 0) {
                    throw new RangeError('"size" argument must not be negative');
                }
            }
            function alloc(size, fill, encoding) {
                assertSize(size);
                if (size <= 0) {
                    return createBuffer(size);
                }
                if (fill !== undefined) {
                    return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
                }
                return createBuffer(size);
            }
            Buffer.alloc = function(size, fill, encoding) {
                return alloc(size, fill, encoding);
            };
            function allocUnsafe(size) {
                assertSize(size);
                return createBuffer(size < 0 ? 0 : checked(size) | 0);
            }
            Buffer.allocUnsafe = function(size) {
                return allocUnsafe(size);
            };
            Buffer.allocUnsafeSlow = function(size) {
                return allocUnsafe(size);
            };
            function fromString(string, encoding) {
                if (typeof encoding !== "string" || encoding === "") {
                    encoding = "utf8";
                }
                if (!Buffer.isEncoding(encoding)) {
                    throw new TypeError('"encoding" must be a valid string encoding');
                }
                var length = byteLength(string, encoding) | 0;
                var buf = createBuffer(length);
                var actual = buf.write(string, encoding);
                if (actual !== length) {
                    buf = buf.slice(0, actual);
                }
                return buf;
            }
            function fromArrayLike(array) {
                var length = array.length < 0 ? 0 : checked(array.length) | 0;
                var buf = createBuffer(length);
                for (var i = 0; i < length; i += 1) {
                    buf[i] = array[i] & 255;
                }
                return buf;
            }
            function fromArrayBuffer(array, byteOffset, length) {
                if (byteOffset < 0 || array.byteLength < byteOffset) {
                    throw new RangeError("'offset' is out of bounds");
                }
                if (array.byteLength < byteOffset + (length || 0)) {
                    throw new RangeError("'length' is out of bounds");
                }
                var buf;
                if (byteOffset === undefined && length === undefined) {
                    buf = new Uint8Array(array);
                } else if (length === undefined) {
                    buf = new Uint8Array(array, byteOffset);
                } else {
                    buf = new Uint8Array(array, byteOffset, length);
                }
                buf.__proto__ = Buffer.prototype;
                return buf;
            }
            function fromObject(obj) {
                if (Buffer.isBuffer(obj)) {
                    var len = checked(obj.length) | 0;
                    var buf = createBuffer(len);
                    if (buf.length === 0) {
                        return buf;
                    }
                    obj.copy(buf, 0, 0, len);
                    return buf;
                }
                if (obj) {
                    if (isArrayBufferView(obj) || "length" in obj) {
                        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
                            return createBuffer(0);
                        }
                        return fromArrayLike(obj);
                    }
                    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
                        return fromArrayLike(obj.data);
                    }
                }
                throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
            }
            function checked(length) {
                if (length >= K_MAX_LENGTH) {
                    throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
                }
                return length | 0;
            }
            function SlowBuffer(length) {
                if (+length != length) {
                    length = 0;
                }
                return Buffer.alloc(+length);
            }
            Buffer.isBuffer = function isBuffer(b) {
                return b != null && b._isBuffer === true;
            };
            Buffer.compare = function compare(a, b) {
                if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                    throw new TypeError("Arguments must be Buffers");
                }
                if (a === b) return 0;
                var x = a.length;
                var y = b.length;
                for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                    if (a[i] !== b[i]) {
                        x = a[i];
                        y = b[i];
                        break;
                    }
                }
                if (x < y) return -1;
                if (y < x) return 1;
                return 0;
            };
            Buffer.isEncoding = function isEncoding(encoding) {
                switch (String(encoding).toLowerCase()) {
                  case "hex":
                  case "utf8":
                  case "utf-8":
                  case "ascii":
                  case "latin1":
                  case "binary":
                  case "base64":
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return true;

                  default:
                    return false;
                }
            };
            Buffer.concat = function concat(list, length) {
                if (!Array.isArray(list)) {
                    throw new TypeError('"list" argument must be an Array of Buffers');
                }
                if (list.length === 0) {
                    return Buffer.alloc(0);
                }
                var i;
                if (length === undefined) {
                    length = 0;
                    for (i = 0; i < list.length; ++i) {
                        length += list[i].length;
                    }
                }
                var buffer = Buffer.allocUnsafe(length);
                var pos = 0;
                for (i = 0; i < list.length; ++i) {
                    var buf = list[i];
                    if (!Buffer.isBuffer(buf)) {
                        throw new TypeError('"list" argument must be an Array of Buffers');
                    }
                    buf.copy(buffer, pos);
                    pos += buf.length;
                }
                return buffer;
            };
            function byteLength(string, encoding) {
                if (Buffer.isBuffer(string)) {
                    return string.length;
                }
                if (isArrayBufferView(string) || isArrayBuffer(string)) {
                    return string.byteLength;
                }
                if (typeof string !== "string") {
                    string = "" + string;
                }
                var len = string.length;
                if (len === 0) return 0;
                var loweredCase = false;
                for (;;) {
                    switch (encoding) {
                      case "ascii":
                      case "latin1":
                      case "binary":
                        return len;

                      case "utf8":
                      case "utf-8":
                      case undefined:
                        return utf8ToBytes(string).length;

                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return len * 2;

                      case "hex":
                        return len >>> 1;

                      case "base64":
                        return base64ToBytes(string).length;

                      default:
                        if (loweredCase) return utf8ToBytes(string).length;
                        encoding = ("" + encoding).toLowerCase();
                        loweredCase = true;
                    }
                }
            }
            Buffer.byteLength = byteLength;
            function slowToString(encoding, start, end) {
                var loweredCase = false;
                if (start === undefined || start < 0) {
                    start = 0;
                }
                if (start > this.length) {
                    return "";
                }
                if (end === undefined || end > this.length) {
                    end = this.length;
                }
                if (end <= 0) {
                    return "";
                }
                end >>>= 0;
                start >>>= 0;
                if (end <= start) {
                    return "";
                }
                if (!encoding) encoding = "utf8";
                while (true) {
                    switch (encoding) {
                      case "hex":
                        return hexSlice(this, start, end);

                      case "utf8":
                      case "utf-8":
                        return utf8Slice(this, start, end);

                      case "ascii":
                        return asciiSlice(this, start, end);

                      case "latin1":
                      case "binary":
                        return latin1Slice(this, start, end);

                      case "base64":
                        return base64Slice(this, start, end);

                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return utf16leSlice(this, start, end);

                      default:
                        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                        encoding = (encoding + "").toLowerCase();
                        loweredCase = true;
                    }
                }
            }
            Buffer.prototype._isBuffer = true;
            function swap(b, n, m) {
                var i = b[n];
                b[n] = b[m];
                b[m] = i;
            }
            Buffer.prototype.swap16 = function swap16() {
                var len = this.length;
                if (len % 2 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 16-bits");
                }
                for (var i = 0; i < len; i += 2) {
                    swap(this, i, i + 1);
                }
                return this;
            };
            Buffer.prototype.swap32 = function swap32() {
                var len = this.length;
                if (len % 4 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 32-bits");
                }
                for (var i = 0; i < len; i += 4) {
                    swap(this, i, i + 3);
                    swap(this, i + 1, i + 2);
                }
                return this;
            };
            Buffer.prototype.swap64 = function swap64() {
                var len = this.length;
                if (len % 8 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 64-bits");
                }
                for (var i = 0; i < len; i += 8) {
                    swap(this, i, i + 7);
                    swap(this, i + 1, i + 6);
                    swap(this, i + 2, i + 5);
                    swap(this, i + 3, i + 4);
                }
                return this;
            };
            Buffer.prototype.toString = function toString() {
                var length = this.length;
                if (length === 0) return "";
                if (arguments.length === 0) return utf8Slice(this, 0, length);
                return slowToString.apply(this, arguments);
            };
            Buffer.prototype.equals = function equals(b) {
                if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                if (this === b) return true;
                return Buffer.compare(this, b) === 0;
            };
            Buffer.prototype.inspect = function inspect() {
                var str = "";
                var max = exports.INSPECT_MAX_BYTES;
                if (this.length > 0) {
                    str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
                    if (this.length > max) str += " ... ";
                }
                return "<Buffer " + str + ">";
            };
            Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
                if (!Buffer.isBuffer(target)) {
                    throw new TypeError("Argument must be a Buffer");
                }
                if (start === undefined) {
                    start = 0;
                }
                if (end === undefined) {
                    end = target ? target.length : 0;
                }
                if (thisStart === undefined) {
                    thisStart = 0;
                }
                if (thisEnd === undefined) {
                    thisEnd = this.length;
                }
                if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                    throw new RangeError("out of range index");
                }
                if (thisStart >= thisEnd && start >= end) {
                    return 0;
                }
                if (thisStart >= thisEnd) {
                    return -1;
                }
                if (start >= end) {
                    return 1;
                }
                start >>>= 0;
                end >>>= 0;
                thisStart >>>= 0;
                thisEnd >>>= 0;
                if (this === target) return 0;
                var x = thisEnd - thisStart;
                var y = end - start;
                var len = Math.min(x, y);
                var thisCopy = this.slice(thisStart, thisEnd);
                var targetCopy = target.slice(start, end);
                for (var i = 0; i < len; ++i) {
                    if (thisCopy[i] !== targetCopy[i]) {
                        x = thisCopy[i];
                        y = targetCopy[i];
                        break;
                    }
                }
                if (x < y) return -1;
                if (y < x) return 1;
                return 0;
            };
            function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
                if (buffer.length === 0) return -1;
                if (typeof byteOffset === "string") {
                    encoding = byteOffset;
                    byteOffset = 0;
                } else if (byteOffset > 2147483647) {
                    byteOffset = 2147483647;
                } else if (byteOffset < -2147483648) {
                    byteOffset = -2147483648;
                }
                byteOffset = +byteOffset;
                if (numberIsNaN(byteOffset)) {
                    byteOffset = dir ? 0 : buffer.length - 1;
                }
                if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
                if (byteOffset >= buffer.length) {
                    if (dir) return -1; else byteOffset = buffer.length - 1;
                } else if (byteOffset < 0) {
                    if (dir) byteOffset = 0; else return -1;
                }
                if (typeof val === "string") {
                    val = Buffer.from(val, encoding);
                }
                if (Buffer.isBuffer(val)) {
                    if (val.length === 0) {
                        return -1;
                    }
                    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
                } else if (typeof val === "number") {
                    val = val & 255;
                    if (typeof Uint8Array.prototype.indexOf === "function") {
                        if (dir) {
                            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                        } else {
                            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                        }
                    }
                    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
                }
                throw new TypeError("val must be string, number or Buffer");
            }
            function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
                var indexSize = 1;
                var arrLength = arr.length;
                var valLength = val.length;
                if (encoding !== undefined) {
                    encoding = String(encoding).toLowerCase();
                    if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
                        if (arr.length < 2 || val.length < 2) {
                            return -1;
                        }
                        indexSize = 2;
                        arrLength /= 2;
                        valLength /= 2;
                        byteOffset /= 2;
                    }
                }
                function read(buf, i) {
                    if (indexSize === 1) {
                        return buf[i];
                    } else {
                        return buf.readUInt16BE(i * indexSize);
                    }
                }
                var i;
                if (dir) {
                    var foundIndex = -1;
                    for (i = byteOffset; i < arrLength; i++) {
                        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                            if (foundIndex === -1) foundIndex = i;
                            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                        } else {
                            if (foundIndex !== -1) i -= i - foundIndex;
                            foundIndex = -1;
                        }
                    }
                } else {
                    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                    for (i = byteOffset; i >= 0; i--) {
                        var found = true;
                        for (var j = 0; j < valLength; j++) {
                            if (read(arr, i + j) !== read(val, j)) {
                                found = false;
                                break;
                            }
                        }
                        if (found) return i;
                    }
                }
                return -1;
            }
            Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
                return this.indexOf(val, byteOffset, encoding) !== -1;
            };
            Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
                return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
            };
            Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
                return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
            };
            function hexWrite(buf, string, offset, length) {
                offset = Number(offset) || 0;
                var remaining = buf.length - offset;
                if (!length) {
                    length = remaining;
                } else {
                    length = Number(length);
                    if (length > remaining) {
                        length = remaining;
                    }
                }
                var strLen = string.length;
                if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
                if (length > strLen / 2) {
                    length = strLen / 2;
                }
                for (var i = 0; i < length; ++i) {
                    var parsed = parseInt(string.substr(i * 2, 2), 16);
                    if (numberIsNaN(parsed)) return i;
                    buf[offset + i] = parsed;
                }
                return i;
            }
            function utf8Write(buf, string, offset, length) {
                return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
            }
            function asciiWrite(buf, string, offset, length) {
                return blitBuffer(asciiToBytes(string), buf, offset, length);
            }
            function latin1Write(buf, string, offset, length) {
                return asciiWrite(buf, string, offset, length);
            }
            function base64Write(buf, string, offset, length) {
                return blitBuffer(base64ToBytes(string), buf, offset, length);
            }
            function ucs2Write(buf, string, offset, length) {
                return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
            }
            Buffer.prototype.write = function write(string, offset, length, encoding) {
                if (offset === undefined) {
                    encoding = "utf8";
                    length = this.length;
                    offset = 0;
                } else if (length === undefined && typeof offset === "string") {
                    encoding = offset;
                    length = this.length;
                    offset = 0;
                } else if (isFinite(offset)) {
                    offset = offset >>> 0;
                    if (isFinite(length)) {
                        length = length >>> 0;
                        if (encoding === undefined) encoding = "utf8";
                    } else {
                        encoding = length;
                        length = undefined;
                    }
                } else {
                    throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                }
                var remaining = this.length - offset;
                if (length === undefined || length > remaining) length = remaining;
                if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
                    throw new RangeError("Attempt to write outside buffer bounds");
                }
                if (!encoding) encoding = "utf8";
                var loweredCase = false;
                for (;;) {
                    switch (encoding) {
                      case "hex":
                        return hexWrite(this, string, offset, length);

                      case "utf8":
                      case "utf-8":
                        return utf8Write(this, string, offset, length);

                      case "ascii":
                        return asciiWrite(this, string, offset, length);

                      case "latin1":
                      case "binary":
                        return latin1Write(this, string, offset, length);

                      case "base64":
                        return base64Write(this, string, offset, length);

                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return ucs2Write(this, string, offset, length);

                      default:
                        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                        encoding = ("" + encoding).toLowerCase();
                        loweredCase = true;
                    }
                }
            };
            Buffer.prototype.toJSON = function toJSON() {
                return {
                    type: "Buffer",
                    data: Array.prototype.slice.call(this._arr || this, 0)
                };
            };
            function base64Slice(buf, start, end) {
                if (start === 0 && end === buf.length) {
                    return base64.fromByteArray(buf);
                } else {
                    return base64.fromByteArray(buf.slice(start, end));
                }
            }
            function utf8Slice(buf, start, end) {
                end = Math.min(buf.length, end);
                var res = [];
                var i = start;
                while (i < end) {
                    var firstByte = buf[i];
                    var codePoint = null;
                    var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
                    if (i + bytesPerSequence <= end) {
                        var secondByte, thirdByte, fourthByte, tempCodePoint;
                        switch (bytesPerSequence) {
                          case 1:
                            if (firstByte < 128) {
                                codePoint = firstByte;
                            }
                            break;

                          case 2:
                            secondByte = buf[i + 1];
                            if ((secondByte & 192) === 128) {
                                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                                if (tempCodePoint > 127) {
                                    codePoint = tempCodePoint;
                                }
                            }
                            break;

                          case 3:
                            secondByte = buf[i + 1];
                            thirdByte = buf[i + 2];
                            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                                    codePoint = tempCodePoint;
                                }
                            }
                            break;

                          case 4:
                            secondByte = buf[i + 1];
                            thirdByte = buf[i + 2];
                            fourthByte = buf[i + 3];
                            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                                    codePoint = tempCodePoint;
                                }
                            }
                        }
                    }
                    if (codePoint === null) {
                        codePoint = 65533;
                        bytesPerSequence = 1;
                    } else if (codePoint > 65535) {
                        codePoint -= 65536;
                        res.push(codePoint >>> 10 & 1023 | 55296);
                        codePoint = 56320 | codePoint & 1023;
                    }
                    res.push(codePoint);
                    i += bytesPerSequence;
                }
                return decodeCodePointsArray(res);
            }
            var MAX_ARGUMENTS_LENGTH = 4096;
            function decodeCodePointsArray(codePoints) {
                var len = codePoints.length;
                if (len <= MAX_ARGUMENTS_LENGTH) {
                    return String.fromCharCode.apply(String, codePoints);
                }
                var res = "";
                var i = 0;
                while (i < len) {
                    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
                }
                return res;
            }
            function asciiSlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; ++i) {
                    ret += String.fromCharCode(buf[i] & 127);
                }
                return ret;
            }
            function latin1Slice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; ++i) {
                    ret += String.fromCharCode(buf[i]);
                }
                return ret;
            }
            function hexSlice(buf, start, end) {
                var len = buf.length;
                if (!start || start < 0) start = 0;
                if (!end || end < 0 || end > len) end = len;
                var out = "";
                for (var i = start; i < end; ++i) {
                    out += toHex(buf[i]);
                }
                return out;
            }
            function utf16leSlice(buf, start, end) {
                var bytes = buf.slice(start, end);
                var res = "";
                for (var i = 0; i < bytes.length; i += 2) {
                    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
                }
                return res;
            }
            Buffer.prototype.slice = function slice(start, end) {
                var len = this.length;
                start = ~~start;
                end = end === undefined ? len : ~~end;
                if (start < 0) {
                    start += len;
                    if (start < 0) start = 0;
                } else if (start > len) {
                    start = len;
                }
                if (end < 0) {
                    end += len;
                    if (end < 0) end = 0;
                } else if (end > len) {
                    end = len;
                }
                if (end < start) end = start;
                var newBuf = this.subarray(start, end);
                newBuf.__proto__ = Buffer.prototype;
                return newBuf;
            };
            function checkOffset(offset, ext, length) {
                if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
                if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
            }
            Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul;
                }
                return val;
            };
            Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) {
                    checkOffset(offset, byteLength, this.length);
                }
                var val = this[offset + --byteLength];
                var mul = 1;
                while (byteLength > 0 && (mul *= 256)) {
                    val += this[offset + --byteLength] * mul;
                }
                return val;
            };
            Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 1, this.length);
                return this[offset];
            };
            Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] | this[offset + 1] << 8;
            };
            Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] << 8 | this[offset + 1];
            };
            Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 4, this.length);
                return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
            };
            Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
            };
            Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul;
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val;
            };
            Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var i = byteLength;
                var mul = 1;
                var val = this[offset + --i];
                while (i > 0 && (mul *= 256)) {
                    val += this[offset + --i] * mul;
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val;
            };
            Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 1, this.length);
                if (!(this[offset] & 128)) return this[offset];
                return (255 - this[offset] + 1) * -1;
            };
            Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset] | this[offset + 1] << 8;
                return val & 32768 ? val | 4294901760 : val;
            };
            Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset + 1] | this[offset] << 8;
                return val & 32768 ? val | 4294901760 : val;
            };
            Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
            };
            Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
            };
            Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, true, 23, 4);
            };
            Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, false, 23, 4);
            };
            Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, true, 52, 8);
            };
            Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, false, 52, 8);
            };
            function checkInt(buf, value, offset, ext, max, min) {
                if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
                if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
                if (offset + ext > buf.length) throw new RangeError("Index out of range");
            }
            Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) {
                    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                    checkInt(this, value, offset, byteLength, maxBytes, 0);
                }
                var mul = 1;
                var i = 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    this[offset + i] = value / mul & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) {
                    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                    checkInt(this, value, offset, byteLength, maxBytes, 0);
                }
                var i = byteLength - 1;
                var mul = 1;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    this[offset + i] = value / mul & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
                this[offset] = value & 255;
                return offset + 1;
            };
            Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                this[offset] = value & 255;
                this[offset + 1] = value >>> 8;
                return offset + 2;
            };
            Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                this[offset] = value >>> 8;
                this[offset + 1] = value & 255;
                return offset + 2;
            };
            Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                this[offset + 3] = value >>> 24;
                this[offset + 2] = value >>> 16;
                this[offset + 1] = value >>> 8;
                this[offset] = value & 255;
                return offset + 4;
            };
            Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                this[offset] = value >>> 24;
                this[offset + 1] = value >>> 16;
                this[offset + 2] = value >>> 8;
                this[offset + 3] = value & 255;
                return offset + 4;
            };
            Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) {
                    var limit = Math.pow(2, 8 * byteLength - 1);
                    checkInt(this, value, offset, byteLength, limit - 1, -limit);
                }
                var i = 0;
                var mul = 1;
                var sub = 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                        sub = 1;
                    }
                    this[offset + i] = (value / mul >> 0) - sub & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) {
                    var limit = Math.pow(2, 8 * byteLength - 1);
                    checkInt(this, value, offset, byteLength, limit - 1, -limit);
                }
                var i = byteLength - 1;
                var mul = 1;
                var sub = 0;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                        sub = 1;
                    }
                    this[offset + i] = (value / mul >> 0) - sub & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
                if (value < 0) value = 255 + value + 1;
                this[offset] = value & 255;
                return offset + 1;
            };
            Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                this[offset] = value & 255;
                this[offset + 1] = value >>> 8;
                return offset + 2;
            };
            Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                this[offset] = value >>> 8;
                this[offset + 1] = value & 255;
                return offset + 2;
            };
            Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                this[offset] = value & 255;
                this[offset + 1] = value >>> 8;
                this[offset + 2] = value >>> 16;
                this[offset + 3] = value >>> 24;
                return offset + 4;
            };
            Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                if (value < 0) value = 4294967295 + value + 1;
                this[offset] = value >>> 24;
                this[offset + 1] = value >>> 16;
                this[offset + 2] = value >>> 8;
                this[offset + 3] = value & 255;
                return offset + 4;
            };
            function checkIEEE754(buf, value, offset, ext, max, min) {
                if (offset + ext > buf.length) throw new RangeError("Index out of range");
                if (offset < 0) throw new RangeError("Index out of range");
            }
            function writeFloat(buf, value, offset, littleEndian, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
                }
                ieee754.write(buf, value, offset, littleEndian, 23, 4);
                return offset + 4;
            }
            Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                return writeFloat(this, value, offset, true, noAssert);
            };
            Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                return writeFloat(this, value, offset, false, noAssert);
            };
            function writeDouble(buf, value, offset, littleEndian, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
                }
                ieee754.write(buf, value, offset, littleEndian, 52, 8);
                return offset + 8;
            }
            Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                return writeDouble(this, value, offset, true, noAssert);
            };
            Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                return writeDouble(this, value, offset, false, noAssert);
            };
            Buffer.prototype.copy = function copy(target, targetStart, start, end) {
                if (!start) start = 0;
                if (!end && end !== 0) end = this.length;
                if (targetStart >= target.length) targetStart = target.length;
                if (!targetStart) targetStart = 0;
                if (end > 0 && end < start) end = start;
                if (end === start) return 0;
                if (target.length === 0 || this.length === 0) return 0;
                if (targetStart < 0) {
                    throw new RangeError("targetStart out of bounds");
                }
                if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
                if (end < 0) throw new RangeError("sourceEnd out of bounds");
                if (end > this.length) end = this.length;
                if (target.length - targetStart < end - start) {
                    end = target.length - targetStart + start;
                }
                var len = end - start;
                var i;
                if (this === target && start < targetStart && targetStart < end) {
                    for (i = len - 1; i >= 0; --i) {
                        target[i + targetStart] = this[i + start];
                    }
                } else if (len < 1e3) {
                    for (i = 0; i < len; ++i) {
                        target[i + targetStart] = this[i + start];
                    }
                } else {
                    Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
                }
                return len;
            };
            Buffer.prototype.fill = function fill(val, start, end, encoding) {
                if (typeof val === "string") {
                    if (typeof start === "string") {
                        encoding = start;
                        start = 0;
                        end = this.length;
                    } else if (typeof end === "string") {
                        encoding = end;
                        end = this.length;
                    }
                    if (val.length === 1) {
                        var code = val.charCodeAt(0);
                        if (code < 256) {
                            val = code;
                        }
                    }
                    if (encoding !== undefined && typeof encoding !== "string") {
                        throw new TypeError("encoding must be a string");
                    }
                    if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
                        throw new TypeError("Unknown encoding: " + encoding);
                    }
                } else if (typeof val === "number") {
                    val = val & 255;
                }
                if (start < 0 || this.length < start || this.length < end) {
                    throw new RangeError("Out of range index");
                }
                if (end <= start) {
                    return this;
                }
                start = start >>> 0;
                end = end === undefined ? this.length : end >>> 0;
                if (!val) val = 0;
                var i;
                if (typeof val === "number") {
                    for (i = start; i < end; ++i) {
                        this[i] = val;
                    }
                } else {
                    var bytes = Buffer.isBuffer(val) ? val : new Buffer(val, encoding);
                    var len = bytes.length;
                    for (i = 0; i < end - start; ++i) {
                        this[i + start] = bytes[i % len];
                    }
                }
                return this;
            };
            var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
            function base64clean(str) {
                str = str.trim().replace(INVALID_BASE64_RE, "");
                if (str.length < 2) return "";
                while (str.length % 4 !== 0) {
                    str = str + "=";
                }
                return str;
            }
            function toHex(n) {
                if (n < 16) return "0" + n.toString(16);
                return n.toString(16);
            }
            function utf8ToBytes(string, units) {
                units = units || Infinity;
                var codePoint;
                var length = string.length;
                var leadSurrogate = null;
                var bytes = [];
                for (var i = 0; i < length; ++i) {
                    codePoint = string.charCodeAt(i);
                    if (codePoint > 55295 && codePoint < 57344) {
                        if (!leadSurrogate) {
                            if (codePoint > 56319) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue;
                            } else if (i + 1 === length) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue;
                            }
                            leadSurrogate = codePoint;
                            continue;
                        }
                        if (codePoint < 56320) {
                            if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            leadSurrogate = codePoint;
                            continue;
                        }
                        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
                    } else if (leadSurrogate) {
                        if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    }
                    leadSurrogate = null;
                    if (codePoint < 128) {
                        if ((units -= 1) < 0) break;
                        bytes.push(codePoint);
                    } else if (codePoint < 2048) {
                        if ((units -= 2) < 0) break;
                        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
                    } else if (codePoint < 65536) {
                        if ((units -= 3) < 0) break;
                        bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                    } else if (codePoint < 1114112) {
                        if ((units -= 4) < 0) break;
                        bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                    } else {
                        throw new Error("Invalid code point");
                    }
                }
                return bytes;
            }
            function asciiToBytes(str) {
                var byteArray = [];
                for (var i = 0; i < str.length; ++i) {
                    byteArray.push(str.charCodeAt(i) & 255);
                }
                return byteArray;
            }
            function utf16leToBytes(str, units) {
                var c, hi, lo;
                var byteArray = [];
                for (var i = 0; i < str.length; ++i) {
                    if ((units -= 2) < 0) break;
                    c = str.charCodeAt(i);
                    hi = c >> 8;
                    lo = c % 256;
                    byteArray.push(lo);
                    byteArray.push(hi);
                }
                return byteArray;
            }
            function base64ToBytes(str) {
                return base64.toByteArray(base64clean(str));
            }
            function blitBuffer(src, dst, offset, length) {
                for (var i = 0; i < length; ++i) {
                    if (i + offset >= dst.length || i >= src.length) break;
                    dst[i + offset] = src[i];
                }
                return i;
            }
            function isArrayBuffer(obj) {
                return obj instanceof ArrayBuffer || obj != null && obj.constructor != null && obj.constructor.name === "ArrayBuffer" && typeof obj.byteLength === "number";
            }
            function isArrayBufferView(obj) {
                return typeof ArrayBuffer.isView === "function" && ArrayBuffer.isView(obj);
            }
            function numberIsNaN(obj) {
                return obj !== obj;
            }
        }, {
            "base64-js": 2,
            ieee754: 3
        } ],
        2: [ function(require, module, exports) {
            "use strict";
            exports.byteLength = byteLength;
            exports.toByteArray = toByteArray;
            exports.fromByteArray = fromByteArray;
            var lookup = [];
            var revLookup = [];
            var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
            var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
            }
            revLookup["-".charCodeAt(0)] = 62;
            revLookup["_".charCodeAt(0)] = 63;
            function placeHoldersCount(b64) {
                var len = b64.length;
                if (len % 4 > 0) {
                    throw new Error("Invalid string. Length must be a multiple of 4");
                }
                return b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
            }
            function byteLength(b64) {
                return b64.length * 3 / 4 - placeHoldersCount(b64);
            }
            function toByteArray(b64) {
                var i, l, tmp, placeHolders, arr;
                var len = b64.length;
                placeHolders = placeHoldersCount(b64);
                arr = new Arr(len * 3 / 4 - placeHolders);
                l = placeHolders > 0 ? len - 4 : len;
                var L = 0;
                for (i = 0; i < l; i += 4) {
                    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
                    arr[L++] = tmp >> 16 & 255;
                    arr[L++] = tmp >> 8 & 255;
                    arr[L++] = tmp & 255;
                }
                if (placeHolders === 2) {
                    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
                    arr[L++] = tmp & 255;
                } else if (placeHolders === 1) {
                    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
                    arr[L++] = tmp >> 8 & 255;
                    arr[L++] = tmp & 255;
                }
                return arr;
            }
            function tripletToBase64(num) {
                return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
            }
            function encodeChunk(uint8, start, end) {
                var tmp;
                var output = [];
                for (var i = start; i < end; i += 3) {
                    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                    output.push(tripletToBase64(tmp));
                }
                return output.join("");
            }
            function fromByteArray(uint8) {
                var tmp;
                var len = uint8.length;
                var extraBytes = len % 3;
                var output = "";
                var parts = [];
                var maxChunkLength = 16383;
                for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
                }
                if (extraBytes === 1) {
                    tmp = uint8[len - 1];
                    output += lookup[tmp >> 2];
                    output += lookup[tmp << 4 & 63];
                    output += "==";
                } else if (extraBytes === 2) {
                    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                    output += lookup[tmp >> 10];
                    output += lookup[tmp >> 4 & 63];
                    output += lookup[tmp << 2 & 63];
                    output += "=";
                }
                parts.push(output);
                return parts.join("");
            }
        }, {} ],
        3: [ function(require, module, exports) {
            exports.read = function(buffer, offset, isLE, mLen, nBytes) {
                var e, m;
                var eLen = nBytes * 8 - mLen - 1;
                var eMax = (1 << eLen) - 1;
                var eBias = eMax >> 1;
                var nBits = -7;
                var i = isLE ? nBytes - 1 : 0;
                var d = isLE ? -1 : 1;
                var s = buffer[offset + i];
                i += d;
                e = s & (1 << -nBits) - 1;
                s >>= -nBits;
                nBits += eLen;
                for (;nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
                m = e & (1 << -nBits) - 1;
                e >>= -nBits;
                nBits += mLen;
                for (;nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
                if (e === 0) {
                    e = 1 - eBias;
                } else if (e === eMax) {
                    return m ? NaN : (s ? -1 : 1) * Infinity;
                } else {
                    m = m + Math.pow(2, mLen);
                    e = e - eBias;
                }
                return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
            };
            exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
                var e, m, c;
                var eLen = nBytes * 8 - mLen - 1;
                var eMax = (1 << eLen) - 1;
                var eBias = eMax >> 1;
                var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                var i = isLE ? 0 : nBytes - 1;
                var d = isLE ? 1 : -1;
                var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
                value = Math.abs(value);
                if (isNaN(value) || value === Infinity) {
                    m = isNaN(value) ? 1 : 0;
                    e = eMax;
                } else {
                    e = Math.floor(Math.log(value) / Math.LN2);
                    if (value * (c = Math.pow(2, -e)) < 1) {
                        e--;
                        c *= 2;
                    }
                    if (e + eBias >= 1) {
                        value += rt / c;
                    } else {
                        value += rt * Math.pow(2, 1 - eBias);
                    }
                    if (value * c >= 2) {
                        e++;
                        c /= 2;
                    }
                    if (e + eBias >= eMax) {
                        m = 0;
                        e = eMax;
                    } else if (e + eBias >= 1) {
                        m = (value * c - 1) * Math.pow(2, mLen);
                        e = e + eBias;
                    } else {
                        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                        e = 0;
                    }
                }
                for (;mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {}
                e = e << mLen | m;
                eLen += mLen;
                for (;eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {}
                buffer[offset + i - d] |= s * 128;
            };
        }, {} ],
        4: [ function(require, module, exports) {
            var process = module.exports = {};
            var cachedSetTimeout;
            var cachedClearTimeout;
            function defaultSetTimout() {
                throw new Error("setTimeout has not been defined");
            }
            function defaultClearTimeout() {
                throw new Error("clearTimeout has not been defined");
            }
            (function() {
                try {
                    if (typeof setTimeout === "function") {
                        cachedSetTimeout = setTimeout;
                    } else {
                        cachedSetTimeout = defaultSetTimout;
                    }
                } catch (e) {
                    cachedSetTimeout = defaultSetTimout;
                }
                try {
                    if (typeof clearTimeout === "function") {
                        cachedClearTimeout = clearTimeout;
                    } else {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                } catch (e) {
                    cachedClearTimeout = defaultClearTimeout;
                }
            })();
            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    return setTimeout(fun, 0);
                }
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    return cachedSetTimeout(fun, 0);
                } catch (e) {
                    try {
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch (e) {
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }
            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    return clearTimeout(marker);
                }
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    return cachedClearTimeout(marker);
                } catch (e) {
                    try {
                        return cachedClearTimeout.call(null, marker);
                    } catch (e) {
                        return cachedClearTimeout.call(this, marker);
                    }
                }
            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;
            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }
            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;
                var len = queue.length;
                while (len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            process.nextTick = function(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            };
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function() {
                this.fun.apply(null, this.array);
            };
            process.title = "browser";
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = "";
            process.versions = {};
            function noop() {}
            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;
            process.prependListener = noop;
            process.prependOnceListener = noop;
            process.listeners = function(name) {
                return [];
            };
            process.binding = function(name) {
                throw new Error("process.binding is not supported");
            };
            process.cwd = function() {
                return "/";
            };
            process.chdir = function(dir) {
                throw new Error("process.chdir is not supported");
            };
            process.umask = function() {
                return 0;
            };
        }, {} ],
        5: [ function(require, module, exports) {
            if (typeof Object.create === "function") {
                module.exports = function inherits(ctor, superCtor) {
                    ctor.super_ = superCtor;
                    ctor.prototype = Object.create(superCtor.prototype, {
                        constructor: {
                            value: ctor,
                            enumerable: false,
                            writable: true,
                            configurable: true
                        }
                    });
                };
            } else {
                module.exports = function inherits(ctor, superCtor) {
                    ctor.super_ = superCtor;
                    var TempCtor = function() {};
                    TempCtor.prototype = superCtor.prototype;
                    ctor.prototype = new TempCtor();
                    ctor.prototype.constructor = ctor;
                };
            }
        }, {} ],
        6: [ function(require, module, exports) {
            module.exports = function isBuffer(arg) {
                return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function";
            };
        }, {} ],
        7: [ function(require, module, exports) {
            (function(process, global) {
                var formatRegExp = /%[sdj%]/g;
                exports.format = function(f) {
                    if (!isString(f)) {
                        var objects = [];
                        for (var i = 0; i < arguments.length; i++) {
                            objects.push(inspect(arguments[i]));
                        }
                        return objects.join(" ");
                    }
                    var i = 1;
                    var args = arguments;
                    var len = args.length;
                    var str = String(f).replace(formatRegExp, function(x) {
                        if (x === "%%") return "%";
                        if (i >= len) return x;
                        switch (x) {
                          case "%s":
                            return String(args[i++]);

                          case "%d":
                            return Number(args[i++]);

                          case "%j":
                            try {
                                return JSON.stringify(args[i++]);
                            } catch (_) {
                                return "[Circular]";
                            }

                          default:
                            return x;
                        }
                    });
                    for (var x = args[i]; i < len; x = args[++i]) {
                        if (isNull(x) || !isObject(x)) {
                            str += " " + x;
                        } else {
                            str += " " + inspect(x);
                        }
                    }
                    return str;
                };
                exports.deprecate = function(fn, msg) {
                    if (isUndefined(global.process)) {
                        return function() {
                            return exports.deprecate(fn, msg).apply(this, arguments);
                        };
                    }
                    if (process.noDeprecation === true) {
                        return fn;
                    }
                    var warned = false;
                    function deprecated() {
                        if (!warned) {
                            if (process.throwDeprecation) {
                                throw new Error(msg);
                            } else if (process.traceDeprecation) {
                                console.trace(msg);
                            } else {
                                console.error(msg);
                            }
                            warned = true;
                        }
                        return fn.apply(this, arguments);
                    }
                    return deprecated;
                };
                var debugs = {};
                var debugEnviron;
                exports.debuglog = function(set) {
                    if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || "";
                    set = set.toUpperCase();
                    if (!debugs[set]) {
                        if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                            var pid = process.pid;
                            debugs[set] = function() {
                                var msg = exports.format.apply(exports, arguments);
                                console.error("%s %d: %s", set, pid, msg);
                            };
                        } else {
                            debugs[set] = function() {};
                        }
                    }
                    return debugs[set];
                };
                function inspect(obj, opts) {
                    var ctx = {
                        seen: [],
                        stylize: stylizeNoColor
                    };
                    if (arguments.length >= 3) ctx.depth = arguments[2];
                    if (arguments.length >= 4) ctx.colors = arguments[3];
                    if (isBoolean(opts)) {
                        ctx.showHidden = opts;
                    } else if (opts) {
                        exports._extend(ctx, opts);
                    }
                    if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
                    if (isUndefined(ctx.depth)) ctx.depth = 2;
                    if (isUndefined(ctx.colors)) ctx.colors = false;
                    if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
                    if (ctx.colors) ctx.stylize = stylizeWithColor;
                    return formatValue(ctx, obj, ctx.depth);
                }
                exports.inspect = inspect;
                inspect.colors = {
                    bold: [ 1, 22 ],
                    italic: [ 3, 23 ],
                    underline: [ 4, 24 ],
                    inverse: [ 7, 27 ],
                    white: [ 37, 39 ],
                    grey: [ 90, 39 ],
                    black: [ 30, 39 ],
                    blue: [ 34, 39 ],
                    cyan: [ 36, 39 ],
                    green: [ 32, 39 ],
                    magenta: [ 35, 39 ],
                    red: [ 31, 39 ],
                    yellow: [ 33, 39 ]
                };
                inspect.styles = {
                    special: "cyan",
                    number: "yellow",
                    boolean: "yellow",
                    undefined: "grey",
                    null: "bold",
                    string: "green",
                    date: "magenta",
                    regexp: "red"
                };
                function stylizeWithColor(str, styleType) {
                    var style = inspect.styles[styleType];
                    if (style) {
                        return "[" + inspect.colors[style][0] + "m" + str + "[" + inspect.colors[style][1] + "m";
                    } else {
                        return str;
                    }
                }
                function stylizeNoColor(str, styleType) {
                    return str;
                }
                function arrayToHash(array) {
                    var hash = {};
                    array.forEach(function(val, idx) {
                        hash[val] = true;
                    });
                    return hash;
                }
                function formatValue(ctx, value, recurseTimes) {
                    if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
                        var ret = value.inspect(recurseTimes, ctx);
                        if (!isString(ret)) {
                            ret = formatValue(ctx, ret, recurseTimes);
                        }
                        return ret;
                    }
                    var primitive = formatPrimitive(ctx, value);
                    if (primitive) {
                        return primitive;
                    }
                    var keys = Object.keys(value);
                    var visibleKeys = arrayToHash(keys);
                    if (ctx.showHidden) {
                        keys = Object.getOwnPropertyNames(value);
                    }
                    if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
                        return formatError(value);
                    }
                    if (keys.length === 0) {
                        if (isFunction(value)) {
                            var name = value.name ? ": " + value.name : "";
                            return ctx.stylize("[Function" + name + "]", "special");
                        }
                        if (isRegExp(value)) {
                            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                        }
                        if (isDate(value)) {
                            return ctx.stylize(Date.prototype.toString.call(value), "date");
                        }
                        if (isError(value)) {
                            return formatError(value);
                        }
                    }
                    var base = "", array = false, braces = [ "{", "}" ];
                    if (isArray(value)) {
                        array = true;
                        braces = [ "[", "]" ];
                    }
                    if (isFunction(value)) {
                        var n = value.name ? ": " + value.name : "";
                        base = " [Function" + n + "]";
                    }
                    if (isRegExp(value)) {
                        base = " " + RegExp.prototype.toString.call(value);
                    }
                    if (isDate(value)) {
                        base = " " + Date.prototype.toUTCString.call(value);
                    }
                    if (isError(value)) {
                        base = " " + formatError(value);
                    }
                    if (keys.length === 0 && (!array || value.length == 0)) {
                        return braces[0] + base + braces[1];
                    }
                    if (recurseTimes < 0) {
                        if (isRegExp(value)) {
                            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                        } else {
                            return ctx.stylize("[Object]", "special");
                        }
                    }
                    ctx.seen.push(value);
                    var output;
                    if (array) {
                        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
                    } else {
                        output = keys.map(function(key) {
                            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                        });
                    }
                    ctx.seen.pop();
                    return reduceToSingleString(output, base, braces);
                }
                function formatPrimitive(ctx, value) {
                    if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
                    if (isString(value)) {
                        var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                        return ctx.stylize(simple, "string");
                    }
                    if (isNumber(value)) return ctx.stylize("" + value, "number");
                    if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
                    if (isNull(value)) return ctx.stylize("null", "null");
                }
                function formatError(value) {
                    return "[" + Error.prototype.toString.call(value) + "]";
                }
                function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                    var output = [];
                    for (var i = 0, l = value.length; i < l; ++i) {
                        if (hasOwnProperty(value, String(i))) {
                            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
                        } else {
                            output.push("");
                        }
                    }
                    keys.forEach(function(key) {
                        if (!key.match(/^\d+$/)) {
                            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
                        }
                    });
                    return output;
                }
                function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                    var name, str, desc;
                    desc = Object.getOwnPropertyDescriptor(value, key) || {
                        value: value[key]
                    };
                    if (desc.get) {
                        if (desc.set) {
                            str = ctx.stylize("[Getter/Setter]", "special");
                        } else {
                            str = ctx.stylize("[Getter]", "special");
                        }
                    } else {
                        if (desc.set) {
                            str = ctx.stylize("[Setter]", "special");
                        }
                    }
                    if (!hasOwnProperty(visibleKeys, key)) {
                        name = "[" + key + "]";
                    }
                    if (!str) {
                        if (ctx.seen.indexOf(desc.value) < 0) {
                            if (isNull(recurseTimes)) {
                                str = formatValue(ctx, desc.value, null);
                            } else {
                                str = formatValue(ctx, desc.value, recurseTimes - 1);
                            }
                            if (str.indexOf("\n") > -1) {
                                if (array) {
                                    str = str.split("\n").map(function(line) {
                                        return "  " + line;
                                    }).join("\n").substr(2);
                                } else {
                                    str = "\n" + str.split("\n").map(function(line) {
                                        return "   " + line;
                                    }).join("\n");
                                }
                            }
                        } else {
                            str = ctx.stylize("[Circular]", "special");
                        }
                    }
                    if (isUndefined(name)) {
                        if (array && key.match(/^\d+$/)) {
                            return str;
                        }
                        name = JSON.stringify("" + key);
                        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                            name = name.substr(1, name.length - 2);
                            name = ctx.stylize(name, "name");
                        } else {
                            name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
                            name = ctx.stylize(name, "string");
                        }
                    }
                    return name + ": " + str;
                }
                function reduceToSingleString(output, base, braces) {
                    var numLinesEst = 0;
                    var length = output.reduce(function(prev, cur) {
                        numLinesEst++;
                        if (cur.indexOf("\n") >= 0) numLinesEst++;
                        return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
                    }, 0);
                    if (length > 60) {
                        return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
                    }
                    return braces[0] + base + " " + output.join(", ") + " " + braces[1];
                }
                function isArray(ar) {
                    return Array.isArray(ar);
                }
                exports.isArray = isArray;
                function isBoolean(arg) {
                    return typeof arg === "boolean";
                }
                exports.isBoolean = isBoolean;
                function isNull(arg) {
                    return arg === null;
                }
                exports.isNull = isNull;
                function isNullOrUndefined(arg) {
                    return arg == null;
                }
                exports.isNullOrUndefined = isNullOrUndefined;
                function isNumber(arg) {
                    return typeof arg === "number";
                }
                exports.isNumber = isNumber;
                function isString(arg) {
                    return typeof arg === "string";
                }
                exports.isString = isString;
                function isSymbol(arg) {
                    return typeof arg === "symbol";
                }
                exports.isSymbol = isSymbol;
                function isUndefined(arg) {
                    return arg === void 0;
                }
                exports.isUndefined = isUndefined;
                function isRegExp(re) {
                    return isObject(re) && objectToString(re) === "[object RegExp]";
                }
                exports.isRegExp = isRegExp;
                function isObject(arg) {
                    return typeof arg === "object" && arg !== null;
                }
                exports.isObject = isObject;
                function isDate(d) {
                    return isObject(d) && objectToString(d) === "[object Date]";
                }
                exports.isDate = isDate;
                function isError(e) {
                    return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
                }
                exports.isError = isError;
                function isFunction(arg) {
                    return typeof arg === "function";
                }
                exports.isFunction = isFunction;
                function isPrimitive(arg) {
                    return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
                }
                exports.isPrimitive = isPrimitive;
                exports.isBuffer = require("./support/isBuffer");
                function objectToString(o) {
                    return Object.prototype.toString.call(o);
                }
                function pad(n) {
                    return n < 10 ? "0" + n.toString(10) : n.toString(10);
                }
                var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
                function timestamp() {
                    var d = new Date();
                    var time = [ pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()) ].join(":");
                    return [ d.getDate(), months[d.getMonth()], time ].join(" ");
                }
                exports.log = function() {
                    console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments));
                };
                exports.inherits = require("inherits");
                exports._extend = function(origin, add) {
                    if (!add || !isObject(add)) return origin;
                    var keys = Object.keys(add);
                    var i = keys.length;
                    while (i--) {
                        origin[keys[i]] = add[keys[i]];
                    }
                    return origin;
                };
                function hasOwnProperty(obj, prop) {
                    return Object.prototype.hasOwnProperty.call(obj, prop);
                }
            }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {
            "./support/isBuffer": 6,
            _process: 4,
            inherits: 5
        } ],
        8: [ function(require, module, exports) {
            var types = require("./types");
            var strict = require("./modes/strict");
            var isObject = types.isObject;
            var async = require("async");
            var raf = require("raf");
            module.exports = function deserialize(data) {
                if (Array.isArray(data)) {
                    return data.map(deserialize);
                }
                if (!isObject(data)) {
                    return data;
                }
                var keys = Object.keys(data);
                if (keys.length === 0) {
                    return data;
                }
                var caster = strict.deserialize[keys[0]];
                if (!caster) {
                    return keys.reduce(function(schema, key) {
                        schema[key] = deserialize(data[key]);
                        return schema;
                    }, {});
                }
                return caster(data);
            };
            function deserializeAsync(data, fn) {
                if (Array.isArray(data) === true) {
                    async.series(data.map(function(doc) {
                        return function(cb) {
                            raf(function() {
                                deserializeAsync(doc, cb);
                            });
                        };
                    }), fn);
                } else if (isObject(data) === false) {
                    fn(null, data);
                } else {
                    var keys = Object.keys(data);
                    if (keys.length === 0) {
                        fn(null, data);
                    } else {
                        var caster = strict.deserialize[keys[0]];
                        if (caster) {
                            fn(null, caster.call(null, data));
                        } else {
                            var res = {};
                            async.series(keys.map(function(key) {
                                return function(cb) {
                                    deserializeAsync(data[key], function(err, d) {
                                        if (err) {
                                            return cb(err);
                                        }
                                        res[key] = d;
                                        cb();
                                    });
                                };
                            }), function(err) {
                                if (err) {
                                    return fn(err);
                                }
                                fn(null, res);
                            });
                        }
                    }
                }
            }
            module.exports.async = deserializeAsync;
        }, {
            "./modes/strict": 9,
            "./types": 11,
            async: 12,
            raf: 34
        } ],
        9: [ function(require, module, exports) {
            (function(Buffer) {
                var bson = require("bson");
                module.exports = {
                    serialize: {
                        Code: function(v) {
                            if (v.scope) {
                                return {
                                    $code: v.code,
                                    $scope: v.scope
                                };
                            }
                            return {
                                $code: v.code
                            };
                        },
                        ObjectID: function(v) {
                            return {
                                $oid: v.toHexString()
                            };
                        },
                        Binary: function(v) {
                            return {
                                $binary: v.buffer.toString("base64"),
                                $type: v.sub_type.toString(16)
                            };
                        },
                        DBRef: function(v) {
                            var id = typeof v.oid === "object" && module.exports.serialize[v.oid.constructor.name] ? module.exports.serialize[v.oid.constructor.name](v.oid) : v.oid;
                            return {
                                $ref: v.namespace,
                                $id: id
                            };
                        },
                        Timestamp: function(v) {
                            return {
                                $timestamp: {
                                    t: v.low_,
                                    i: v.high_
                                }
                            };
                        },
                        Long: function(v) {
                            return {
                                $numberLong: v.toString()
                            };
                        },
                        Decimal128: function(v) {
                            return {
                                $numberDecimal: v.toString()
                            };
                        },
                        MaxKey: function() {
                            return {
                                $maxKey: 1
                            };
                        },
                        MinKey: function() {
                            return {
                                $minKey: 1
                            };
                        },
                        Date: function(v) {
                            return {
                                $date: v.toISOString()
                            };
                        },
                        RegExp: function(v) {
                            var o = "";
                            if (v.global) {
                                o += "g";
                            }
                            if (v.ignoreCase) {
                                o += "i";
                            }
                            if (v.multiline) {
                                o += "m";
                            }
                            return {
                                $regex: v.source,
                                $options: o
                            };
                        },
                        Undefined: function() {
                            return {
                                $undefined: true
                            };
                        }
                    },
                    deserialize: {
                        $code: function(code) {
                            return bson.Code(code.$code, code.$scope);
                        },
                        $oid: function(data) {
                            return bson.ObjectID(data.$oid);
                        },
                        $binary: function(val) {
                            return bson.Binary(new Buffer(val.$binary, "base64"), parseInt(val.$type, 16));
                        },
                        $ref: function(val) {
                            var id = typeof val.$id === "object" && module.exports.deserialize[Object.keys(val.$id)[0]] ? module.exports.deserialize[Object.keys(val.$id)[0]](val.$id) : val.$id;
                            return bson.DBRef(val.$ref, id);
                        },
                        $timestamp: function(val) {
                            return bson.Timestamp(val.$timestamp.t, val.$timestamp.i);
                        },
                        $numberLong: function(val) {
                            return bson.Long.fromString(val.$numberLong);
                        },
                        $numberDecimal: function(val) {
                            return bson.Decimal128.fromString(val.$numberDecimal);
                        },
                        $maxKey: function() {
                            return bson.MaxKey();
                        },
                        $minKey: function() {
                            return bson.MinKey();
                        },
                        $date: function(val) {
                            var d = new Date();
                            if (isNaN(d.setTime(val.$date))) {
                                d = new Date(val.$date);
                            }
                            return d;
                        },
                        $regex: function(val) {
                            return new RegExp(val.$regex, val.$options);
                        },
                        $undefined: function() {
                            return undefined;
                        }
                    }
                };
            }).call(this, require("buffer").Buffer);
        }, {
            bson: 14,
            buffer: 1
        } ],
        10: [ function(require, module, exports) {
            var strict = require("./modes/strict");
            var types = require("./types");
            var isObject = types.isObject;
            var isFunction = require("lodash.isfunction");
            var transform = require("lodash.transform");
            var type = types.type;
            function serializeArray(arr) {
                return arr.map(serialize.bind(null));
            }
            function serializeTransformer(res, val, key) {
                res[key] = serialize(val);
                return res;
            }
            function serializeObject(obj) {
                var value = obj;
                if (isFunction(obj.serialize)) {
                    value = obj.serialize();
                }
                return transform(value, serializeTransformer, {});
            }
            function serializePrimitive(value) {
                var t = type(value);
                if (strict.serialize.hasOwnProperty(t) === false) {
                    return value;
                }
                var caster = strict.serialize[t];
                return caster(value);
            }
            function serialize(value) {
                if (Array.isArray(value) === true) {
                    return serializeArray(value);
                }
                if (isObject(value) === false) {
                    return serializePrimitive(value);
                }
                return serializeObject(value);
            }
            module.exports = serialize;
        }, {
            "./modes/strict": 9,
            "./types": 11,
            "lodash.isfunction": 32,
            "lodash.transform": 33
        } ],
        11: [ function(require, module, exports) {
            var strict = require("./modes/strict");
            var OBJECT_REGEX = /\[object (\w+)\]/;
            module.exports.type = function type(value) {
                if (value && value._bsontype) {
                    return value._bsontype;
                }
                return OBJECT_REGEX.exec(Object.prototype.toString.call(value))[1];
            };
            module.exports.special = {
                types: Object.keys(strict.serialize),
                keys: Object.keys(strict.deserialize)
            };
            module.exports.isSpecial = function isSpecial(value) {
                return module.exports.special.types.indexOf(module.exports.type(value)) > -1;
            };
            module.exports.isObject = function isObject(value) {
                return module.exports.type(value) === "Object";
            };
        }, {
            "./modes/strict": 9
        } ],
        12: [ function(require, module, exports) {
            (function(process, global) {
                (function(global, factory) {
                    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define([ "exports" ], factory) : factory(global.async = global.async || {});
                })(this, function(exports) {
                    "use strict";
                    function slice(arrayLike, start) {
                        start = start | 0;
                        var newLen = Math.max(arrayLike.length - start, 0);
                        var newArr = Array(newLen);
                        for (var idx = 0; idx < newLen; idx++) {
                            newArr[idx] = arrayLike[start + idx];
                        }
                        return newArr;
                    }
                    var apply = function(fn) {
                        var args = slice(arguments, 1);
                        return function() {
                            var callArgs = slice(arguments);
                            return fn.apply(null, args.concat(callArgs));
                        };
                    };
                    var initialParams = function(fn) {
                        return function() {
                            var args = slice(arguments);
                            var callback = args.pop();
                            fn.call(this, args, callback);
                        };
                    };
                    function isObject(value) {
                        var type = typeof value;
                        return value != null && (type == "object" || type == "function");
                    }
                    var hasSetImmediate = typeof setImmediate === "function" && setImmediate;
                    var hasNextTick = typeof process === "object" && typeof process.nextTick === "function";
                    function fallback(fn) {
                        setTimeout(fn, 0);
                    }
                    function wrap(defer) {
                        return function(fn) {
                            var args = slice(arguments, 1);
                            defer(function() {
                                fn.apply(null, args);
                            });
                        };
                    }
                    var _defer;
                    if (hasSetImmediate) {
                        _defer = setImmediate;
                    } else if (hasNextTick) {
                        _defer = process.nextTick;
                    } else {
                        _defer = fallback;
                    }
                    var setImmediate$1 = wrap(_defer);
                    function asyncify(func) {
                        return initialParams(function(args, callback) {
                            var result;
                            try {
                                result = func.apply(this, args);
                            } catch (e) {
                                return callback(e);
                            }
                            if (isObject(result) && typeof result.then === "function") {
                                result.then(function(value) {
                                    invokeCallback(callback, null, value);
                                }, function(err) {
                                    invokeCallback(callback, err.message ? err : new Error(err));
                                });
                            } else {
                                callback(null, result);
                            }
                        });
                    }
                    function invokeCallback(callback, error, value) {
                        try {
                            callback(error, value);
                        } catch (e) {
                            setImmediate$1(rethrow, e);
                        }
                    }
                    function rethrow(error) {
                        throw error;
                    }
                    var supportsSymbol = typeof Symbol === "function";
                    function isAsync(fn) {
                        return supportsSymbol && fn[Symbol.toStringTag] === "AsyncFunction";
                    }
                    function wrapAsync(asyncFn) {
                        return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
                    }
                    function applyEach$1(eachfn) {
                        return function(fns) {
                            var args = slice(arguments, 1);
                            var go = initialParams(function(args, callback) {
                                var that = this;
                                return eachfn(fns, function(fn, cb) {
                                    wrapAsync(fn).apply(that, args.concat(cb));
                                }, callback);
                            });
                            if (args.length) {
                                return go.apply(this, args);
                            } else {
                                return go;
                            }
                        };
                    }
                    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
                    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
                    var root = freeGlobal || freeSelf || Function("return this")();
                    var Symbol$1 = root.Symbol;
                    var objectProto = Object.prototype;
                    var hasOwnProperty = objectProto.hasOwnProperty;
                    var nativeObjectToString = objectProto.toString;
                    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;
                    function getRawTag(value) {
                        var isOwn = hasOwnProperty.call(value, symToStringTag$1), tag = value[symToStringTag$1];
                        try {
                            value[symToStringTag$1] = undefined;
                            var unmasked = true;
                        } catch (e) {}
                        var result = nativeObjectToString.call(value);
                        if (unmasked) {
                            if (isOwn) {
                                value[symToStringTag$1] = tag;
                            } else {
                                delete value[symToStringTag$1];
                            }
                        }
                        return result;
                    }
                    var objectProto$1 = Object.prototype;
                    var nativeObjectToString$1 = objectProto$1.toString;
                    function objectToString(value) {
                        return nativeObjectToString$1.call(value);
                    }
                    var nullTag = "[object Null]";
                    var undefinedTag = "[object Undefined]";
                    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;
                    function baseGetTag(value) {
                        if (value == null) {
                            return value === undefined ? undefinedTag : nullTag;
                        }
                        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
                    }
                    var asyncTag = "[object AsyncFunction]";
                    var funcTag = "[object Function]";
                    var genTag = "[object GeneratorFunction]";
                    var proxyTag = "[object Proxy]";
                    function isFunction(value) {
                        if (!isObject(value)) {
                            return false;
                        }
                        var tag = baseGetTag(value);
                        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
                    }
                    var MAX_SAFE_INTEGER = 9007199254740991;
                    function isLength(value) {
                        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
                    }
                    function isArrayLike(value) {
                        return value != null && isLength(value.length) && !isFunction(value);
                    }
                    var breakLoop = {};
                    function noop() {}
                    function once(fn) {
                        return function() {
                            if (fn === null) return;
                            var callFn = fn;
                            fn = null;
                            callFn.apply(this, arguments);
                        };
                    }
                    var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator;
                    var getIterator = function(coll) {
                        return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
                    };
                    function baseTimes(n, iteratee) {
                        var index = -1, result = Array(n);
                        while (++index < n) {
                            result[index] = iteratee(index);
                        }
                        return result;
                    }
                    function isObjectLike(value) {
                        return value != null && typeof value == "object";
                    }
                    var argsTag = "[object Arguments]";
                    function baseIsArguments(value) {
                        return isObjectLike(value) && baseGetTag(value) == argsTag;
                    }
                    var objectProto$3 = Object.prototype;
                    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
                    var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;
                    var isArguments = baseIsArguments(function() {
                        return arguments;
                    }()) ? baseIsArguments : function(value) {
                        return isObjectLike(value) && hasOwnProperty$2.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
                    };
                    var isArray = Array.isArray;
                    function stubFalse() {
                        return false;
                    }
                    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
                    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
                    var moduleExports = freeModule && freeModule.exports === freeExports;
                    var Buffer = moduleExports ? root.Buffer : undefined;
                    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
                    var isBuffer = nativeIsBuffer || stubFalse;
                    var MAX_SAFE_INTEGER$1 = 9007199254740991;
                    var reIsUint = /^(?:0|[1-9]\d*)$/;
                    function isIndex(value, length) {
                        length = length == null ? MAX_SAFE_INTEGER$1 : length;
                        return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
                    }
                    var argsTag$1 = "[object Arguments]";
                    var arrayTag = "[object Array]";
                    var boolTag = "[object Boolean]";
                    var dateTag = "[object Date]";
                    var errorTag = "[object Error]";
                    var funcTag$1 = "[object Function]";
                    var mapTag = "[object Map]";
                    var numberTag = "[object Number]";
                    var objectTag = "[object Object]";
                    var regexpTag = "[object RegExp]";
                    var setTag = "[object Set]";
                    var stringTag = "[object String]";
                    var weakMapTag = "[object WeakMap]";
                    var arrayBufferTag = "[object ArrayBuffer]";
                    var dataViewTag = "[object DataView]";
                    var float32Tag = "[object Float32Array]";
                    var float64Tag = "[object Float64Array]";
                    var int8Tag = "[object Int8Array]";
                    var int16Tag = "[object Int16Array]";
                    var int32Tag = "[object Int32Array]";
                    var uint8Tag = "[object Uint8Array]";
                    var uint8ClampedTag = "[object Uint8ClampedArray]";
                    var uint16Tag = "[object Uint16Array]";
                    var uint32Tag = "[object Uint32Array]";
                    var typedArrayTags = {};
                    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
                    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
                    function baseIsTypedArray(value) {
                        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
                    }
                    function baseUnary(func) {
                        return function(value) {
                            return func(value);
                        };
                    }
                    var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
                    var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
                    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
                    var freeProcess = moduleExports$1 && freeGlobal.process;
                    var nodeUtil = function() {
                        try {
                            return freeProcess && freeProcess.binding && freeProcess.binding("util");
                        } catch (e) {}
                    }();
                    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
                    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
                    var objectProto$2 = Object.prototype;
                    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
                    function arrayLikeKeys(value, inherited) {
                        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
                        for (var key in value) {
                            if ((inherited || hasOwnProperty$1.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
                                result.push(key);
                            }
                        }
                        return result;
                    }
                    var objectProto$5 = Object.prototype;
                    function isPrototype(value) {
                        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$5;
                        return value === proto;
                    }
                    function overArg(func, transform) {
                        return function(arg) {
                            return func(transform(arg));
                        };
                    }
                    var nativeKeys = overArg(Object.keys, Object);
                    var objectProto$4 = Object.prototype;
                    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
                    function baseKeys(object) {
                        if (!isPrototype(object)) {
                            return nativeKeys(object);
                        }
                        var result = [];
                        for (var key in Object(object)) {
                            if (hasOwnProperty$3.call(object, key) && key != "constructor") {
                                result.push(key);
                            }
                        }
                        return result;
                    }
                    function keys(object) {
                        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
                    }
                    function createArrayIterator(coll) {
                        var i = -1;
                        var len = coll.length;
                        return function next() {
                            return ++i < len ? {
                                value: coll[i],
                                key: i
                            } : null;
                        };
                    }
                    function createES2015Iterator(iterator) {
                        var i = -1;
                        return function next() {
                            var item = iterator.next();
                            if (item.done) return null;
                            i++;
                            return {
                                value: item.value,
                                key: i
                            };
                        };
                    }
                    function createObjectIterator(obj) {
                        var okeys = keys(obj);
                        var i = -1;
                        var len = okeys.length;
                        return function next() {
                            var key = okeys[++i];
                            return i < len ? {
                                value: obj[key],
                                key: key
                            } : null;
                        };
                    }
                    function iterator(coll) {
                        if (isArrayLike(coll)) {
                            return createArrayIterator(coll);
                        }
                        var iterator = getIterator(coll);
                        return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
                    }
                    function onlyOnce(fn) {
                        return function() {
                            if (fn === null) throw new Error("Callback was already called.");
                            var callFn = fn;
                            fn = null;
                            callFn.apply(this, arguments);
                        };
                    }
                    function _eachOfLimit(limit) {
                        return function(obj, iteratee, callback) {
                            callback = once(callback || noop);
                            if (limit <= 0 || !obj) {
                                return callback(null);
                            }
                            var nextElem = iterator(obj);
                            var done = false;
                            var running = 0;
                            function iterateeCallback(err, value) {
                                running -= 1;
                                if (err) {
                                    done = true;
                                    callback(err);
                                } else if (value === breakLoop || done && running <= 0) {
                                    done = true;
                                    return callback(null);
                                } else {
                                    replenish();
                                }
                            }
                            function replenish() {
                                while (running < limit && !done) {
                                    var elem = nextElem();
                                    if (elem === null) {
                                        done = true;
                                        if (running <= 0) {
                                            callback(null);
                                        }
                                        return;
                                    }
                                    running += 1;
                                    iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
                                }
                            }
                            replenish();
                        };
                    }
                    function eachOfLimit(coll, limit, iteratee, callback) {
                        _eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
                    }
                    function doLimit(fn, limit) {
                        return function(iterable, iteratee, callback) {
                            return fn(iterable, limit, iteratee, callback);
                        };
                    }
                    function eachOfArrayLike(coll, iteratee, callback) {
                        callback = once(callback || noop);
                        var index = 0, completed = 0, length = coll.length;
                        if (length === 0) {
                            callback(null);
                        }
                        function iteratorCallback(err, value) {
                            if (err) {
                                callback(err);
                            } else if (++completed === length || value === breakLoop) {
                                callback(null);
                            }
                        }
                        for (;index < length; index++) {
                            iteratee(coll[index], index, onlyOnce(iteratorCallback));
                        }
                    }
                    var eachOfGeneric = doLimit(eachOfLimit, Infinity);
                    var eachOf = function(coll, iteratee, callback) {
                        var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
                        eachOfImplementation(coll, wrapAsync(iteratee), callback);
                    };
                    function doParallel(fn) {
                        return function(obj, iteratee, callback) {
                            return fn(eachOf, obj, wrapAsync(iteratee), callback);
                        };
                    }
                    function _asyncMap(eachfn, arr, iteratee, callback) {
                        callback = callback || noop;
                        arr = arr || [];
                        var results = [];
                        var counter = 0;
                        var _iteratee = wrapAsync(iteratee);
                        eachfn(arr, function(value, _, callback) {
                            var index = counter++;
                            _iteratee(value, function(err, v) {
                                results[index] = v;
                                callback(err);
                            });
                        }, function(err) {
                            callback(err, results);
                        });
                    }
                    var map = doParallel(_asyncMap);
                    var applyEach = applyEach$1(map);
                    function doParallelLimit(fn) {
                        return function(obj, limit, iteratee, callback) {
                            return fn(_eachOfLimit(limit), obj, wrapAsync(iteratee), callback);
                        };
                    }
                    var mapLimit = doParallelLimit(_asyncMap);
                    var mapSeries = doLimit(mapLimit, 1);
                    var applyEachSeries = applyEach$1(mapSeries);
                    function arrayEach(array, iteratee) {
                        var index = -1, length = array == null ? 0 : array.length;
                        while (++index < length) {
                            if (iteratee(array[index], index, array) === false) {
                                break;
                            }
                        }
                        return array;
                    }
                    function createBaseFor(fromRight) {
                        return function(object, iteratee, keysFunc) {
                            var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
                            while (length--) {
                                var key = props[fromRight ? length : ++index];
                                if (iteratee(iterable[key], key, iterable) === false) {
                                    break;
                                }
                            }
                            return object;
                        };
                    }
                    var baseFor = createBaseFor();
                    function baseForOwn(object, iteratee) {
                        return object && baseFor(object, iteratee, keys);
                    }
                    function baseFindIndex(array, predicate, fromIndex, fromRight) {
                        var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
                        while (fromRight ? index-- : ++index < length) {
                            if (predicate(array[index], index, array)) {
                                return index;
                            }
                        }
                        return -1;
                    }
                    function baseIsNaN(value) {
                        return value !== value;
                    }
                    function strictIndexOf(array, value, fromIndex) {
                        var index = fromIndex - 1, length = array.length;
                        while (++index < length) {
                            if (array[index] === value) {
                                return index;
                            }
                        }
                        return -1;
                    }
                    function baseIndexOf(array, value, fromIndex) {
                        return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
                    }
                    var auto = function(tasks, concurrency, callback) {
                        if (typeof concurrency === "function") {
                            callback = concurrency;
                            concurrency = null;
                        }
                        callback = once(callback || noop);
                        var keys$$1 = keys(tasks);
                        var numTasks = keys$$1.length;
                        if (!numTasks) {
                            return callback(null);
                        }
                        if (!concurrency) {
                            concurrency = numTasks;
                        }
                        var results = {};
                        var runningTasks = 0;
                        var hasError = false;
                        var listeners = Object.create(null);
                        var readyTasks = [];
                        var readyToCheck = [];
                        var uncheckedDependencies = {};
                        baseForOwn(tasks, function(task, key) {
                            if (!isArray(task)) {
                                enqueueTask(key, [ task ]);
                                readyToCheck.push(key);
                                return;
                            }
                            var dependencies = task.slice(0, task.length - 1);
                            var remainingDependencies = dependencies.length;
                            if (remainingDependencies === 0) {
                                enqueueTask(key, task);
                                readyToCheck.push(key);
                                return;
                            }
                            uncheckedDependencies[key] = remainingDependencies;
                            arrayEach(dependencies, function(dependencyName) {
                                if (!tasks[dependencyName]) {
                                    throw new Error("async.auto task `" + key + "` has a non-existent dependency `" + dependencyName + "` in " + dependencies.join(", "));
                                }
                                addListener(dependencyName, function() {
                                    remainingDependencies--;
                                    if (remainingDependencies === 0) {
                                        enqueueTask(key, task);
                                    }
                                });
                            });
                        });
                        checkForDeadlocks();
                        processQueue();
                        function enqueueTask(key, task) {
                            readyTasks.push(function() {
                                runTask(key, task);
                            });
                        }
                        function processQueue() {
                            if (readyTasks.length === 0 && runningTasks === 0) {
                                return callback(null, results);
                            }
                            while (readyTasks.length && runningTasks < concurrency) {
                                var run = readyTasks.shift();
                                run();
                            }
                        }
                        function addListener(taskName, fn) {
                            var taskListeners = listeners[taskName];
                            if (!taskListeners) {
                                taskListeners = listeners[taskName] = [];
                            }
                            taskListeners.push(fn);
                        }
                        function taskComplete(taskName) {
                            var taskListeners = listeners[taskName] || [];
                            arrayEach(taskListeners, function(fn) {
                                fn();
                            });
                            processQueue();
                        }
                        function runTask(key, task) {
                            if (hasError) return;
                            var taskCallback = onlyOnce(function(err, result) {
                                runningTasks--;
                                if (arguments.length > 2) {
                                    result = slice(arguments, 1);
                                }
                                if (err) {
                                    var safeResults = {};
                                    baseForOwn(results, function(val, rkey) {
                                        safeResults[rkey] = val;
                                    });
                                    safeResults[key] = result;
                                    hasError = true;
                                    listeners = Object.create(null);
                                    callback(err, safeResults);
                                } else {
                                    results[key] = result;
                                    taskComplete(key);
                                }
                            });
                            runningTasks++;
                            var taskFn = wrapAsync(task[task.length - 1]);
                            if (task.length > 1) {
                                taskFn(results, taskCallback);
                            } else {
                                taskFn(taskCallback);
                            }
                        }
                        function checkForDeadlocks() {
                            var currentTask;
                            var counter = 0;
                            while (readyToCheck.length) {
                                currentTask = readyToCheck.pop();
                                counter++;
                                arrayEach(getDependents(currentTask), function(dependent) {
                                    if (--uncheckedDependencies[dependent] === 0) {
                                        readyToCheck.push(dependent);
                                    }
                                });
                            }
                            if (counter !== numTasks) {
                                throw new Error("async.auto cannot execute tasks due to a recursive dependency");
                            }
                        }
                        function getDependents(taskName) {
                            var result = [];
                            baseForOwn(tasks, function(task, key) {
                                if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                                    result.push(key);
                                }
                            });
                            return result;
                        }
                    };
                    function arrayMap(array, iteratee) {
                        var index = -1, length = array == null ? 0 : array.length, result = Array(length);
                        while (++index < length) {
                            result[index] = iteratee(array[index], index, array);
                        }
                        return result;
                    }
                    var symbolTag = "[object Symbol]";
                    function isSymbol(value) {
                        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
                    }
                    var INFINITY = 1 / 0;
                    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
                    var symbolToString = symbolProto ? symbolProto.toString : undefined;
                    function baseToString(value) {
                        if (typeof value == "string") {
                            return value;
                        }
                        if (isArray(value)) {
                            return arrayMap(value, baseToString) + "";
                        }
                        if (isSymbol(value)) {
                            return symbolToString ? symbolToString.call(value) : "";
                        }
                        var result = value + "";
                        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
                    }
                    function baseSlice(array, start, end) {
                        var index = -1, length = array.length;
                        if (start < 0) {
                            start = -start > length ? 0 : length + start;
                        }
                        end = end > length ? length : end;
                        if (end < 0) {
                            end += length;
                        }
                        length = start > end ? 0 : end - start >>> 0;
                        start >>>= 0;
                        var result = Array(length);
                        while (++index < length) {
                            result[index] = array[index + start];
                        }
                        return result;
                    }
                    function castSlice(array, start, end) {
                        var length = array.length;
                        end = end === undefined ? length : end;
                        return !start && end >= length ? array : baseSlice(array, start, end);
                    }
                    function charsEndIndex(strSymbols, chrSymbols) {
                        var index = strSymbols.length;
                        while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
                        return index;
                    }
                    function charsStartIndex(strSymbols, chrSymbols) {
                        var index = -1, length = strSymbols.length;
                        while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
                        return index;
                    }
                    function asciiToArray(string) {
                        return string.split("");
                    }
                    var rsAstralRange = "\\ud800-\\udfff";
                    var rsComboMarksRange = "\\u0300-\\u036f";
                    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
                    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
                    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
                    var rsVarRange = "\\ufe0e\\ufe0f";
                    var rsZWJ = "\\u200d";
                    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
                    function hasUnicode(string) {
                        return reHasUnicode.test(string);
                    }
                    var rsAstralRange$1 = "\\ud800-\\udfff";
                    var rsComboMarksRange$1 = "\\u0300-\\u036f";
                    var reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f";
                    var rsComboSymbolsRange$1 = "\\u20d0-\\u20ff";
                    var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
                    var rsVarRange$1 = "\\ufe0e\\ufe0f";
                    var rsAstral = "[" + rsAstralRange$1 + "]";
                    var rsCombo = "[" + rsComboRange$1 + "]";
                    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
                    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
                    var rsNonAstral = "[^" + rsAstralRange$1 + "]";
                    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
                    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
                    var rsZWJ$1 = "\\u200d";
                    var reOptMod = rsModifier + "?";
                    var rsOptVar = "[" + rsVarRange$1 + "]?";
                    var rsOptJoin = "(?:" + rsZWJ$1 + "(?:" + [ rsNonAstral, rsRegional, rsSurrPair ].join("|") + ")" + rsOptVar + reOptMod + ")*";
                    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
                    var rsSymbol = "(?:" + [ rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral ].join("|") + ")";
                    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
                    function unicodeToArray(string) {
                        return string.match(reUnicode) || [];
                    }
                    function stringToArray(string) {
                        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
                    }
                    function toString(value) {
                        return value == null ? "" : baseToString(value);
                    }
                    var reTrim = /^\s+|\s+$/g;
                    function trim(string, chars, guard) {
                        string = toString(string);
                        if (string && (guard || chars === undefined)) {
                            return string.replace(reTrim, "");
                        }
                        if (!string || !(chars = baseToString(chars))) {
                            return string;
                        }
                        var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
                        return castSlice(strSymbols, start, end).join("");
                    }
                    var FN_ARGS = /^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
                    var FN_ARG_SPLIT = /,/;
                    var FN_ARG = /(=.+)?(\s*)$/;
                    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
                    function parseParams(func) {
                        func = func.toString().replace(STRIP_COMMENTS, "");
                        func = func.match(FN_ARGS)[2].replace(" ", "");
                        func = func ? func.split(FN_ARG_SPLIT) : [];
                        func = func.map(function(arg) {
                            return trim(arg.replace(FN_ARG, ""));
                        });
                        return func;
                    }
                    function autoInject(tasks, callback) {
                        var newTasks = {};
                        baseForOwn(tasks, function(taskFn, key) {
                            var params;
                            var fnIsAsync = isAsync(taskFn);
                            var hasNoDeps = !fnIsAsync && taskFn.length === 1 || fnIsAsync && taskFn.length === 0;
                            if (isArray(taskFn)) {
                                params = taskFn.slice(0, -1);
                                taskFn = taskFn[taskFn.length - 1];
                                newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
                            } else if (hasNoDeps) {
                                newTasks[key] = taskFn;
                            } else {
                                params = parseParams(taskFn);
                                if (taskFn.length === 0 && !fnIsAsync && params.length === 0) {
                                    throw new Error("autoInject task functions require explicit parameters.");
                                }
                                if (!fnIsAsync) params.pop();
                                newTasks[key] = params.concat(newTask);
                            }
                            function newTask(results, taskCb) {
                                var newArgs = arrayMap(params, function(name) {
                                    return results[name];
                                });
                                newArgs.push(taskCb);
                                wrapAsync(taskFn).apply(null, newArgs);
                            }
                        });
                        auto(newTasks, callback);
                    }
                    function DLL() {
                        this.head = this.tail = null;
                        this.length = 0;
                    }
                    function setInitial(dll, node) {
                        dll.length = 1;
                        dll.head = dll.tail = node;
                    }
                    DLL.prototype.removeLink = function(node) {
                        if (node.prev) node.prev.next = node.next; else this.head = node.next;
                        if (node.next) node.next.prev = node.prev; else this.tail = node.prev;
                        node.prev = node.next = null;
                        this.length -= 1;
                        return node;
                    };
                    DLL.prototype.empty = function() {
                        while (this.head) this.shift();
                        return this;
                    };
                    DLL.prototype.insertAfter = function(node, newNode) {
                        newNode.prev = node;
                        newNode.next = node.next;
                        if (node.next) node.next.prev = newNode; else this.tail = newNode;
                        node.next = newNode;
                        this.length += 1;
                    };
                    DLL.prototype.insertBefore = function(node, newNode) {
                        newNode.prev = node.prev;
                        newNode.next = node;
                        if (node.prev) node.prev.next = newNode; else this.head = newNode;
                        node.prev = newNode;
                        this.length += 1;
                    };
                    DLL.prototype.unshift = function(node) {
                        if (this.head) this.insertBefore(this.head, node); else setInitial(this, node);
                    };
                    DLL.prototype.push = function(node) {
                        if (this.tail) this.insertAfter(this.tail, node); else setInitial(this, node);
                    };
                    DLL.prototype.shift = function() {
                        return this.head && this.removeLink(this.head);
                    };
                    DLL.prototype.pop = function() {
                        return this.tail && this.removeLink(this.tail);
                    };
                    DLL.prototype.toArray = function() {
                        var arr = Array(this.length);
                        var curr = this.head;
                        for (var idx = 0; idx < this.length; idx++) {
                            arr[idx] = curr.data;
                            curr = curr.next;
                        }
                        return arr;
                    };
                    DLL.prototype.remove = function(testFn) {
                        var curr = this.head;
                        while (!!curr) {
                            var next = curr.next;
                            if (testFn(curr)) {
                                this.removeLink(curr);
                            }
                            curr = next;
                        }
                        return this;
                    };
                    function queue(worker, concurrency, payload) {
                        if (concurrency == null) {
                            concurrency = 1;
                        } else if (concurrency === 0) {
                            throw new Error("Concurrency must not be zero");
                        }
                        var _worker = wrapAsync(worker);
                        var numRunning = 0;
                        var workersList = [];
                        var processingScheduled = false;
                        function _insert(data, insertAtFront, callback) {
                            if (callback != null && typeof callback !== "function") {
                                throw new Error("task callback must be a function");
                            }
                            q.started = true;
                            if (!isArray(data)) {
                                data = [ data ];
                            }
                            if (data.length === 0 && q.idle()) {
                                return setImmediate$1(function() {
                                    q.drain();
                                });
                            }
                            for (var i = 0, l = data.length; i < l; i++) {
                                var item = {
                                    data: data[i],
                                    callback: callback || noop
                                };
                                if (insertAtFront) {
                                    q._tasks.unshift(item);
                                } else {
                                    q._tasks.push(item);
                                }
                            }
                            if (!processingScheduled) {
                                processingScheduled = true;
                                setImmediate$1(function() {
                                    processingScheduled = false;
                                    q.process();
                                });
                            }
                        }
                        function _next(tasks) {
                            return function(err) {
                                numRunning -= 1;
                                for (var i = 0, l = tasks.length; i < l; i++) {
                                    var task = tasks[i];
                                    var index = baseIndexOf(workersList, task, 0);
                                    if (index === 0) {
                                        workersList.shift();
                                    } else if (index > 0) {
                                        workersList.splice(index, 1);
                                    }
                                    task.callback.apply(task, arguments);
                                    if (err != null) {
                                        q.error(err, task.data);
                                    }
                                }
                                if (numRunning <= q.concurrency - q.buffer) {
                                    q.unsaturated();
                                }
                                if (q.idle()) {
                                    q.drain();
                                }
                                q.process();
                            };
                        }
                        var isProcessing = false;
                        var q = {
                            _tasks: new DLL(),
                            concurrency: concurrency,
                            payload: payload,
                            saturated: noop,
                            unsaturated: noop,
                            buffer: concurrency / 4,
                            empty: noop,
                            drain: noop,
                            error: noop,
                            started: false,
                            paused: false,
                            push: function(data, callback) {
                                _insert(data, false, callback);
                            },
                            kill: function() {
                                q.drain = noop;
                                q._tasks.empty();
                            },
                            unshift: function(data, callback) {
                                _insert(data, true, callback);
                            },
                            remove: function(testFn) {
                                q._tasks.remove(testFn);
                            },
                            process: function() {
                                if (isProcessing) {
                                    return;
                                }
                                isProcessing = true;
                                while (!q.paused && numRunning < q.concurrency && q._tasks.length) {
                                    var tasks = [], data = [];
                                    var l = q._tasks.length;
                                    if (q.payload) l = Math.min(l, q.payload);
                                    for (var i = 0; i < l; i++) {
                                        var node = q._tasks.shift();
                                        tasks.push(node);
                                        workersList.push(node);
                                        data.push(node.data);
                                    }
                                    numRunning += 1;
                                    if (q._tasks.length === 0) {
                                        q.empty();
                                    }
                                    if (numRunning === q.concurrency) {
                                        q.saturated();
                                    }
                                    var cb = onlyOnce(_next(tasks));
                                    _worker(data, cb);
                                }
                                isProcessing = false;
                            },
                            length: function() {
                                return q._tasks.length;
                            },
                            running: function() {
                                return numRunning;
                            },
                            workersList: function() {
                                return workersList;
                            },
                            idle: function() {
                                return q._tasks.length + numRunning === 0;
                            },
                            pause: function() {
                                q.paused = true;
                            },
                            resume: function() {
                                if (q.paused === false) {
                                    return;
                                }
                                q.paused = false;
                                setImmediate$1(q.process);
                            }
                        };
                        return q;
                    }
                    function cargo(worker, payload) {
                        return queue(worker, 1, payload);
                    }
                    var eachOfSeries = doLimit(eachOfLimit, 1);
                    function reduce(coll, memo, iteratee, callback) {
                        callback = once(callback || noop);
                        var _iteratee = wrapAsync(iteratee);
                        eachOfSeries(coll, function(x, i, callback) {
                            _iteratee(memo, x, function(err, v) {
                                memo = v;
                                callback(err);
                            });
                        }, function(err) {
                            callback(err, memo);
                        });
                    }
                    function seq() {
                        var _functions = arrayMap(arguments, wrapAsync);
                        return function() {
                            var args = slice(arguments);
                            var that = this;
                            var cb = args[args.length - 1];
                            if (typeof cb == "function") {
                                args.pop();
                            } else {
                                cb = noop;
                            }
                            reduce(_functions, args, function(newargs, fn, cb) {
                                fn.apply(that, newargs.concat(function(err) {
                                    var nextargs = slice(arguments, 1);
                                    cb(err, nextargs);
                                }));
                            }, function(err, results) {
                                cb.apply(that, [ err ].concat(results));
                            });
                        };
                    }
                    var compose = function() {
                        return seq.apply(null, slice(arguments).reverse());
                    };
                    var _concat = Array.prototype.concat;
                    var concatLimit = function(coll, limit, iteratee, callback) {
                        callback = callback || noop;
                        var _iteratee = wrapAsync(iteratee);
                        mapLimit(coll, limit, function(val, callback) {
                            _iteratee(val, function(err) {
                                if (err) return callback(err);
                                return callback(null, slice(arguments, 1));
                            });
                        }, function(err, mapResults) {
                            var result = [];
                            for (var i = 0; i < mapResults.length; i++) {
                                if (mapResults[i]) {
                                    result = _concat.apply(result, mapResults[i]);
                                }
                            }
                            return callback(err, result);
                        });
                    };
                    var concat = doLimit(concatLimit, Infinity);
                    var concatSeries = doLimit(concatLimit, 1);
                    var constant = function() {
                        var values = slice(arguments);
                        var args = [ null ].concat(values);
                        return function() {
                            var callback = arguments[arguments.length - 1];
                            return callback.apply(this, args);
                        };
                    };
                    function identity(value) {
                        return value;
                    }
                    function _createTester(check, getResult) {
                        return function(eachfn, arr, iteratee, cb) {
                            cb = cb || noop;
                            var testPassed = false;
                            var testResult;
                            eachfn(arr, function(value, _, callback) {
                                iteratee(value, function(err, result) {
                                    if (err) {
                                        callback(err);
                                    } else if (check(result) && !testResult) {
                                        testPassed = true;
                                        testResult = getResult(true, value);
                                        callback(null, breakLoop);
                                    } else {
                                        callback();
                                    }
                                });
                            }, function(err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb(null, testPassed ? testResult : getResult(false));
                                }
                            });
                        };
                    }
                    function _findGetResult(v, x) {
                        return x;
                    }
                    var detect = doParallel(_createTester(identity, _findGetResult));
                    var detectLimit = doParallelLimit(_createTester(identity, _findGetResult));
                    var detectSeries = doLimit(detectLimit, 1);
                    function consoleFunc(name) {
                        return function(fn) {
                            var args = slice(arguments, 1);
                            args.push(function(err) {
                                var args = slice(arguments, 1);
                                if (typeof console === "object") {
                                    if (err) {
                                        if (console.error) {
                                            console.error(err);
                                        }
                                    } else if (console[name]) {
                                        arrayEach(args, function(x) {
                                            console[name](x);
                                        });
                                    }
                                }
                            });
                            wrapAsync(fn).apply(null, args);
                        };
                    }
                    var dir = consoleFunc("dir");
                    function doDuring(fn, test, callback) {
                        callback = onlyOnce(callback || noop);
                        var _fn = wrapAsync(fn);
                        var _test = wrapAsync(test);
                        function next(err) {
                            if (err) return callback(err);
                            var args = slice(arguments, 1);
                            args.push(check);
                            _test.apply(this, args);
                        }
                        function check(err, truth) {
                            if (err) return callback(err);
                            if (!truth) return callback(null);
                            _fn(next);
                        }
                        check(null, true);
                    }
                    function doWhilst(iteratee, test, callback) {
                        callback = onlyOnce(callback || noop);
                        var _iteratee = wrapAsync(iteratee);
                        var next = function(err) {
                            if (err) return callback(err);
                            var args = slice(arguments, 1);
                            if (test.apply(this, args)) return _iteratee(next);
                            callback.apply(null, [ null ].concat(args));
                        };
                        _iteratee(next);
                    }
                    function doUntil(iteratee, test, callback) {
                        doWhilst(iteratee, function() {
                            return !test.apply(this, arguments);
                        }, callback);
                    }
                    function during(test, fn, callback) {
                        callback = onlyOnce(callback || noop);
                        var _fn = wrapAsync(fn);
                        var _test = wrapAsync(test);
                        function next(err) {
                            if (err) return callback(err);
                            _test(check);
                        }
                        function check(err, truth) {
                            if (err) return callback(err);
                            if (!truth) return callback(null);
                            _fn(next);
                        }
                        _test(check);
                    }
                    function _withoutIndex(iteratee) {
                        return function(value, index, callback) {
                            return iteratee(value, callback);
                        };
                    }
                    function eachLimit(coll, iteratee, callback) {
                        eachOf(coll, _withoutIndex(wrapAsync(iteratee)), callback);
                    }
                    function eachLimit$1(coll, limit, iteratee, callback) {
                        _eachOfLimit(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
                    }
                    var eachSeries = doLimit(eachLimit$1, 1);
                    function ensureAsync(fn) {
                        if (isAsync(fn)) return fn;
                        return initialParams(function(args, callback) {
                            var sync = true;
                            args.push(function() {
                                var innerArgs = arguments;
                                if (sync) {
                                    setImmediate$1(function() {
                                        callback.apply(null, innerArgs);
                                    });
                                } else {
                                    callback.apply(null, innerArgs);
                                }
                            });
                            fn.apply(this, args);
                            sync = false;
                        });
                    }
                    function notId(v) {
                        return !v;
                    }
                    var every = doParallel(_createTester(notId, notId));
                    var everyLimit = doParallelLimit(_createTester(notId, notId));
                    var everySeries = doLimit(everyLimit, 1);
                    function baseProperty(key) {
                        return function(object) {
                            return object == null ? undefined : object[key];
                        };
                    }
                    function filterArray(eachfn, arr, iteratee, callback) {
                        var truthValues = new Array(arr.length);
                        eachfn(arr, function(x, index, callback) {
                            iteratee(x, function(err, v) {
                                truthValues[index] = !!v;
                                callback(err);
                            });
                        }, function(err) {
                            if (err) return callback(err);
                            var results = [];
                            for (var i = 0; i < arr.length; i++) {
                                if (truthValues[i]) results.push(arr[i]);
                            }
                            callback(null, results);
                        });
                    }
                    function filterGeneric(eachfn, coll, iteratee, callback) {
                        var results = [];
                        eachfn(coll, function(x, index, callback) {
                            iteratee(x, function(err, v) {
                                if (err) {
                                    callback(err);
                                } else {
                                    if (v) {
                                        results.push({
                                            index: index,
                                            value: x
                                        });
                                    }
                                    callback();
                                }
                            });
                        }, function(err) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, arrayMap(results.sort(function(a, b) {
                                    return a.index - b.index;
                                }), baseProperty("value")));
                            }
                        });
                    }
                    function _filter(eachfn, coll, iteratee, callback) {
                        var filter = isArrayLike(coll) ? filterArray : filterGeneric;
                        filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
                    }
                    var filter = doParallel(_filter);
                    var filterLimit = doParallelLimit(_filter);
                    var filterSeries = doLimit(filterLimit, 1);
                    function forever(fn, errback) {
                        var done = onlyOnce(errback || noop);
                        var task = wrapAsync(ensureAsync(fn));
                        function next(err) {
                            if (err) return done(err);
                            task(next);
                        }
                        next();
                    }
                    var groupByLimit = function(coll, limit, iteratee, callback) {
                        callback = callback || noop;
                        var _iteratee = wrapAsync(iteratee);
                        mapLimit(coll, limit, function(val, callback) {
                            _iteratee(val, function(err, key) {
                                if (err) return callback(err);
                                return callback(null, {
                                    key: key,
                                    val: val
                                });
                            });
                        }, function(err, mapResults) {
                            var result = {};
                            var hasOwnProperty = Object.prototype.hasOwnProperty;
                            for (var i = 0; i < mapResults.length; i++) {
                                if (mapResults[i]) {
                                    var key = mapResults[i].key;
                                    var val = mapResults[i].val;
                                    if (hasOwnProperty.call(result, key)) {
                                        result[key].push(val);
                                    } else {
                                        result[key] = [ val ];
                                    }
                                }
                            }
                            return callback(err, result);
                        });
                    };
                    var groupBy = doLimit(groupByLimit, Infinity);
                    var groupBySeries = doLimit(groupByLimit, 1);
                    var log = consoleFunc("log");
                    function mapValuesLimit(obj, limit, iteratee, callback) {
                        callback = once(callback || noop);
                        var newObj = {};
                        var _iteratee = wrapAsync(iteratee);
                        eachOfLimit(obj, limit, function(val, key, next) {
                            _iteratee(val, key, function(err, result) {
                                if (err) return next(err);
                                newObj[key] = result;
                                next();
                            });
                        }, function(err) {
                            callback(err, newObj);
                        });
                    }
                    var mapValues = doLimit(mapValuesLimit, Infinity);
                    var mapValuesSeries = doLimit(mapValuesLimit, 1);
                    function has(obj, key) {
                        return key in obj;
                    }
                    function memoize(fn, hasher) {
                        var memo = Object.create(null);
                        var queues = Object.create(null);
                        hasher = hasher || identity;
                        var _fn = wrapAsync(fn);
                        var memoized = initialParams(function memoized(args, callback) {
                            var key = hasher.apply(null, args);
                            if (has(memo, key)) {
                                setImmediate$1(function() {
                                    callback.apply(null, memo[key]);
                                });
                            } else if (has(queues, key)) {
                                queues[key].push(callback);
                            } else {
                                queues[key] = [ callback ];
                                _fn.apply(null, args.concat(function() {
                                    var args = slice(arguments);
                                    memo[key] = args;
                                    var q = queues[key];
                                    delete queues[key];
                                    for (var i = 0, l = q.length; i < l; i++) {
                                        q[i].apply(null, args);
                                    }
                                }));
                            }
                        });
                        memoized.memo = memo;
                        memoized.unmemoized = fn;
                        return memoized;
                    }
                    var _defer$1;
                    if (hasNextTick) {
                        _defer$1 = process.nextTick;
                    } else if (hasSetImmediate) {
                        _defer$1 = setImmediate;
                    } else {
                        _defer$1 = fallback;
                    }
                    var nextTick = wrap(_defer$1);
                    function _parallel(eachfn, tasks, callback) {
                        callback = callback || noop;
                        var results = isArrayLike(tasks) ? [] : {};
                        eachfn(tasks, function(task, key, callback) {
                            wrapAsync(task)(function(err, result) {
                                if (arguments.length > 2) {
                                    result = slice(arguments, 1);
                                }
                                results[key] = result;
                                callback(err);
                            });
                        }, function(err) {
                            callback(err, results);
                        });
                    }
                    function parallelLimit(tasks, callback) {
                        _parallel(eachOf, tasks, callback);
                    }
                    function parallelLimit$1(tasks, limit, callback) {
                        _parallel(_eachOfLimit(limit), tasks, callback);
                    }
                    var queue$1 = function(worker, concurrency) {
                        var _worker = wrapAsync(worker);
                        return queue(function(items, cb) {
                            _worker(items[0], cb);
                        }, concurrency, 1);
                    };
                    var priorityQueue = function(worker, concurrency) {
                        var q = queue$1(worker, concurrency);
                        q.push = function(data, priority, callback) {
                            if (callback == null) callback = noop;
                            if (typeof callback !== "function") {
                                throw new Error("task callback must be a function");
                            }
                            q.started = true;
                            if (!isArray(data)) {
                                data = [ data ];
                            }
                            if (data.length === 0) {
                                return setImmediate$1(function() {
                                    q.drain();
                                });
                            }
                            priority = priority || 0;
                            var nextNode = q._tasks.head;
                            while (nextNode && priority >= nextNode.priority) {
                                nextNode = nextNode.next;
                            }
                            for (var i = 0, l = data.length; i < l; i++) {
                                var item = {
                                    data: data[i],
                                    priority: priority,
                                    callback: callback
                                };
                                if (nextNode) {
                                    q._tasks.insertBefore(nextNode, item);
                                } else {
                                    q._tasks.push(item);
                                }
                            }
                            setImmediate$1(q.process);
                        };
                        delete q.unshift;
                        return q;
                    };
                    function race(tasks, callback) {
                        callback = once(callback || noop);
                        if (!isArray(tasks)) return callback(new TypeError("First argument to race must be an array of functions"));
                        if (!tasks.length) return callback();
                        for (var i = 0, l = tasks.length; i < l; i++) {
                            wrapAsync(tasks[i])(callback);
                        }
                    }
                    function reduceRight(array, memo, iteratee, callback) {
                        var reversed = slice(array).reverse();
                        reduce(reversed, memo, iteratee, callback);
                    }
                    function reflect(fn) {
                        var _fn = wrapAsync(fn);
                        return initialParams(function reflectOn(args, reflectCallback) {
                            args.push(function callback(error, cbArg) {
                                if (error) {
                                    reflectCallback(null, {
                                        error: error
                                    });
                                } else {
                                    var value;
                                    if (arguments.length <= 2) {
                                        value = cbArg;
                                    } else {
                                        value = slice(arguments, 1);
                                    }
                                    reflectCallback(null, {
                                        value: value
                                    });
                                }
                            });
                            return _fn.apply(this, args);
                        });
                    }
                    function reflectAll(tasks) {
                        var results;
                        if (isArray(tasks)) {
                            results = arrayMap(tasks, reflect);
                        } else {
                            results = {};
                            baseForOwn(tasks, function(task, key) {
                                results[key] = reflect.call(this, task);
                            });
                        }
                        return results;
                    }
                    function reject$1(eachfn, arr, iteratee, callback) {
                        _filter(eachfn, arr, function(value, cb) {
                            iteratee(value, function(err, v) {
                                cb(err, !v);
                            });
                        }, callback);
                    }
                    var reject = doParallel(reject$1);
                    var rejectLimit = doParallelLimit(reject$1);
                    var rejectSeries = doLimit(rejectLimit, 1);
                    function constant$1(value) {
                        return function() {
                            return value;
                        };
                    }
                    function retry(opts, task, callback) {
                        var DEFAULT_TIMES = 5;
                        var DEFAULT_INTERVAL = 0;
                        var options = {
                            times: DEFAULT_TIMES,
                            intervalFunc: constant$1(DEFAULT_INTERVAL)
                        };
                        function parseTimes(acc, t) {
                            if (typeof t === "object") {
                                acc.times = +t.times || DEFAULT_TIMES;
                                acc.intervalFunc = typeof t.interval === "function" ? t.interval : constant$1(+t.interval || DEFAULT_INTERVAL);
                                acc.errorFilter = t.errorFilter;
                            } else if (typeof t === "number" || typeof t === "string") {
                                acc.times = +t || DEFAULT_TIMES;
                            } else {
                                throw new Error("Invalid arguments for async.retry");
                            }
                        }
                        if (arguments.length < 3 && typeof opts === "function") {
                            callback = task || noop;
                            task = opts;
                        } else {
                            parseTimes(options, opts);
                            callback = callback || noop;
                        }
                        if (typeof task !== "function") {
                            throw new Error("Invalid arguments for async.retry");
                        }
                        var _task = wrapAsync(task);
                        var attempt = 1;
                        function retryAttempt() {
                            _task(function(err) {
                                if (err && attempt++ < options.times && (typeof options.errorFilter != "function" || options.errorFilter(err))) {
                                    setTimeout(retryAttempt, options.intervalFunc(attempt));
                                } else {
                                    callback.apply(null, arguments);
                                }
                            });
                        }
                        retryAttempt();
                    }
                    var retryable = function(opts, task) {
                        if (!task) {
                            task = opts;
                            opts = null;
                        }
                        var _task = wrapAsync(task);
                        return initialParams(function(args, callback) {
                            function taskFn(cb) {
                                _task.apply(null, args.concat(cb));
                            }
                            if (opts) retry(opts, taskFn, callback); else retry(taskFn, callback);
                        });
                    };
                    function series(tasks, callback) {
                        _parallel(eachOfSeries, tasks, callback);
                    }
                    var some = doParallel(_createTester(Boolean, identity));
                    var someLimit = doParallelLimit(_createTester(Boolean, identity));
                    var someSeries = doLimit(someLimit, 1);
                    function sortBy(coll, iteratee, callback) {
                        var _iteratee = wrapAsync(iteratee);
                        map(coll, function(x, callback) {
                            _iteratee(x, function(err, criteria) {
                                if (err) return callback(err);
                                callback(null, {
                                    value: x,
                                    criteria: criteria
                                });
                            });
                        }, function(err, results) {
                            if (err) return callback(err);
                            callback(null, arrayMap(results.sort(comparator), baseProperty("value")));
                        });
                        function comparator(left, right) {
                            var a = left.criteria, b = right.criteria;
                            return a < b ? -1 : a > b ? 1 : 0;
                        }
                    }
                    function timeout(asyncFn, milliseconds, info) {
                        var fn = wrapAsync(asyncFn);
                        return initialParams(function(args, callback) {
                            var timedOut = false;
                            var timer;
                            function timeoutCallback() {
                                var name = asyncFn.name || "anonymous";
                                var error = new Error('Callback function "' + name + '" timed out.');
                                error.code = "ETIMEDOUT";
                                if (info) {
                                    error.info = info;
                                }
                                timedOut = true;
                                callback(error);
                            }
                            args.push(function() {
                                if (!timedOut) {
                                    callback.apply(null, arguments);
                                    clearTimeout(timer);
                                }
                            });
                            timer = setTimeout(timeoutCallback, milliseconds);
                            fn.apply(null, args);
                        });
                    }
                    var nativeCeil = Math.ceil;
                    var nativeMax = Math.max;
                    function baseRange(start, end, step, fromRight) {
                        var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
                        while (length--) {
                            result[fromRight ? length : ++index] = start;
                            start += step;
                        }
                        return result;
                    }
                    function timeLimit(count, limit, iteratee, callback) {
                        var _iteratee = wrapAsync(iteratee);
                        mapLimit(baseRange(0, count, 1), limit, _iteratee, callback);
                    }
                    var times = doLimit(timeLimit, Infinity);
                    var timesSeries = doLimit(timeLimit, 1);
                    function transform(coll, accumulator, iteratee, callback) {
                        if (arguments.length <= 3) {
                            callback = iteratee;
                            iteratee = accumulator;
                            accumulator = isArray(coll) ? [] : {};
                        }
                        callback = once(callback || noop);
                        var _iteratee = wrapAsync(iteratee);
                        eachOf(coll, function(v, k, cb) {
                            _iteratee(accumulator, v, k, cb);
                        }, function(err) {
                            callback(err, accumulator);
                        });
                    }
                    function tryEach(tasks, callback) {
                        var error = null;
                        var result;
                        callback = callback || noop;
                        eachSeries(tasks, function(task, callback) {
                            wrapAsync(task)(function(err, res) {
                                if (arguments.length > 2) {
                                    result = slice(arguments, 1);
                                } else {
                                    result = res;
                                }
                                error = err;
                                callback(!err);
                            });
                        }, function() {
                            callback(error, result);
                        });
                    }
                    function unmemoize(fn) {
                        return function() {
                            return (fn.unmemoized || fn).apply(null, arguments);
                        };
                    }
                    function whilst(test, iteratee, callback) {
                        callback = onlyOnce(callback || noop);
                        var _iteratee = wrapAsync(iteratee);
                        if (!test()) return callback(null);
                        var next = function(err) {
                            if (err) return callback(err);
                            if (test()) return _iteratee(next);
                            var args = slice(arguments, 1);
                            callback.apply(null, [ null ].concat(args));
                        };
                        _iteratee(next);
                    }
                    function until(test, iteratee, callback) {
                        whilst(function() {
                            return !test.apply(this, arguments);
                        }, iteratee, callback);
                    }
                    var waterfall = function(tasks, callback) {
                        callback = once(callback || noop);
                        if (!isArray(tasks)) return callback(new Error("First argument to waterfall must be an array of functions"));
                        if (!tasks.length) return callback();
                        var taskIndex = 0;
                        function nextTask(args) {
                            var task = wrapAsync(tasks[taskIndex++]);
                            args.push(onlyOnce(next));
                            task.apply(null, args);
                        }
                        function next(err) {
                            if (err || taskIndex === tasks.length) {
                                return callback.apply(null, arguments);
                            }
                            nextTask(slice(arguments, 1));
                        }
                        nextTask([]);
                    };
                    var index = {
                        apply: apply,
                        applyEach: applyEach,
                        applyEachSeries: applyEachSeries,
                        asyncify: asyncify,
                        auto: auto,
                        autoInject: autoInject,
                        cargo: cargo,
                        compose: compose,
                        concat: concat,
                        concatLimit: concatLimit,
                        concatSeries: concatSeries,
                        constant: constant,
                        detect: detect,
                        detectLimit: detectLimit,
                        detectSeries: detectSeries,
                        dir: dir,
                        doDuring: doDuring,
                        doUntil: doUntil,
                        doWhilst: doWhilst,
                        during: during,
                        each: eachLimit,
                        eachLimit: eachLimit$1,
                        eachOf: eachOf,
                        eachOfLimit: eachOfLimit,
                        eachOfSeries: eachOfSeries,
                        eachSeries: eachSeries,
                        ensureAsync: ensureAsync,
                        every: every,
                        everyLimit: everyLimit,
                        everySeries: everySeries,
                        filter: filter,
                        filterLimit: filterLimit,
                        filterSeries: filterSeries,
                        forever: forever,
                        groupBy: groupBy,
                        groupByLimit: groupByLimit,
                        groupBySeries: groupBySeries,
                        log: log,
                        map: map,
                        mapLimit: mapLimit,
                        mapSeries: mapSeries,
                        mapValues: mapValues,
                        mapValuesLimit: mapValuesLimit,
                        mapValuesSeries: mapValuesSeries,
                        memoize: memoize,
                        nextTick: nextTick,
                        parallel: parallelLimit,
                        parallelLimit: parallelLimit$1,
                        priorityQueue: priorityQueue,
                        queue: queue$1,
                        race: race,
                        reduce: reduce,
                        reduceRight: reduceRight,
                        reflect: reflect,
                        reflectAll: reflectAll,
                        reject: reject,
                        rejectLimit: rejectLimit,
                        rejectSeries: rejectSeries,
                        retry: retry,
                        retryable: retryable,
                        seq: seq,
                        series: series,
                        setImmediate: setImmediate$1,
                        some: some,
                        someLimit: someLimit,
                        someSeries: someSeries,
                        sortBy: sortBy,
                        timeout: timeout,
                        times: times,
                        timesLimit: timeLimit,
                        timesSeries: timesSeries,
                        transform: transform,
                        tryEach: tryEach,
                        unmemoize: unmemoize,
                        until: until,
                        waterfall: waterfall,
                        whilst: whilst,
                        all: every,
                        allLimit: everyLimit,
                        allSeries: everySeries,
                        any: some,
                        anyLimit: someLimit,
                        anySeries: someSeries,
                        find: detect,
                        findLimit: detectLimit,
                        findSeries: detectSeries,
                        forEach: eachLimit,
                        forEachSeries: eachSeries,
                        forEachLimit: eachLimit$1,
                        forEachOf: eachOf,
                        forEachOfSeries: eachOfSeries,
                        forEachOfLimit: eachOfLimit,
                        inject: reduce,
                        foldl: reduce,
                        foldr: reduceRight,
                        select: filter,
                        selectLimit: filterLimit,
                        selectSeries: filterSeries,
                        wrapSync: asyncify
                    };
                    exports["default"] = index;
                    exports.apply = apply;
                    exports.applyEach = applyEach;
                    exports.applyEachSeries = applyEachSeries;
                    exports.asyncify = asyncify;
                    exports.auto = auto;
                    exports.autoInject = autoInject;
                    exports.cargo = cargo;
                    exports.compose = compose;
                    exports.concat = concat;
                    exports.concatLimit = concatLimit;
                    exports.concatSeries = concatSeries;
                    exports.constant = constant;
                    exports.detect = detect;
                    exports.detectLimit = detectLimit;
                    exports.detectSeries = detectSeries;
                    exports.dir = dir;
                    exports.doDuring = doDuring;
                    exports.doUntil = doUntil;
                    exports.doWhilst = doWhilst;
                    exports.during = during;
                    exports.each = eachLimit;
                    exports.eachLimit = eachLimit$1;
                    exports.eachOf = eachOf;
                    exports.eachOfLimit = eachOfLimit;
                    exports.eachOfSeries = eachOfSeries;
                    exports.eachSeries = eachSeries;
                    exports.ensureAsync = ensureAsync;
                    exports.every = every;
                    exports.everyLimit = everyLimit;
                    exports.everySeries = everySeries;
                    exports.filter = filter;
                    exports.filterLimit = filterLimit;
                    exports.filterSeries = filterSeries;
                    exports.forever = forever;
                    exports.groupBy = groupBy;
                    exports.groupByLimit = groupByLimit;
                    exports.groupBySeries = groupBySeries;
                    exports.log = log;
                    exports.map = map;
                    exports.mapLimit = mapLimit;
                    exports.mapSeries = mapSeries;
                    exports.mapValues = mapValues;
                    exports.mapValuesLimit = mapValuesLimit;
                    exports.mapValuesSeries = mapValuesSeries;
                    exports.memoize = memoize;
                    exports.nextTick = nextTick;
                    exports.parallel = parallelLimit;
                    exports.parallelLimit = parallelLimit$1;
                    exports.priorityQueue = priorityQueue;
                    exports.queue = queue$1;
                    exports.race = race;
                    exports.reduce = reduce;
                    exports.reduceRight = reduceRight;
                    exports.reflect = reflect;
                    exports.reflectAll = reflectAll;
                    exports.reject = reject;
                    exports.rejectLimit = rejectLimit;
                    exports.rejectSeries = rejectSeries;
                    exports.retry = retry;
                    exports.retryable = retryable;
                    exports.seq = seq;
                    exports.series = series;
                    exports.setImmediate = setImmediate$1;
                    exports.some = some;
                    exports.someLimit = someLimit;
                    exports.someSeries = someSeries;
                    exports.sortBy = sortBy;
                    exports.timeout = timeout;
                    exports.times = times;
                    exports.timesLimit = timeLimit;
                    exports.timesSeries = timesSeries;
                    exports.transform = transform;
                    exports.tryEach = tryEach;
                    exports.unmemoize = unmemoize;
                    exports.until = until;
                    exports.waterfall = waterfall;
                    exports.whilst = whilst;
                    exports.all = every;
                    exports.allLimit = everyLimit;
                    exports.allSeries = everySeries;
                    exports.any = some;
                    exports.anyLimit = someLimit;
                    exports.anySeries = someSeries;
                    exports.find = detect;
                    exports.findLimit = detectLimit;
                    exports.findSeries = detectSeries;
                    exports.forEach = eachLimit;
                    exports.forEachSeries = eachSeries;
                    exports.forEachLimit = eachLimit$1;
                    exports.forEachOf = eachOf;
                    exports.forEachOfSeries = eachOfSeries;
                    exports.forEachOfLimit = eachOfLimit;
                    exports.inject = reduce;
                    exports.foldl = reduce;
                    exports.foldr = reduceRight;
                    exports.select = filter;
                    exports.selectLimit = filterLimit;
                    exports.selectSeries = filterSeries;
                    exports.wrapSync = asyncify;
                    Object.defineProperty(exports, "__esModule", {
                        value: true
                    });
                });
            }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {
            _process: 4
        } ],
        13: [ function(require, module, exports) {
            (function(global) {
                if (typeof global !== "undefined") {
                    var Buffer = require("buffer").Buffer;
                }
                function Binary(buffer, subType) {
                    if (!(this instanceof Binary)) return new Binary(buffer, subType);
                    this._bsontype = "Binary";
                    if (buffer instanceof Number) {
                        this.sub_type = buffer;
                        this.position = 0;
                    } else {
                        this.sub_type = subType == null ? BSON_BINARY_SUBTYPE_DEFAULT : subType;
                        this.position = 0;
                    }
                    if (buffer != null && !(buffer instanceof Number)) {
                        if (typeof buffer == "string") {
                            if (typeof Buffer != "undefined") {
                                this.buffer = new Buffer(buffer);
                            } else if (typeof Uint8Array != "undefined" || Object.prototype.toString.call(buffer) == "[object Array]") {
                                this.buffer = writeStringToArray(buffer);
                            } else {
                                throw new Error("only String, Buffer, Uint8Array or Array accepted");
                            }
                        } else {
                            this.buffer = buffer;
                        }
                        this.position = buffer.length;
                    } else {
                        if (typeof Buffer != "undefined") {
                            this.buffer = new Buffer(Binary.BUFFER_SIZE);
                        } else if (typeof Uint8Array != "undefined") {
                            this.buffer = new Uint8Array(new ArrayBuffer(Binary.BUFFER_SIZE));
                        } else {
                            this.buffer = new Array(Binary.BUFFER_SIZE);
                        }
                        this.position = 0;
                    }
                }
                Binary.prototype.put = function put(byte_value) {
                    if (byte_value["length"] != null && typeof byte_value != "number" && byte_value.length != 1) throw new Error("only accepts single character String, Uint8Array or Array");
                    if (typeof byte_value != "number" && byte_value < 0 || byte_value > 255) throw new Error("only accepts number in a valid unsigned byte range 0-255");
                    var decoded_byte = null;
                    if (typeof byte_value == "string") {
                        decoded_byte = byte_value.charCodeAt(0);
                    } else if (byte_value["length"] != null) {
                        decoded_byte = byte_value[0];
                    } else {
                        decoded_byte = byte_value;
                    }
                    if (this.buffer.length > this.position) {
                        this.buffer[this.position++] = decoded_byte;
                    } else {
                        if (typeof Buffer != "undefined" && Buffer.isBuffer(this.buffer)) {
                            var buffer = new Buffer(Binary.BUFFER_SIZE + this.buffer.length);
                            this.buffer.copy(buffer, 0, 0, this.buffer.length);
                            this.buffer = buffer;
                            this.buffer[this.position++] = decoded_byte;
                        } else {
                            var buffer = null;
                            if (Object.prototype.toString.call(this.buffer) == "[object Uint8Array]") {
                                buffer = new Uint8Array(new ArrayBuffer(Binary.BUFFER_SIZE + this.buffer.length));
                            } else {
                                buffer = new Array(Binary.BUFFER_SIZE + this.buffer.length);
                            }
                            for (var i = 0; i < this.buffer.length; i++) {
                                buffer[i] = this.buffer[i];
                            }
                            this.buffer = buffer;
                            this.buffer[this.position++] = decoded_byte;
                        }
                    }
                };
                Binary.prototype.write = function write(string, offset) {
                    offset = typeof offset == "number" ? offset : this.position;
                    if (this.buffer.length < offset + string.length) {
                        var buffer = null;
                        if (typeof Buffer != "undefined" && Buffer.isBuffer(this.buffer)) {
                            buffer = new Buffer(this.buffer.length + string.length);
                            this.buffer.copy(buffer, 0, 0, this.buffer.length);
                        } else if (Object.prototype.toString.call(this.buffer) == "[object Uint8Array]") {
                            buffer = new Uint8Array(new ArrayBuffer(this.buffer.length + string.length));
                            for (var i = 0; i < this.position; i++) {
                                buffer[i] = this.buffer[i];
                            }
                        }
                        this.buffer = buffer;
                    }
                    if (typeof Buffer != "undefined" && Buffer.isBuffer(string) && Buffer.isBuffer(this.buffer)) {
                        string.copy(this.buffer, offset, 0, string.length);
                        this.position = offset + string.length > this.position ? offset + string.length : this.position;
                    } else if (typeof Buffer != "undefined" && typeof string == "string" && Buffer.isBuffer(this.buffer)) {
                        this.buffer.write(string, offset, "binary");
                        this.position = offset + string.length > this.position ? offset + string.length : this.position;
                    } else if (Object.prototype.toString.call(string) == "[object Uint8Array]" || Object.prototype.toString.call(string) == "[object Array]" && typeof string != "string") {
                        for (var i = 0; i < string.length; i++) {
                            this.buffer[offset++] = string[i];
                        }
                        this.position = offset > this.position ? offset : this.position;
                    } else if (typeof string == "string") {
                        for (var i = 0; i < string.length; i++) {
                            this.buffer[offset++] = string.charCodeAt(i);
                        }
                        this.position = offset > this.position ? offset : this.position;
                    }
                };
                Binary.prototype.read = function read(position, length) {
                    length = length && length > 0 ? length : this.position;
                    if (this.buffer["slice"]) {
                        return this.buffer.slice(position, position + length);
                    } else {
                        var buffer = typeof Uint8Array != "undefined" ? new Uint8Array(new ArrayBuffer(length)) : new Array(length);
                        for (var i = 0; i < length; i++) {
                            buffer[i] = this.buffer[position++];
                        }
                    }
                    return buffer;
                };
                Binary.prototype.value = function value(asRaw) {
                    asRaw = asRaw == null ? false : asRaw;
                    if (asRaw && typeof Buffer != "undefined" && Buffer.isBuffer(this.buffer) && this.buffer.length == this.position) return this.buffer;
                    if (typeof Buffer != "undefined" && Buffer.isBuffer(this.buffer)) {
                        return asRaw ? this.buffer.slice(0, this.position) : this.buffer.toString("binary", 0, this.position);
                    } else {
                        if (asRaw) {
                            if (this.buffer["slice"] != null) {
                                return this.buffer.slice(0, this.position);
                            } else {
                                var newBuffer = Object.prototype.toString.call(this.buffer) == "[object Uint8Array]" ? new Uint8Array(new ArrayBuffer(this.position)) : new Array(this.position);
                                for (var i = 0; i < this.position; i++) {
                                    newBuffer[i] = this.buffer[i];
                                }
                                return newBuffer;
                            }
                        } else {
                            return convertArraytoUtf8BinaryString(this.buffer, 0, this.position);
                        }
                    }
                };
                Binary.prototype.length = function length() {
                    return this.position;
                };
                Binary.prototype.toJSON = function() {
                    return this.buffer != null ? this.buffer.toString("base64") : "";
                };
                Binary.prototype.toString = function(format) {
                    return this.buffer != null ? this.buffer.slice(0, this.position).toString(format) : "";
                };
                var BSON_BINARY_SUBTYPE_DEFAULT = 0;
                var writeStringToArray = function(data) {
                    var buffer = typeof Uint8Array != "undefined" ? new Uint8Array(new ArrayBuffer(data.length)) : new Array(data.length);
                    for (var i = 0; i < data.length; i++) {
                        buffer[i] = data.charCodeAt(i);
                    }
                    return buffer;
                };
                var convertArraytoUtf8BinaryString = function(byteArray, startIndex, endIndex) {
                    var result = "";
                    for (var i = startIndex; i < endIndex; i++) {
                        result = result + String.fromCharCode(byteArray[i]);
                    }
                    return result;
                };
                Binary.BUFFER_SIZE = 256;
                Binary.SUBTYPE_DEFAULT = 0;
                Binary.SUBTYPE_FUNCTION = 1;
                Binary.SUBTYPE_BYTE_ARRAY = 2;
                Binary.SUBTYPE_UUID_OLD = 3;
                Binary.SUBTYPE_UUID = 4;
                Binary.SUBTYPE_MD5 = 5;
                Binary.SUBTYPE_USER_DEFINED = 128;
                module.exports = Binary;
                module.exports.Binary = Binary;
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {
            buffer: 1
        } ],
        14: [ function(require, module, exports) {
            (function(Buffer) {
                "use strict";
                var writeIEEE754 = require("./float_parser").writeIEEE754, readIEEE754 = require("./float_parser").readIEEE754, Map = require("./map"), Long = require("./long"), Double = require("./double"), Timestamp = require("./timestamp"), ObjectID = require("./objectid"), BSONRegExp = require("./regexp"), Symbol = require("./symbol"), Int32 = require("./int_32"), Code = require("./code"), Decimal128 = require("./decimal128"), MinKey = require("./min_key"), MaxKey = require("./max_key"), DBRef = require("./db_ref"), Binary = require("./binary");
                var deserialize = require("./parser/deserializer"), serializer = require("./parser/serializer"), calculateObjectSize = require("./parser/calculate_size");
                var MAXSIZE = 1024 * 1024 * 17;
                var buffer = new Buffer(MAXSIZE);
                var BSON = function() {};
                BSON.prototype.serialize = function serialize(object, options) {
                    options = options || {};
                    var checkKeys = typeof options.checkKeys == "boolean" ? options.checkKeys : false;
                    var serializeFunctions = typeof options.serializeFunctions == "boolean" ? options.serializeFunctions : false;
                    var ignoreUndefined = typeof options.ignoreUndefined == "boolean" ? options.ignoreUndefined : true;
                    var serializationIndex = serializer(buffer, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined, []);
                    var finishedBuffer = new Buffer(serializationIndex);
                    buffer.copy(finishedBuffer, 0, 0, finishedBuffer.length);
                    return finishedBuffer;
                };
                BSON.prototype.serializeWithBufferAndIndex = function(object, finalBuffer, options) {
                    options = options || {};
                    var checkKeys = typeof options.checkKeys == "boolean" ? options.checkKeys : false;
                    var serializeFunctions = typeof options.serializeFunctions == "boolean" ? options.serializeFunctions : false;
                    var ignoreUndefined = typeof options.ignoreUndefined == "boolean" ? options.ignoreUndefined : true;
                    var startIndex = typeof options.index == "number" ? options.index : 0;
                    var serializationIndex = serializer(buffer, object, checkKeys, startIndex || 0, 0, serializeFunctions, ignoreUndefined);
                    buffer.copy(finalBuffer, startIndex, 0, serializationIndex);
                    return serializationIndex - 1;
                };
                BSON.prototype.deserialize = function(buffer, options) {
                    return deserialize(buffer, options);
                };
                BSON.prototype.calculateObjectSize = function(object, options) {
                    options = options || {};
                    var serializeFunctions = typeof options.serializeFunctions == "boolean" ? options.serializeFunctions : false;
                    var ignoreUndefined = typeof options.ignoreUndefined == "boolean" ? options.ignoreUndefined : true;
                    return calculateObjectSize(object, serializeFunctions, ignoreUndefined);
                };
                BSON.prototype.deserializeStream = function(data, startIndex, numberOfDocuments, documents, docStartIndex, options) {
                    options = options != null ? options : {};
                    var index = startIndex;
                    for (var i = 0; i < numberOfDocuments; i++) {
                        var size = data[index] | data[index + 1] << 8 | data[index + 2] << 16 | data[index + 3] << 24;
                        options["index"] = index;
                        documents[docStartIndex + i] = this.deserialize(data, options);
                        index = index + size;
                    }
                    return index;
                };
                BSON.BSON_INT32_MAX = 2147483647;
                BSON.BSON_INT32_MIN = -2147483648;
                BSON.BSON_INT64_MAX = Math.pow(2, 63) - 1;
                BSON.BSON_INT64_MIN = -Math.pow(2, 63);
                BSON.JS_INT_MAX = 9007199254740992;
                BSON.JS_INT_MIN = -9007199254740992;
                var JS_INT_MAX_LONG = Long.fromNumber(9007199254740992);
                var JS_INT_MIN_LONG = Long.fromNumber(-9007199254740992);
                BSON.BSON_DATA_NUMBER = 1;
                BSON.BSON_DATA_STRING = 2;
                BSON.BSON_DATA_OBJECT = 3;
                BSON.BSON_DATA_ARRAY = 4;
                BSON.BSON_DATA_BINARY = 5;
                BSON.BSON_DATA_OID = 7;
                BSON.BSON_DATA_BOOLEAN = 8;
                BSON.BSON_DATA_DATE = 9;
                BSON.BSON_DATA_NULL = 10;
                BSON.BSON_DATA_REGEXP = 11;
                BSON.BSON_DATA_CODE = 13;
                BSON.BSON_DATA_SYMBOL = 14;
                BSON.BSON_DATA_CODE_W_SCOPE = 15;
                BSON.BSON_DATA_INT = 16;
                BSON.BSON_DATA_TIMESTAMP = 17;
                BSON.BSON_DATA_LONG = 18;
                BSON.BSON_DATA_MIN_KEY = 255;
                BSON.BSON_DATA_MAX_KEY = 127;
                BSON.BSON_BINARY_SUBTYPE_DEFAULT = 0;
                BSON.BSON_BINARY_SUBTYPE_FUNCTION = 1;
                BSON.BSON_BINARY_SUBTYPE_BYTE_ARRAY = 2;
                BSON.BSON_BINARY_SUBTYPE_UUID = 3;
                BSON.BSON_BINARY_SUBTYPE_MD5 = 4;
                BSON.BSON_BINARY_SUBTYPE_USER_DEFINED = 128;
                module.exports = BSON;
                module.exports.Code = Code;
                module.exports.Map = Map;
                module.exports.Symbol = Symbol;
                module.exports.BSON = BSON;
                module.exports.DBRef = DBRef;
                module.exports.Binary = Binary;
                module.exports.ObjectID = ObjectID;
                module.exports.Long = Long;
                module.exports.Timestamp = Timestamp;
                module.exports.Double = Double;
                module.exports.Int32 = Int32;
                module.exports.MinKey = MinKey;
                module.exports.MaxKey = MaxKey;
                module.exports.BSONRegExp = BSONRegExp;
                module.exports.Decimal128 = Decimal128;
            }).call(this, require("buffer").Buffer);
        }, {
            "./binary": 13,
            "./code": 15,
            "./db_ref": 16,
            "./decimal128": 17,
            "./double": 18,
            "./float_parser": 19,
            "./int_32": 20,
            "./long": 21,
            "./map": 22,
            "./max_key": 23,
            "./min_key": 24,
            "./objectid": 25,
            "./parser/calculate_size": 26,
            "./parser/deserializer": 27,
            "./parser/serializer": 28,
            "./regexp": 29,
            "./symbol": 30,
            "./timestamp": 31,
            buffer: 1
        } ],
        15: [ function(require, module, exports) {
            var Code = function Code(code, scope) {
                if (!(this instanceof Code)) return new Code(code, scope);
                this._bsontype = "Code";
                this.code = code;
                this.scope = scope;
            };
            Code.prototype.toJSON = function() {
                return {
                    scope: this.scope,
                    code: this.code
                };
            };
            module.exports = Code;
            module.exports.Code = Code;
        }, {} ],
        16: [ function(require, module, exports) {
            function DBRef(namespace, oid, db) {
                if (!(this instanceof DBRef)) return new DBRef(namespace, oid, db);
                this._bsontype = "DBRef";
                this.namespace = namespace;
                this.oid = oid;
                this.db = db;
            }
            DBRef.prototype.toJSON = function() {
                return {
                    $ref: this.namespace,
                    $id: this.oid,
                    $db: this.db == null ? "" : this.db
                };
            };
            module.exports = DBRef;
            module.exports.DBRef = DBRef;
        }, {} ],
        17: [ function(require, module, exports) {
            (function(Buffer) {
                "use strict";
                var Long = require("./long");
                var PARSE_STRING_REGEXP = /^(\+|\-)?(\d+|(\d*\.\d*))?(E|e)?([\-\+])?(\d+)?$/;
                var PARSE_INF_REGEXP = /^(\+|\-)?(Infinity|inf)$/i;
                var PARSE_NAN_REGEXP = /^(\+|\-)?NaN$/i;
                var EXPONENT_MAX = 6111;
                var EXPONENT_MIN = -6176;
                var EXPONENT_BIAS = 6176;
                var MAX_DIGITS = 34;
                var NAN_BUFFER = [ 124, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ].reverse();
                var INF_NEGATIVE_BUFFER = [ 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ].reverse();
                var INF_POSITIVE_BUFFER = [ 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ].reverse();
                var EXPONENT_REGEX = /^([\-\+])?(\d+)?$/;
                var isDigit = function(value) {
                    return !isNaN(parseInt(value, 10));
                };
                var divideu128 = function(value) {
                    var DIVISOR = Long.fromNumber(1e3 * 1e3 * 1e3);
                    var _rem = Long.fromNumber(0);
                    var i = 0;
                    if (!value.parts[0] && !value.parts[1] && !value.parts[2] && !value.parts[3]) {
                        return {
                            quotient: value,
                            rem: _rem
                        };
                    }
                    for (var i = 0; i <= 3; i++) {
                        _rem = _rem.shiftLeft(32);
                        _rem = _rem.add(new Long(value.parts[i], 0));
                        value.parts[i] = _rem.div(DIVISOR).low_;
                        _rem = _rem.modulo(DIVISOR);
                    }
                    return {
                        quotient: value,
                        rem: _rem
                    };
                };
                var multiply64x2 = function(left, right) {
                    if (!left && !right) {
                        return {
                            high: Long.fromNumber(0),
                            low: Long.fromNumber(0)
                        };
                    }
                    var leftHigh = left.shiftRightUnsigned(32);
                    var leftLow = new Long(left.getLowBits(), 0);
                    var rightHigh = right.shiftRightUnsigned(32);
                    var rightLow = new Long(right.getLowBits(), 0);
                    var productHigh = leftHigh.multiply(rightHigh);
                    var productMid = leftHigh.multiply(rightLow);
                    var productMid2 = leftLow.multiply(rightHigh);
                    var productLow = leftLow.multiply(rightLow);
                    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
                    productMid = new Long(productMid.getLowBits(), 0).add(productMid2).add(productLow.shiftRightUnsigned(32));
                    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
                    productLow = productMid.shiftLeft(32).add(new Long(productLow.getLowBits(), 0));
                    return {
                        high: productHigh,
                        low: productLow
                    };
                };
                var lessThan = function(left, right) {
                    var uhleft = left.high_ >>> 0;
                    var uhright = right.high_ >>> 0;
                    if (uhleft < uhright) {
                        return true;
                    } else if (uhleft == uhright) {
                        var ulleft = left.low_ >>> 0;
                        var ulright = right.low_ >>> 0;
                        if (ulleft < ulright) return true;
                    }
                    return false;
                };
                var longtoHex = function(value) {
                    var buffer = new Buffer(8);
                    var index = 0;
                    buffer[index++] = value.low_ & 255;
                    buffer[index++] = value.low_ >> 8 & 255;
                    buffer[index++] = value.low_ >> 16 & 255;
                    buffer[index++] = value.low_ >> 24 & 255;
                    buffer[index++] = value.high_ & 255;
                    buffer[index++] = value.high_ >> 8 & 255;
                    buffer[index++] = value.high_ >> 16 & 255;
                    buffer[index++] = value.high_ >> 24 & 255;
                    return buffer.reverse().toString("hex");
                };
                var int32toHex = function(value) {
                    var buffer = new Buffer(4);
                    var index = 0;
                    buffer[index++] = value & 255;
                    buffer[index++] = value >> 8 & 255;
                    buffer[index++] = value >> 16 & 255;
                    buffer[index++] = value >> 24 & 255;
                    return buffer.reverse().toString("hex");
                };
                var Decimal128 = function(bytes) {
                    this._bsontype = "Decimal128";
                    this.bytes = bytes;
                };
                Decimal128.fromString = function(string) {
                    var isNegative = false;
                    var sawRadix = false;
                    var foundNonZero = false;
                    var significantDigits = 0;
                    var nDigitsRead = 0;
                    var nDigits = 0;
                    var radixPosition = 0;
                    var firstNonZero = 0;
                    var digits = [ 0 ];
                    var nDigitsStored = 0;
                    var digitsInsert = 0;
                    var firstDigit = 0;
                    var lastDigit = 0;
                    var exponent = 0;
                    var i = 0;
                    var significandHigh = [ 0, 0 ];
                    var significandLow = [ 0, 0 ];
                    var biasedExponent = 0;
                    var index = 0;
                    string = string.trim();
                    var stringMatch = string.match(PARSE_STRING_REGEXP);
                    var infMatch = string.match(PARSE_INF_REGEXP);
                    var nanMatch = string.match(PARSE_NAN_REGEXP);
                    if (!stringMatch && !infMatch && !nanMatch || string.length == 0) {
                        throw new Error("" + string + " not a valid Decimal128 string");
                    }
                    if (stringMatch && stringMatch[4] && stringMatch[2] === undefined) {
                        throw new Error("" + string + " not a valid Decimal128 string");
                    }
                    if (string[index] == "+" || string[index] == "-") {
                        isNegative = string[index++] == "-";
                    }
                    if (!isDigit(string[index]) && string[index] != ".") {
                        if (string[index] == "i" || string[index] == "I") {
                            return new Decimal128(new Buffer(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
                        } else if (string[index] == "N") {
                            return new Decimal128(new Buffer(NAN_BUFFER));
                        }
                    }
                    while (isDigit(string[index]) || string[index] == ".") {
                        if (string[index] == ".") {
                            if (sawRadix) {
                                return new Decimal128(new Buffer(NAN_BUFFER));
                            }
                            sawRadix = true;
                            index = index + 1;
                            continue;
                        }
                        if (nDigitsStored < 34) {
                            if (string[index] != "0" || foundNonZero) {
                                if (!foundNonZero) {
                                    firstNonZero = nDigitsRead;
                                }
                                foundNonZero = true;
                                digits[digitsInsert++] = parseInt(string[index], 10);
                                nDigitsStored = nDigitsStored + 1;
                            }
                        }
                        if (foundNonZero) {
                            nDigits = nDigits + 1;
                        }
                        if (sawRadix) {
                            radixPosition = radixPosition + 1;
                        }
                        nDigitsRead = nDigitsRead + 1;
                        index = index + 1;
                    }
                    if (sawRadix && !nDigitsRead) {
                        throw new Error("" + string + " not a valid Decimal128 string");
                    }
                    if (string[index] == "e" || string[index] == "E") {
                        var match = string.substr(++index).match(EXPONENT_REGEX);
                        if (!match || !match[2]) {
                            return new Decimal128(new Buffer(NAN_BUFFER));
                        }
                        exponent = parseInt(match[0], 10);
                        index = index + match[0].length;
                    }
                    if (string[index]) {
                        return new Decimal128(new Buffer(NAN_BUFFER));
                    }
                    firstDigit = 0;
                    if (!nDigitsStored) {
                        firstDigit = 0;
                        lastDigit = 0;
                        digits[0] = 0;
                        nDigits = 1;
                        nDigitsStored = 1;
                        significantDigits = 0;
                    } else {
                        lastDigit = nDigitsStored - 1;
                        significantDigits = nDigits;
                        if (exponent != 0 && significantDigits != 1) {
                            while (string[firstNonZero + significantDigits - 1] == "0") {
                                significantDigits = significantDigits - 1;
                            }
                        }
                    }
                    if (exponent <= radixPosition && radixPosition - exponent > 1 << 14) {
                        exponent = EXPONENT_MIN;
                    } else {
                        exponent = exponent - radixPosition;
                    }
                    while (exponent > EXPONENT_MAX) {
                        lastDigit = lastDigit + 1;
                        if (lastDigit - firstDigit > MAX_DIGITS) {
                            var digitsString = digits.join("");
                            if (digitsString.match(/^0+$/)) {
                                exponent = EXPONENT_MAX;
                                break;
                            } else {
                                return new Decimal128(new Buffer(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
                            }
                        }
                        exponent = exponent - 1;
                    }
                    while (exponent < EXPONENT_MIN || nDigitsStored < nDigits) {
                        if (lastDigit == 0) {
                            exponent = EXPONENT_MIN;
                            significantDigits = 0;
                            break;
                        }
                        if (nDigitsStored < nDigits) {
                            nDigits = nDigits - 1;
                        } else {
                            lastDigit = lastDigit - 1;
                        }
                        if (exponent < EXPONENT_MAX) {
                            exponent = exponent + 1;
                        } else {
                            var digitsString = digits.join("");
                            if (digitsString.match(/^0+$/)) {
                                exponent = EXPONENT_MAX;
                                break;
                            } else {
                                return new Decimal128(new Buffer(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
                            }
                        }
                    }
                    if (lastDigit - firstDigit + 1 < significantDigits && string[significantDigits] != "0") {
                        var endOfString = nDigitsRead;
                        if (sawRadix && exponent == EXPONENT_MIN) {
                            firstNonZero = firstNonZero + 1;
                            endOfString = endOfString + 1;
                        }
                        var roundDigit = parseInt(string[firstNonZero + lastDigit + 1], 10);
                        var roundBit = 0;
                        if (roundDigit >= 5) {
                            roundBit = 1;
                            if (roundDigit == 5) {
                                roundBit = digits[lastDigit] % 2 == 1;
                                for (var i = firstNonZero + lastDigit + 2; i < endOfString; i++) {
                                    if (parseInt(string[i], 10)) {
                                        roundBit = 1;
                                        break;
                                    }
                                }
                            }
                        }
                        if (roundBit) {
                            var dIdx = lastDigit;
                            for (;dIdx >= 0; dIdx--) {
                                if (++digits[dIdx] > 9) {
                                    digits[dIdx] = 0;
                                    if (dIdx == 0) {
                                        if (exponent < EXPONENT_MAX) {
                                            exponent = exponent + 1;
                                            digits[dIdx] = 1;
                                        } else {
                                            return new Decimal128(new Buffer(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
                                        }
                                    }
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                    significandHigh = Long.fromNumber(0);
                    significandLow = Long.fromNumber(0);
                    if (significantDigits == 0) {
                        significandHigh = Long.fromNumber(0);
                        significandLow = Long.fromNumber(0);
                    } else if (lastDigit - firstDigit < 17) {
                        var dIdx = firstDigit;
                        significandLow = Long.fromNumber(digits[dIdx++]);
                        significandHigh = new Long(0, 0);
                        for (;dIdx <= lastDigit; dIdx++) {
                            significandLow = significandLow.multiply(Long.fromNumber(10));
                            significandLow = significandLow.add(Long.fromNumber(digits[dIdx]));
                        }
                    } else {
                        var dIdx = firstDigit;
                        significandHigh = Long.fromNumber(digits[dIdx++]);
                        for (;dIdx <= lastDigit - 17; dIdx++) {
                            significandHigh = significandHigh.multiply(Long.fromNumber(10));
                            significandHigh = significandHigh.add(Long.fromNumber(digits[dIdx]));
                        }
                        significandLow = Long.fromNumber(digits[dIdx++]);
                        for (;dIdx <= lastDigit; dIdx++) {
                            significandLow = significandLow.multiply(Long.fromNumber(10));
                            significandLow = significandLow.add(Long.fromNumber(digits[dIdx]));
                        }
                    }
                    var significand = multiply64x2(significandHigh, Long.fromString("100000000000000000"));
                    significand.low = significand.low.add(significandLow);
                    if (lessThan(significand.low, significandLow)) {
                        significand.high = significand.high.add(Long.fromNumber(1));
                    }
                    var biasedExponent = exponent + EXPONENT_BIAS;
                    var dec = {
                        low: Long.fromNumber(0),
                        high: Long.fromNumber(0)
                    };
                    if (significand.high.shiftRightUnsigned(49).and(Long.fromNumber(1)).equals(Long.fromNumber)) {
                        dec.high = dec.high.or(Long.fromNumber(3).shiftLeft(61));
                        dec.high = dec.high.or(Long.fromNumber(biasedExponent).and(Long.fromNumber(16383).shiftLeft(47)));
                        dec.high = dec.high.or(significand.high.and(Long.fromNumber(0x7fffffffffff)));
                    } else {
                        dec.high = dec.high.or(Long.fromNumber(biasedExponent & 16383).shiftLeft(49));
                        dec.high = dec.high.or(significand.high.and(Long.fromNumber(562949953421311)));
                    }
                    dec.low = significand.low;
                    if (isNegative) {
                        dec.high = dec.high.or(Long.fromString("9223372036854775808"));
                    }
                    var buffer = new Buffer(16);
                    var index = 0;
                    buffer[index++] = dec.low.low_ & 255;
                    buffer[index++] = dec.low.low_ >> 8 & 255;
                    buffer[index++] = dec.low.low_ >> 16 & 255;
                    buffer[index++] = dec.low.low_ >> 24 & 255;
                    buffer[index++] = dec.low.high_ & 255;
                    buffer[index++] = dec.low.high_ >> 8 & 255;
                    buffer[index++] = dec.low.high_ >> 16 & 255;
                    buffer[index++] = dec.low.high_ >> 24 & 255;
                    buffer[index++] = dec.high.low_ & 255;
                    buffer[index++] = dec.high.low_ >> 8 & 255;
                    buffer[index++] = dec.high.low_ >> 16 & 255;
                    buffer[index++] = dec.high.low_ >> 24 & 255;
                    buffer[index++] = dec.high.high_ & 255;
                    buffer[index++] = dec.high.high_ >> 8 & 255;
                    buffer[index++] = dec.high.high_ >> 16 & 255;
                    buffer[index++] = dec.high.high_ >> 24 & 255;
                    return new Decimal128(buffer);
                };
                var COMBINATION_MASK = 31;
                var EXPONENT_MASK = 16383;
                var COMBINATION_INFINITY = 30;
                var COMBINATION_NAN = 31;
                var COMBINATION_SNAN = 32;
                var EXPONENT_BIAS = 6176;
                Decimal128.prototype.toString = function() {
                    var high;
                    var midh;
                    var midl;
                    var low;
                    var combination;
                    var biased_exponent;
                    var significand_digits = 0;
                    var significand = new Array(36);
                    for (var i = 0; i < significand.length; i++) significand[i] = 0;
                    var index = 0;
                    var exponent;
                    var scientific_exponent;
                    var is_zero = false;
                    var significand_msb;
                    var significand128 = {
                        parts: new Array(4)
                    };
                    var i;
                    var j, k;
                    var string = [];
                    var index = 0;
                    var buffer = this.bytes;
                    low = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                    midl = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                    midh = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                    high = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                    var index = 0;
                    var dec = {
                        low: new Long(low, midl),
                        high: new Long(midh, high)
                    };
                    if (dec.high.lessThan(Long.ZERO)) {
                        string.push("-");
                    }
                    combination = high >> 26 & COMBINATION_MASK;
                    if (combination >> 3 == 3) {
                        if (combination == COMBINATION_INFINITY) {
                            return string.join("") + "Infinity";
                        } else if (combination == COMBINATION_NAN) {
                            return "NaN";
                        } else {
                            biased_exponent = high >> 15 & EXPONENT_MASK;
                            significand_msb = 8 + (high >> 14 & 1);
                        }
                    } else {
                        significand_msb = high >> 14 & 7;
                        biased_exponent = high >> 17 & EXPONENT_MASK;
                    }
                    exponent = biased_exponent - EXPONENT_BIAS;
                    significand128.parts[0] = (high & 16383) + ((significand_msb & 15) << 14);
                    significand128.parts[1] = midh;
                    significand128.parts[2] = midl;
                    significand128.parts[3] = low;
                    if (significand128.parts[0] == 0 && significand128.parts[1] == 0 && significand128.parts[2] == 0 && significand128.parts[3] == 0) {
                        is_zero = true;
                    } else {
                        for (var k = 3; k >= 0; k--) {
                            var least_digits = 0;
                            var result = divideu128(significand128);
                            significand128 = result.quotient;
                            least_digits = result.rem.low_;
                            if (!least_digits) continue;
                            for (var j = 8; j >= 0; j--) {
                                significand[k * 9 + j] = least_digits % 10;
                                least_digits = Math.floor(least_digits / 10);
                            }
                        }
                    }
                    if (is_zero) {
                        significand_digits = 1;
                        significand[index] = 0;
                    } else {
                        significand_digits = 36;
                        var i = 0;
                        while (!significand[index]) {
                            i++;
                            significand_digits = significand_digits - 1;
                            index = index + 1;
                        }
                    }
                    scientific_exponent = significand_digits - 1 + exponent;
                    if (scientific_exponent >= 34 || scientific_exponent <= -7 || exponent > 0) {
                        string.push(significand[index++]);
                        significand_digits = significand_digits - 1;
                        if (significand_digits) {
                            string.push(".");
                        }
                        for (var i = 0; i < significand_digits; i++) {
                            string.push(significand[index++]);
                        }
                        string.push("E");
                        if (scientific_exponent > 0) {
                            string.push("+" + scientific_exponent);
                        } else {
                            string.push(scientific_exponent);
                        }
                    } else {
                        if (exponent >= 0) {
                            for (var i = 0; i < significand_digits; i++) {
                                string.push(significand[index++]);
                            }
                        } else {
                            var radix_position = significand_digits + exponent;
                            if (radix_position > 0) {
                                for (var i = 0; i < radix_position; i++) {
                                    string.push(significand[index++]);
                                }
                            } else {
                                string.push("0");
                            }
                            string.push(".");
                            while (radix_position++ < 0) {
                                string.push("0");
                            }
                            for (var i = 0; i < significand_digits - Math.max(radix_position - 1, 0); i++) {
                                string.push(significand[index++]);
                            }
                        }
                    }
                    return string.join("");
                };
                Decimal128.prototype.toJSON = function() {
                    return {
                        $numberDecimal: this.toString()
                    };
                };
                module.exports = Decimal128;
                module.exports.Decimal128 = Decimal128;
            }).call(this, require("buffer").Buffer);
        }, {
            "./long": 21,
            buffer: 1
        } ],
        18: [ function(require, module, exports) {
            function Double(value) {
                if (!(this instanceof Double)) return new Double(value);
                this._bsontype = "Double";
                this.value = value;
            }
            Double.prototype.valueOf = function() {
                return this.value;
            };
            Double.prototype.toJSON = function() {
                return this.value;
            };
            module.exports = Double;
            module.exports.Double = Double;
        }, {} ],
        19: [ function(require, module, exports) {
            var readIEEE754 = function(buffer, offset, endian, mLen, nBytes) {
                var e, m, bBE = endian === "big", eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, nBits = -7, i = bBE ? 0 : nBytes - 1, d = bBE ? 1 : -1, s = buffer[offset + i];
                i += d;
                e = s & (1 << -nBits) - 1;
                s >>= -nBits;
                nBits += eLen;
                for (;nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) ;
                m = e & (1 << -nBits) - 1;
                e >>= -nBits;
                nBits += mLen;
                for (;nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) ;
                if (e === 0) {
                    e = 1 - eBias;
                } else if (e === eMax) {
                    return m ? NaN : (s ? -1 : 1) * Infinity;
                } else {
                    m = m + Math.pow(2, mLen);
                    e = e - eBias;
                }
                return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
            };
            var writeIEEE754 = function(buffer, value, offset, endian, mLen, nBytes) {
                var e, m, c, bBE = endian === "big", eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, i = bBE ? nBytes - 1 : 0, d = bBE ? -1 : 1, s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
                value = Math.abs(value);
                if (isNaN(value) || value === Infinity) {
                    m = isNaN(value) ? 1 : 0;
                    e = eMax;
                } else {
                    e = Math.floor(Math.log(value) / Math.LN2);
                    if (value * (c = Math.pow(2, -e)) < 1) {
                        e--;
                        c *= 2;
                    }
                    if (e + eBias >= 1) {
                        value += rt / c;
                    } else {
                        value += rt * Math.pow(2, 1 - eBias);
                    }
                    if (value * c >= 2) {
                        e++;
                        c /= 2;
                    }
                    if (e + eBias >= eMax) {
                        m = 0;
                        e = eMax;
                    } else if (e + eBias >= 1) {
                        m = (value * c - 1) * Math.pow(2, mLen);
                        e = e + eBias;
                    } else {
                        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                        e = 0;
                    }
                }
                for (;mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) ;
                e = e << mLen | m;
                eLen += mLen;
                for (;eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) ;
                buffer[offset + i - d] |= s * 128;
            };
            exports.readIEEE754 = readIEEE754;
            exports.writeIEEE754 = writeIEEE754;
        }, {} ],
        20: [ function(require, module, exports) {
            var Int32 = function(value) {
                if (!(this instanceof Int32)) return new Int32(value);
                this._bsontype = "Int32";
                this.value = value;
            };
            Int32.prototype.valueOf = function() {
                return this.value;
            };
            Int32.prototype.toJSON = function() {
                return this.value;
            };
            module.exports = Int32;
            module.exports.Int32 = Int32;
        }, {} ],
        21: [ function(require, module, exports) {
            function Long(low, high) {
                if (!(this instanceof Long)) return new Long(low, high);
                this._bsontype = "Long";
                this.low_ = low | 0;
                this.high_ = high | 0;
            }
            Long.prototype.toInt = function() {
                return this.low_;
            };
            Long.prototype.toNumber = function() {
                return this.high_ * Long.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned();
            };
            Long.prototype.toJSON = function() {
                return this.toString();
            };
            Long.prototype.toString = function(opt_radix) {
                var radix = opt_radix || 10;
                if (radix < 2 || 36 < radix) {
                    throw Error("radix out of range: " + radix);
                }
                if (this.isZero()) {
                    return "0";
                }
                if (this.isNegative()) {
                    if (this.equals(Long.MIN_VALUE)) {
                        var radixLong = Long.fromNumber(radix);
                        var div = this.div(radixLong);
                        var rem = div.multiply(radixLong).subtract(this);
                        return div.toString(radix) + rem.toInt().toString(radix);
                    } else {
                        return "-" + this.negate().toString(radix);
                    }
                }
                var radixToPower = Long.fromNumber(Math.pow(radix, 6));
                var rem = this;
                var result = "";
                while (true) {
                    var remDiv = rem.div(radixToPower);
                    var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
                    var digits = intval.toString(radix);
                    rem = remDiv;
                    if (rem.isZero()) {
                        return digits + result;
                    } else {
                        while (digits.length < 6) {
                            digits = "0" + digits;
                        }
                        result = "" + digits + result;
                    }
                }
            };
            Long.prototype.getHighBits = function() {
                return this.high_;
            };
            Long.prototype.getLowBits = function() {
                return this.low_;
            };
            Long.prototype.getLowBitsUnsigned = function() {
                return this.low_ >= 0 ? this.low_ : Long.TWO_PWR_32_DBL_ + this.low_;
            };
            Long.prototype.getNumBitsAbs = function() {
                if (this.isNegative()) {
                    if (this.equals(Long.MIN_VALUE)) {
                        return 64;
                    } else {
                        return this.negate().getNumBitsAbs();
                    }
                } else {
                    var val = this.high_ != 0 ? this.high_ : this.low_;
                    for (var bit = 31; bit > 0; bit--) {
                        if ((val & 1 << bit) != 0) {
                            break;
                        }
                    }
                    return this.high_ != 0 ? bit + 33 : bit + 1;
                }
            };
            Long.prototype.isZero = function() {
                return this.high_ == 0 && this.low_ == 0;
            };
            Long.prototype.isNegative = function() {
                return this.high_ < 0;
            };
            Long.prototype.isOdd = function() {
                return (this.low_ & 1) == 1;
            };
            Long.prototype.equals = function(other) {
                return this.high_ == other.high_ && this.low_ == other.low_;
            };
            Long.prototype.notEquals = function(other) {
                return this.high_ != other.high_ || this.low_ != other.low_;
            };
            Long.prototype.lessThan = function(other) {
                return this.compare(other) < 0;
            };
            Long.prototype.lessThanOrEqual = function(other) {
                return this.compare(other) <= 0;
            };
            Long.prototype.greaterThan = function(other) {
                return this.compare(other) > 0;
            };
            Long.prototype.greaterThanOrEqual = function(other) {
                return this.compare(other) >= 0;
            };
            Long.prototype.compare = function(other) {
                if (this.equals(other)) {
                    return 0;
                }
                var thisNeg = this.isNegative();
                var otherNeg = other.isNegative();
                if (thisNeg && !otherNeg) {
                    return -1;
                }
                if (!thisNeg && otherNeg) {
                    return 1;
                }
                if (this.subtract(other).isNegative()) {
                    return -1;
                } else {
                    return 1;
                }
            };
            Long.prototype.negate = function() {
                if (this.equals(Long.MIN_VALUE)) {
                    return Long.MIN_VALUE;
                } else {
                    return this.not().add(Long.ONE);
                }
            };
            Long.prototype.add = function(other) {
                var a48 = this.high_ >>> 16;
                var a32 = this.high_ & 65535;
                var a16 = this.low_ >>> 16;
                var a00 = this.low_ & 65535;
                var b48 = other.high_ >>> 16;
                var b32 = other.high_ & 65535;
                var b16 = other.low_ >>> 16;
                var b00 = other.low_ & 65535;
                var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
                c00 += a00 + b00;
                c16 += c00 >>> 16;
                c00 &= 65535;
                c16 += a16 + b16;
                c32 += c16 >>> 16;
                c16 &= 65535;
                c32 += a32 + b32;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c48 += a48 + b48;
                c48 &= 65535;
                return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
            };
            Long.prototype.subtract = function(other) {
                return this.add(other.negate());
            };
            Long.prototype.multiply = function(other) {
                if (this.isZero()) {
                    return Long.ZERO;
                } else if (other.isZero()) {
                    return Long.ZERO;
                }
                if (this.equals(Long.MIN_VALUE)) {
                    return other.isOdd() ? Long.MIN_VALUE : Long.ZERO;
                } else if (other.equals(Long.MIN_VALUE)) {
                    return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
                }
                if (this.isNegative()) {
                    if (other.isNegative()) {
                        return this.negate().multiply(other.negate());
                    } else {
                        return this.negate().multiply(other).negate();
                    }
                } else if (other.isNegative()) {
                    return this.multiply(other.negate()).negate();
                }
                if (this.lessThan(Long.TWO_PWR_24_) && other.lessThan(Long.TWO_PWR_24_)) {
                    return Long.fromNumber(this.toNumber() * other.toNumber());
                }
                var a48 = this.high_ >>> 16;
                var a32 = this.high_ & 65535;
                var a16 = this.low_ >>> 16;
                var a00 = this.low_ & 65535;
                var b48 = other.high_ >>> 16;
                var b32 = other.high_ & 65535;
                var b16 = other.low_ >>> 16;
                var b00 = other.low_ & 65535;
                var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
                c00 += a00 * b00;
                c16 += c00 >>> 16;
                c00 &= 65535;
                c16 += a16 * b00;
                c32 += c16 >>> 16;
                c16 &= 65535;
                c16 += a00 * b16;
                c32 += c16 >>> 16;
                c16 &= 65535;
                c32 += a32 * b00;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c32 += a16 * b16;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c32 += a00 * b32;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
                c48 &= 65535;
                return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
            };
            Long.prototype.div = function(other) {
                if (other.isZero()) {
                    throw Error("division by zero");
                } else if (this.isZero()) {
                    return Long.ZERO;
                }
                if (this.equals(Long.MIN_VALUE)) {
                    if (other.equals(Long.ONE) || other.equals(Long.NEG_ONE)) {
                        return Long.MIN_VALUE;
                    } else if (other.equals(Long.MIN_VALUE)) {
                        return Long.ONE;
                    } else {
                        var halfThis = this.shiftRight(1);
                        var approx = halfThis.div(other).shiftLeft(1);
                        if (approx.equals(Long.ZERO)) {
                            return other.isNegative() ? Long.ONE : Long.NEG_ONE;
                        } else {
                            var rem = this.subtract(other.multiply(approx));
                            var result = approx.add(rem.div(other));
                            return result;
                        }
                    }
                } else if (other.equals(Long.MIN_VALUE)) {
                    return Long.ZERO;
                }
                if (this.isNegative()) {
                    if (other.isNegative()) {
                        return this.negate().div(other.negate());
                    } else {
                        return this.negate().div(other).negate();
                    }
                } else if (other.isNegative()) {
                    return this.div(other.negate()).negate();
                }
                var res = Long.ZERO;
                var rem = this;
                while (rem.greaterThanOrEqual(other)) {
                    var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
                    var log2 = Math.ceil(Math.log(approx) / Math.LN2);
                    var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
                    var approxRes = Long.fromNumber(approx);
                    var approxRem = approxRes.multiply(other);
                    while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
                        approx -= delta;
                        approxRes = Long.fromNumber(approx);
                        approxRem = approxRes.multiply(other);
                    }
                    if (approxRes.isZero()) {
                        approxRes = Long.ONE;
                    }
                    res = res.add(approxRes);
                    rem = rem.subtract(approxRem);
                }
                return res;
            };
            Long.prototype.modulo = function(other) {
                return this.subtract(this.div(other).multiply(other));
            };
            Long.prototype.not = function() {
                return Long.fromBits(~this.low_, ~this.high_);
            };
            Long.prototype.and = function(other) {
                return Long.fromBits(this.low_ & other.low_, this.high_ & other.high_);
            };
            Long.prototype.or = function(other) {
                return Long.fromBits(this.low_ | other.low_, this.high_ | other.high_);
            };
            Long.prototype.xor = function(other) {
                return Long.fromBits(this.low_ ^ other.low_, this.high_ ^ other.high_);
            };
            Long.prototype.shiftLeft = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var low = this.low_;
                    if (numBits < 32) {
                        var high = this.high_;
                        return Long.fromBits(low << numBits, high << numBits | low >>> 32 - numBits);
                    } else {
                        return Long.fromBits(0, low << numBits - 32);
                    }
                }
            };
            Long.prototype.shiftRight = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var high = this.high_;
                    if (numBits < 32) {
                        var low = this.low_;
                        return Long.fromBits(low >>> numBits | high << 32 - numBits, high >> numBits);
                    } else {
                        return Long.fromBits(high >> numBits - 32, high >= 0 ? 0 : -1);
                    }
                }
            };
            Long.prototype.shiftRightUnsigned = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var high = this.high_;
                    if (numBits < 32) {
                        var low = this.low_;
                        return Long.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits);
                    } else if (numBits == 32) {
                        return Long.fromBits(high, 0);
                    } else {
                        return Long.fromBits(high >>> numBits - 32, 0);
                    }
                }
            };
            Long.fromInt = function(value) {
                if (-128 <= value && value < 128) {
                    var cachedObj = Long.INT_CACHE_[value];
                    if (cachedObj) {
                        return cachedObj;
                    }
                }
                var obj = new Long(value | 0, value < 0 ? -1 : 0);
                if (-128 <= value && value < 128) {
                    Long.INT_CACHE_[value] = obj;
                }
                return obj;
            };
            Long.fromNumber = function(value) {
                if (isNaN(value) || !isFinite(value)) {
                    return Long.ZERO;
                } else if (value <= -Long.TWO_PWR_63_DBL_) {
                    return Long.MIN_VALUE;
                } else if (value + 1 >= Long.TWO_PWR_63_DBL_) {
                    return Long.MAX_VALUE;
                } else if (value < 0) {
                    return Long.fromNumber(-value).negate();
                } else {
                    return new Long(value % Long.TWO_PWR_32_DBL_ | 0, value / Long.TWO_PWR_32_DBL_ | 0);
                }
            };
            Long.fromBits = function(lowBits, highBits) {
                return new Long(lowBits, highBits);
            };
            Long.fromString = function(str, opt_radix) {
                if (str.length == 0) {
                    throw Error("number format error: empty string");
                }
                var radix = opt_radix || 10;
                if (radix < 2 || 36 < radix) {
                    throw Error("radix out of range: " + radix);
                }
                if (str.charAt(0) == "-") {
                    return Long.fromString(str.substring(1), radix).negate();
                } else if (str.indexOf("-") >= 0) {
                    throw Error('number format error: interior "-" character: ' + str);
                }
                var radixToPower = Long.fromNumber(Math.pow(radix, 8));
                var result = Long.ZERO;
                for (var i = 0; i < str.length; i += 8) {
                    var size = Math.min(8, str.length - i);
                    var value = parseInt(str.substring(i, i + size), radix);
                    if (size < 8) {
                        var power = Long.fromNumber(Math.pow(radix, size));
                        result = result.multiply(power).add(Long.fromNumber(value));
                    } else {
                        result = result.multiply(radixToPower);
                        result = result.add(Long.fromNumber(value));
                    }
                }
                return result;
            };
            Long.INT_CACHE_ = {};
            Long.TWO_PWR_16_DBL_ = 1 << 16;
            Long.TWO_PWR_24_DBL_ = 1 << 24;
            Long.TWO_PWR_32_DBL_ = Long.TWO_PWR_16_DBL_ * Long.TWO_PWR_16_DBL_;
            Long.TWO_PWR_31_DBL_ = Long.TWO_PWR_32_DBL_ / 2;
            Long.TWO_PWR_48_DBL_ = Long.TWO_PWR_32_DBL_ * Long.TWO_PWR_16_DBL_;
            Long.TWO_PWR_64_DBL_ = Long.TWO_PWR_32_DBL_ * Long.TWO_PWR_32_DBL_;
            Long.TWO_PWR_63_DBL_ = Long.TWO_PWR_64_DBL_ / 2;
            Long.ZERO = Long.fromInt(0);
            Long.ONE = Long.fromInt(1);
            Long.NEG_ONE = Long.fromInt(-1);
            Long.MAX_VALUE = Long.fromBits(4294967295 | 0, 2147483647 | 0);
            Long.MIN_VALUE = Long.fromBits(0, 2147483648 | 0);
            Long.TWO_PWR_24_ = Long.fromInt(1 << 24);
            module.exports = Long;
            module.exports.Long = Long;
        }, {} ],
        22: [ function(require, module, exports) {
            (function(global) {
                "use strict";
                if (typeof global.Map !== "undefined") {
                    module.exports = global.Map;
                    module.exports.Map = global.Map;
                } else {
                    var Map = function(array) {
                        this._keys = [];
                        this._values = {};
                        for (var i = 0; i < array.length; i++) {
                            if (array[i] == null) continue;
                            var entry = array[i];
                            var key = entry[0];
                            var value = entry[1];
                            this._keys.push(key);
                            this._values[key] = {
                                v: value,
                                i: this._keys.length - 1
                            };
                        }
                    };
                    Map.prototype.clear = function() {
                        this._keys = [];
                        this._values = {};
                    };
                    Map.prototype.delete = function(key) {
                        var value = this._values[key];
                        if (value == null) return false;
                        delete this._values[key];
                        this._keys.splice(value.i, 1);
                        return true;
                    };
                    Map.prototype.entries = function() {
                        var self = this;
                        var index = 0;
                        return {
                            next: function() {
                                var key = self._keys[index++];
                                return {
                                    value: key !== undefined ? [ key, self._values[key].v ] : undefined,
                                    done: key !== undefined ? false : true
                                };
                            }
                        };
                    };
                    Map.prototype.forEach = function(callback, self) {
                        self = self || this;
                        for (var i = 0; i < this._keys.length; i++) {
                            var key = this._keys[i];
                            callback.call(self, this._values[key].v, key, self);
                        }
                    };
                    Map.prototype.get = function(key) {
                        return this._values[key] ? this._values[key].v : undefined;
                    };
                    Map.prototype.has = function(key) {
                        return this._values[key] != null;
                    };
                    Map.prototype.keys = function(key) {
                        var self = this;
                        var index = 0;
                        return {
                            next: function() {
                                var key = self._keys[index++];
                                return {
                                    value: key !== undefined ? key : undefined,
                                    done: key !== undefined ? false : true
                                };
                            }
                        };
                    };
                    Map.prototype.set = function(key, value) {
                        if (this._values[key]) {
                            this._values[key].v = value;
                            return this;
                        }
                        this._keys.push(key);
                        this._values[key] = {
                            v: value,
                            i: this._keys.length - 1
                        };
                        return this;
                    };
                    Map.prototype.values = function(key, value) {
                        var self = this;
                        var index = 0;
                        return {
                            next: function() {
                                var key = self._keys[index++];
                                return {
                                    value: key !== undefined ? self._values[key].v : undefined,
                                    done: key !== undefined ? false : true
                                };
                            }
                        };
                    };
                    Object.defineProperty(Map.prototype, "size", {
                        enumerable: true,
                        get: function() {
                            return this._keys.length;
                        }
                    });
                    module.exports = Map;
                    module.exports.Map = Map;
                }
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {} ],
        23: [ function(require, module, exports) {
            function MaxKey() {
                if (!(this instanceof MaxKey)) return new MaxKey();
                this._bsontype = "MaxKey";
            }
            module.exports = MaxKey;
            module.exports.MaxKey = MaxKey;
        }, {} ],
        24: [ function(require, module, exports) {
            function MinKey() {
                if (!(this instanceof MinKey)) return new MinKey();
                this._bsontype = "MinKey";
            }
            module.exports = MinKey;
            module.exports.MinKey = MinKey;
        }, {} ],
        25: [ function(require, module, exports) {
            (function(process, Buffer) {
                var MACHINE_ID = parseInt(Math.random() * 16777215, 10);
                var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
                var hasBufferType = false;
                try {
                    if (Buffer && Buffer.from) hasBufferType = true;
                } catch (err) {}
                var ObjectID = function ObjectID(id) {
                    if (id instanceof ObjectID) return id;
                    if (!(this instanceof ObjectID)) return new ObjectID(id);
                    this._bsontype = "ObjectID";
                    if (id == null || typeof id == "number") {
                        this.id = this.generate(id);
                        if (ObjectID.cacheHexString) this.__id = this.toString("hex");
                        return;
                    }
                    var valid = ObjectID.isValid(id);
                    if (!valid && id != null) {
                        throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
                    } else if (valid && typeof id == "string" && id.length == 24 && hasBufferType) {
                        return new ObjectID(new Buffer(id, "hex"));
                    } else if (valid && typeof id == "string" && id.length == 24) {
                        return ObjectID.createFromHexString(id);
                    } else if (id != null && id.length === 12) {
                        this.id = id;
                    } else if (id != null && id.toHexString) {
                        return id;
                    } else {
                        throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
                    }
                    if (ObjectID.cacheHexString) this.__id = this.toString("hex");
                };
                var ObjectId = ObjectID;
                var hexTable = [];
                for (var i = 0; i < 256; i++) {
                    hexTable[i] = (i <= 15 ? "0" : "") + i.toString(16);
                }
                ObjectID.prototype.toHexString = function() {
                    if (ObjectID.cacheHexString && this.__id) return this.__id;
                    var hexString = "";
                    if (!this.id || !this.id.length) {
                        throw new Error("invalid ObjectId, ObjectId.id must be either a string or a Buffer, but is [" + JSON.stringify(this.id) + "]");
                    }
                    if (this.id instanceof _Buffer) {
                        hexString = convertToHex(this.id);
                        if (ObjectID.cacheHexString) this.__id = hexString;
                        return hexString;
                    }
                    for (var i = 0; i < this.id.length; i++) {
                        hexString += hexTable[this.id.charCodeAt(i)];
                    }
                    if (ObjectID.cacheHexString) this.__id = hexString;
                    return hexString;
                };
                ObjectID.prototype.get_inc = function() {
                    return ObjectID.index = (ObjectID.index + 1) % 16777215;
                };
                ObjectID.prototype.getInc = function() {
                    return this.get_inc();
                };
                ObjectID.prototype.generate = function(time) {
                    if ("number" != typeof time) {
                        time = ~~(Date.now() / 1e3);
                    }
                    var pid = (typeof process === "undefined" ? Math.floor(Math.random() * 1e5) : process.pid) % 65535;
                    var inc = this.get_inc();
                    var buffer = new Buffer(12);
                    buffer[3] = time & 255;
                    buffer[2] = time >> 8 & 255;
                    buffer[1] = time >> 16 & 255;
                    buffer[0] = time >> 24 & 255;
                    buffer[6] = MACHINE_ID & 255;
                    buffer[5] = MACHINE_ID >> 8 & 255;
                    buffer[4] = MACHINE_ID >> 16 & 255;
                    buffer[8] = pid & 255;
                    buffer[7] = pid >> 8 & 255;
                    buffer[11] = inc & 255;
                    buffer[10] = inc >> 8 & 255;
                    buffer[9] = inc >> 16 & 255;
                    return buffer;
                };
                ObjectID.prototype.toString = function(format) {
                    if (this.id && this.id.copy) {
                        return this.id.toString(typeof format === "string" ? format : "hex");
                    }
                    return this.toHexString();
                };
                ObjectID.prototype.inspect = ObjectID.prototype.toString;
                ObjectID.prototype.toJSON = function() {
                    return this.toHexString();
                };
                ObjectID.prototype.equals = function equals(otherId) {
                    var id;
                    if (otherId instanceof ObjectID) {
                        return this.toString() == otherId.toString();
                    } else if (typeof otherId == "string" && ObjectID.isValid(otherId) && otherId.length == 12 && this.id instanceof _Buffer) {
                        return otherId === this.id.toString("binary");
                    } else if (typeof otherId == "string" && ObjectID.isValid(otherId) && otherId.length == 24) {
                        return otherId.toLowerCase() === this.toHexString();
                    } else if (typeof otherId == "string" && ObjectID.isValid(otherId) && otherId.length == 12) {
                        return otherId === this.id;
                    } else if (otherId != null && (otherId instanceof ObjectID || otherId.toHexString)) {
                        return otherId.toHexString() === this.toHexString();
                    } else {
                        return false;
                    }
                };
                ObjectID.prototype.getTimestamp = function() {
                    var timestamp = new Date();
                    var time = this.id[3] | this.id[2] << 8 | this.id[1] << 16 | this.id[0] << 24;
                    timestamp.setTime(Math.floor(time) * 1e3);
                    return timestamp;
                };
                ObjectID.index = ~~(Math.random() * 16777215);
                ObjectID.createPk = function createPk() {
                    return new ObjectID();
                };
                ObjectID.createFromTime = function createFromTime(time) {
                    var buffer = new Buffer([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
                    buffer[3] = time & 255;
                    buffer[2] = time >> 8 & 255;
                    buffer[1] = time >> 16 & 255;
                    buffer[0] = time >> 24 & 255;
                    return new ObjectID(buffer);
                };
                var encodeLookup = "0123456789abcdef".split("");
                var decodeLookup = [];
                var i = 0;
                while (i < 10) decodeLookup[48 + i] = i++;
                while (i < 16) decodeLookup[65 - 10 + i] = decodeLookup[97 - 10 + i] = i++;
                var _Buffer = Buffer;
                var convertToHex = function(bytes) {
                    return bytes.toString("hex");
                };
                ObjectID.createFromHexString = function createFromHexString(string) {
                    if (typeof string === "undefined" || string != null && string.length != 24) {
                        throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
                    }
                    if (hasBufferType) return new ObjectID(new Buffer(string, "hex"));
                    var array = new _Buffer(12);
                    var n = 0;
                    var i = 0;
                    while (i < 24) {
                        array[n++] = decodeLookup[string.charCodeAt(i++)] << 4 | decodeLookup[string.charCodeAt(i++)];
                    }
                    return new ObjectID(array);
                };
                ObjectID.isValid = function isValid(id) {
                    if (id == null) return false;
                    if (typeof id == "number") {
                        return true;
                    }
                    if (typeof id == "string") {
                        return id.length == 12 || id.length == 24 && checkForHexRegExp.test(id);
                    }
                    if (id instanceof ObjectID) {
                        return true;
                    }
                    if (id instanceof _Buffer) {
                        return true;
                    }
                    if (id.toHexString) {
                        return id.id.length == 12 || id.id.length == 24 && checkForHexRegExp.test(id.id);
                    }
                    return false;
                };
                Object.defineProperty(ObjectID.prototype, "generationTime", {
                    enumerable: true,
                    get: function() {
                        return this.id[3] | this.id[2] << 8 | this.id[1] << 16 | this.id[0] << 24;
                    },
                    set: function(value) {
                        this.id[3] = value & 255;
                        this.id[2] = value >> 8 & 255;
                        this.id[1] = value >> 16 & 255;
                        this.id[0] = value >> 24 & 255;
                    }
                });
                module.exports = ObjectID;
                module.exports.ObjectID = ObjectID;
                module.exports.ObjectId = ObjectID;
            }).call(this, require("_process"), require("buffer").Buffer);
        }, {
            _process: 4,
            buffer: 1
        } ],
        26: [ function(require, module, exports) {
            (function(Buffer) {
                "use strict";
                var writeIEEE754 = require("../float_parser").writeIEEE754, readIEEE754 = require("../float_parser").readIEEE754, Long = require("../long").Long, Double = require("../double").Double, Timestamp = require("../timestamp").Timestamp, ObjectID = require("../objectid").ObjectID, Symbol = require("../symbol").Symbol, BSONRegExp = require("../regexp").BSONRegExp, Code = require("../code").Code, Decimal128 = require("../decimal128"), MinKey = require("../min_key").MinKey, MaxKey = require("../max_key").MaxKey, DBRef = require("../db_ref").DBRef, Binary = require("../binary").Binary;
                var isDate = function isDate(d) {
                    return typeof d === "object" && Object.prototype.toString.call(d) === "[object Date]";
                };
                var calculateObjectSize = function calculateObjectSize(object, serializeFunctions, ignoreUndefined) {
                    var totalLength = 4 + 1;
                    if (Array.isArray(object)) {
                        for (var i = 0; i < object.length; i++) {
                            totalLength += calculateElement(i.toString(), object[i], serializeFunctions, true, ignoreUndefined);
                        }
                    } else {
                        if (object.toBSON) {
                            object = object.toBSON();
                        }
                        for (var key in object) {
                            totalLength += calculateElement(key, object[key], serializeFunctions, false, ignoreUndefined);
                        }
                    }
                    return totalLength;
                };
                function calculateElement(name, value, serializeFunctions, isArray, ignoreUndefined) {
                    if (value && value.toBSON) {
                        value = value.toBSON();
                    }
                    switch (typeof value) {
                      case "string":
                        return 1 + Buffer.byteLength(name, "utf8") + 1 + 4 + Buffer.byteLength(value, "utf8") + 1;

                      case "number":
                        if (Math.floor(value) === value && value >= BSON.JS_INT_MIN && value <= BSON.JS_INT_MAX) {
                            if (value >= BSON.BSON_INT32_MIN && value <= BSON.BSON_INT32_MAX) {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (4 + 1);
                            } else {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
                            }
                        } else {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
                        }

                      case "undefined":
                        if (isArray || !ignoreUndefined) return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1;
                        return 0;

                      case "boolean":
                        return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (1 + 1);

                      case "object":
                        if (value == null || value instanceof MinKey || value instanceof MaxKey || value["_bsontype"] == "MinKey" || value["_bsontype"] == "MaxKey") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1;
                        } else if (value instanceof ObjectID || value["_bsontype"] == "ObjectID") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (12 + 1);
                        } else if (value instanceof Date || isDate(value)) {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
                        } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (1 + 4 + 1) + value.length;
                        } else if (value instanceof Long || value instanceof Double || value instanceof Timestamp || value["_bsontype"] == "Long" || value["_bsontype"] == "Double" || value["_bsontype"] == "Timestamp") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
                        } else if (value instanceof Decimal128 || value["_bsontype"] == "Decimal128") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (16 + 1);
                        } else if (value instanceof Code || value["_bsontype"] == "Code") {
                            if (value.scope != null && Object.keys(value.scope).length > 0) {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + 4 + Buffer.byteLength(value.code.toString(), "utf8") + 1 + calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined);
                            } else {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + Buffer.byteLength(value.code.toString(), "utf8") + 1;
                            }
                        } else if (value instanceof Binary || value["_bsontype"] == "Binary") {
                            if (value.sub_type == Binary.SUBTYPE_BYTE_ARRAY) {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (value.position + 1 + 4 + 1 + 4);
                            } else {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + (value.position + 1 + 4 + 1);
                            }
                        } else if (value instanceof Symbol || value["_bsontype"] == "Symbol") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + Buffer.byteLength(value.value, "utf8") + 4 + 1 + 1;
                        } else if (value instanceof DBRef || value["_bsontype"] == "DBRef") {
                            var ordered_values = {
                                $ref: value.namespace,
                                $id: value.oid
                            };
                            if (null != value.db) {
                                ordered_values["$db"] = value.db;
                            }
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + calculateObjectSize(ordered_values, serializeFunctions, ignoreUndefined);
                        } else if (value instanceof RegExp || Object.prototype.toString.call(value) === "[object RegExp]") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + Buffer.byteLength(value.source, "utf8") + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
                        } else if (value instanceof BSONRegExp || value["_bsontype"] == "BSONRegExp") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + Buffer.byteLength(value.pattern, "utf8") + 1 + Buffer.byteLength(value.options, "utf8") + 1;
                        } else {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + calculateObjectSize(value, serializeFunctions, ignoreUndefined) + 1;
                        }

                      case "function":
                        if (value instanceof RegExp || Object.prototype.toString.call(value) === "[object RegExp]" || String.call(value) == "[object RegExp]") {
                            return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + Buffer.byteLength(value.source, "utf8") + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
                        } else {
                            if (serializeFunctions && value.scope != null && Object.keys(value.scope).length > 0) {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + 4 + Buffer.byteLength(value.toString(), "utf8") + 1 + calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined);
                            } else if (serializeFunctions) {
                                return (name != null ? Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + Buffer.byteLength(value.toString(), "utf8") + 1;
                            }
                        }
                    }
                    return 0;
                }
                var BSON = {};
                BSON.BSON_INT32_MAX = 2147483647;
                BSON.BSON_INT32_MIN = -2147483648;
                BSON.JS_INT_MAX = 9007199254740992;
                BSON.JS_INT_MIN = -9007199254740992;
                module.exports = calculateObjectSize;
            }).call(this, require("buffer").Buffer);
        }, {
            "../binary": 13,
            "../code": 15,
            "../db_ref": 16,
            "../decimal128": 17,
            "../double": 18,
            "../float_parser": 19,
            "../long": 21,
            "../max_key": 23,
            "../min_key": 24,
            "../objectid": 25,
            "../regexp": 29,
            "../symbol": 30,
            "../timestamp": 31,
            buffer: 1
        } ],
        27: [ function(require, module, exports) {
            (function(Buffer) {
                "use strict";
                var readIEEE754 = require("../float_parser").readIEEE754, f = require("util").format, Long = require("../long").Long, Double = require("../double").Double, Timestamp = require("../timestamp").Timestamp, ObjectID = require("../objectid").ObjectID, Symbol = require("../symbol").Symbol, Code = require("../code").Code, MinKey = require("../min_key").MinKey, MaxKey = require("../max_key").MaxKey, Decimal128 = require("../decimal128"), Int32 = require("../int_32"), DBRef = require("../db_ref").DBRef, BSONRegExp = require("../regexp").BSONRegExp, Binary = require("../binary").Binary;
                var deserialize = function(buffer, options, isArray) {
                    options = options == null ? {} : options;
                    var index = options && options.index ? options.index : 0;
                    var size = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
                    if (size < 5 || buffer.length < size || size + index > buffer.length) {
                        throw new Error("corrupt bson message");
                    }
                    if (buffer[index + size - 1] != 0) {
                        throw new Error("One object, sized correctly, with a spot for an EOO, but the EOO isn't 0x00");
                    }
                    return deserializeObject(buffer, index, options, isArray);
                };
                var deserializeObject = function(buffer, index, options, isArray) {
                    var evalFunctions = options["evalFunctions"] == null ? false : options["evalFunctions"];
                    var cacheFunctions = options["cacheFunctions"] == null ? false : options["cacheFunctions"];
                    var cacheFunctionsCrc32 = options["cacheFunctionsCrc32"] == null ? false : options["cacheFunctionsCrc32"];
                    var fieldsAsRaw = options["fieldsAsRaw"] == null ? null : options["fieldsAsRaw"];
                    var raw = options["raw"] == null ? false : options["raw"];
                    var bsonRegExp = typeof options["bsonRegExp"] == "boolean" ? options["bsonRegExp"] : false;
                    var promoteBuffers = options["promoteBuffers"] == null ? false : options["promoteBuffers"];
                    var promoteLongs = options["promoteLongs"] == null ? true : options["promoteLongs"];
                    var promoteValues = options["promoteValues"] == null ? true : options["promoteValues"];
                    var startIndex = index;
                    if (buffer.length < 5) throw new Error("corrupt bson message < 5 bytes long");
                    var size = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                    if (size < 5 || size > buffer.length) throw new Error("corrupt bson message");
                    var object = isArray ? [] : {};
                    var arrayIndex = 0;
                    while (true) {
                        var elementType = buffer[index++];
                        if (elementType == 0) {
                            break;
                        }
                        var i = index;
                        while (buffer[i] !== 0 && i < buffer.length) {
                            i++;
                        }
                        if (i >= buffer.length) throw new Error("Bad BSON Document: illegal CString");
                        var name = isArray ? arrayIndex++ : buffer.toString("utf8", index, i);
                        index = i + 1;
                        if (elementType == BSON.BSON_DATA_STRING) {
                            var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] != 0) throw new Error("bad string length in bson");
                            object[name] = buffer.toString("utf8", index, index + stringSize - 1);
                            index = index + stringSize;
                        } else if (elementType == BSON.BSON_DATA_OID) {
                            var oid = new Buffer(12);
                            buffer.copy(oid, 0, index, index + 12);
                            object[name] = new ObjectID(oid);
                            index = index + 12;
                        } else if (elementType == BSON.BSON_DATA_INT && promoteValues == false) {
                            object[name] = new Int32(buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24);
                        } else if (elementType == BSON.BSON_DATA_INT) {
                            object[name] = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                        } else if (elementType == BSON.BSON_DATA_NUMBER && promoteValues == false) {
                            object[name] = new Double(buffer.readDoubleLE(index));
                            index = index + 8;
                        } else if (elementType == BSON.BSON_DATA_NUMBER) {
                            object[name] = buffer.readDoubleLE(index);
                            index = index + 8;
                        } else if (elementType == BSON.BSON_DATA_DATE) {
                            var lowBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            var highBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            object[name] = new Date(new Long(lowBits, highBits).toNumber());
                        } else if (elementType == BSON.BSON_DATA_BOOLEAN) {
                            if (buffer[index] != 0 && buffer[index] != 1) throw new Error("illegal boolean type value");
                            object[name] = buffer[index++] == 1;
                        } else if (elementType == BSON.BSON_DATA_OBJECT) {
                            var _index = index;
                            var objectSize = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
                            if (objectSize <= 0 || objectSize > buffer.length - index) throw new Error("bad embedded document length in bson");
                            if (raw) {
                                object[name] = buffer.slice(index, index + objectSize);
                            } else {
                                object[name] = deserializeObject(buffer, _index, options, false);
                            }
                            index = index + objectSize;
                        } else if (elementType == BSON.BSON_DATA_ARRAY) {
                            var _index = index;
                            var objectSize = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
                            var arrayOptions = options;
                            var stopIndex = index + objectSize;
                            if (fieldsAsRaw && fieldsAsRaw[name]) {
                                arrayOptions = {};
                                for (var n in options) arrayOptions[n] = options[n];
                                arrayOptions["raw"] = true;
                            }
                            object[name] = deserializeObject(buffer, _index, arrayOptions, true);
                            index = index + objectSize;
                            if (buffer[index - 1] != 0) throw new Error("invalid array terminator byte");
                            if (index != stopIndex) throw new Error("corrupted array bson");
                        } else if (elementType == BSON.BSON_DATA_UNDEFINED) {
                            object[name] = undefined;
                        } else if (elementType == BSON.BSON_DATA_NULL) {
                            object[name] = null;
                        } else if (elementType == BSON.BSON_DATA_LONG) {
                            var lowBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            var highBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            var long = new Long(lowBits, highBits);
                            if (promoteLongs && promoteValues == true) {
                                object[name] = long.lessThanOrEqual(JS_INT_MAX_LONG) && long.greaterThanOrEqual(JS_INT_MIN_LONG) ? long.toNumber() : long;
                            } else {
                                object[name] = long;
                            }
                        } else if (elementType == BSON.BSON_DATA_DECIMAL128) {
                            var bytes = new Buffer(16);
                            buffer.copy(bytes, 0, index, index + 16);
                            index = index + 16;
                            var decimal128 = new Decimal128(bytes);
                            object[name] = decimal128.toObject ? decimal128.toObject() : decimal128;
                        } else if (elementType == BSON.BSON_DATA_BINARY) {
                            var binarySize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            var totalBinarySize = binarySize;
                            var subType = buffer[index++];
                            if (binarySize < 0) throw new Error("Negative binary type element size found");
                            if (binarySize > buffer.length) throw new Error("Binary type size larger than document size");
                            if (buffer["slice"] != null) {
                                if (subType == Binary.SUBTYPE_BYTE_ARRAY) {
                                    binarySize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                                    if (binarySize < 0) throw new Error("Negative binary type element size found for subtype 0x02");
                                    if (binarySize > totalBinarySize - 4) throw new Error("Binary type with subtype 0x02 contains to long binary size");
                                    if (binarySize < totalBinarySize - 4) throw new Error("Binary type with subtype 0x02 contains to short binary size");
                                }
                                if (promoteBuffers && promoteValues) {
                                    object[name] = buffer.slice(index, index + binarySize);
                                } else {
                                    object[name] = new Binary(buffer.slice(index, index + binarySize), subType);
                                }
                            } else {
                                var _buffer = typeof Uint8Array != "undefined" ? new Uint8Array(new ArrayBuffer(binarySize)) : new Array(binarySize);
                                if (subType == Binary.SUBTYPE_BYTE_ARRAY) {
                                    binarySize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                                    if (binarySize < 0) throw new Error("Negative binary type element size found for subtype 0x02");
                                    if (binarySize > totalBinarySize - 4) throw new Error("Binary type with subtype 0x02 contains to long binary size");
                                    if (binarySize < totalBinarySize - 4) throw new Error("Binary type with subtype 0x02 contains to short binary size");
                                }
                                for (var i = 0; i < binarySize; i++) {
                                    _buffer[i] = buffer[index + i];
                                }
                                if (promoteBuffers && promoteValues) {
                                    object[name] = _buffer;
                                } else {
                                    object[name] = new Binary(_buffer, subType);
                                }
                            }
                            index = index + binarySize;
                        } else if (elementType == BSON.BSON_DATA_REGEXP && bsonRegExp == false) {
                            var i = index;
                            while (buffer[i] !== 0 && i < buffer.length) {
                                i++;
                            }
                            if (i >= buffer.length) throw new Error("Bad BSON Document: illegal CString");
                            var source = buffer.toString("utf8", index, i);
                            index = i + 1;
                            var i = index;
                            while (buffer[i] !== 0 && i < buffer.length) {
                                i++;
                            }
                            if (i >= buffer.length) throw new Error("Bad BSON Document: illegal CString");
                            var regExpOptions = buffer.toString("utf8", index, i);
                            index = i + 1;
                            var optionsArray = new Array(regExpOptions.length);
                            for (var i = 0; i < regExpOptions.length; i++) {
                                switch (regExpOptions[i]) {
                                  case "m":
                                    optionsArray[i] = "m";
                                    break;

                                  case "s":
                                    optionsArray[i] = "g";
                                    break;

                                  case "i":
                                    optionsArray[i] = "i";
                                    break;
                                }
                            }
                            object[name] = new RegExp(source, optionsArray.join(""));
                        } else if (elementType == BSON.BSON_DATA_REGEXP && bsonRegExp == true) {
                            var i = index;
                            while (buffer[i] !== 0 && i < buffer.length) {
                                i++;
                            }
                            if (i >= buffer.length) throw new Error("Bad BSON Document: illegal CString");
                            var source = buffer.toString("utf8", index, i);
                            index = i + 1;
                            var i = index;
                            while (buffer[i] !== 0 && i < buffer.length) {
                                i++;
                            }
                            if (i >= buffer.length) throw new Error("Bad BSON Document: illegal CString");
                            var regExpOptions = buffer.toString("utf8", index, i);
                            index = i + 1;
                            object[name] = new BSONRegExp(source, regExpOptions);
                        } else if (elementType == BSON.BSON_DATA_SYMBOL) {
                            var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] != 0) throw new Error("bad string length in bson");
                            object[name] = new Symbol(buffer.toString("utf8", index, index + stringSize - 1));
                            index = index + stringSize;
                        } else if (elementType == BSON.BSON_DATA_TIMESTAMP) {
                            var lowBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            var highBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            object[name] = new Timestamp(lowBits, highBits);
                        } else if (elementType == BSON.BSON_DATA_MIN_KEY) {
                            object[name] = new MinKey();
                        } else if (elementType == BSON.BSON_DATA_MAX_KEY) {
                            object[name] = new MaxKey();
                        } else if (elementType == BSON.BSON_DATA_CODE) {
                            var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] != 0) throw new Error("bad string length in bson");
                            var functionString = buffer.toString("utf8", index, index + stringSize - 1);
                            if (evalFunctions) {
                                var value = null;
                                if (cacheFunctions) {
                                    var hash = cacheFunctionsCrc32 ? crc32(functionString) : functionString;
                                    object[name] = isolateEvalWithHash(functionCache, hash, functionString, object);
                                } else {
                                    object[name] = isolateEval(functionString);
                                }
                            } else {
                                object[name] = new Code(functionString);
                            }
                            index = index + stringSize;
                        } else if (elementType == BSON.BSON_DATA_CODE_W_SCOPE) {
                            var totalSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            if (totalSize < 4 + 4 + 4 + 1) {
                                throw new Error("code_w_scope total size shorter minimum expected length");
                            }
                            var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] != 0) throw new Error("bad string length in bson");
                            var functionString = buffer.toString("utf8", index, index + stringSize - 1);
                            index = index + stringSize;
                            var _index = index;
                            var objectSize = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
                            var scopeObject = deserializeObject(buffer, _index, options, false);
                            index = index + objectSize;
                            if (totalSize < 4 + 4 + objectSize + stringSize) {
                                throw new Error("code_w_scope total size is to short, truncating scope");
                            }
                            if (totalSize > 4 + 4 + objectSize + stringSize) {
                                throw new Error("code_w_scope total size is to long, clips outer document");
                            }
                            if (evalFunctions) {
                                var value = null;
                                if (cacheFunctions) {
                                    var hash = cacheFunctionsCrc32 ? crc32(functionString) : functionString;
                                    object[name] = isolateEvalWithHash(functionCache, hash, functionString, object);
                                } else {
                                    object[name] = isolateEval(functionString);
                                }
                                object[name].scope = scopeObject;
                            } else {
                                object[name] = new Code(functionString, scopeObject);
                            }
                        } else if (elementType == BSON.BSON_DATA_DBPOINTER) {
                            var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
                            if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] != 0) throw new Error("bad string length in bson");
                            var namespace = buffer.toString("utf8", index, index + stringSize - 1);
                            index = index + stringSize;
                            var oidBuffer = new Buffer(12);
                            buffer.copy(oidBuffer, 0, index, index + 12);
                            var oid = new ObjectID(oidBuffer);
                            index = index + 12;
                            var parts = namespace.split(".");
                            var db = parts.shift();
                            var collection = parts.join(".");
                            object[name] = new DBRef(collection, oid, db);
                        } else {
                            throw new Error("Detected unknown BSON type " + elementType.toString(16) + ' for fieldname "' + name + '", are you using the latest BSON parser');
                        }
                    }
                    if (size != index - startIndex) {
                        if (isArray) throw new Error("corrupt array bson");
                        throw new Error("corrupt object bson");
                    }
                    if (object["$id"] != null) object = new DBRef(object["$ref"], object["$id"], object["$db"]);
                    return object;
                };
                var isolateEvalWithHash = function(functionCache, hash, functionString, object) {
                    var value = null;
                    if (functionCache[hash] == null) {
                        eval("value = " + functionString);
                        functionCache[hash] = value;
                    }
                    return functionCache[hash].bind(object);
                };
                var isolateEval = function(functionString) {
                    var value = null;
                    eval("value = " + functionString);
                    return value;
                };
                var BSON = {};
                var functionCache = BSON.functionCache = {};
                BSON.BSON_DATA_NUMBER = 1;
                BSON.BSON_DATA_STRING = 2;
                BSON.BSON_DATA_OBJECT = 3;
                BSON.BSON_DATA_ARRAY = 4;
                BSON.BSON_DATA_BINARY = 5;
                BSON.BSON_DATA_UNDEFINED = 6;
                BSON.BSON_DATA_OID = 7;
                BSON.BSON_DATA_BOOLEAN = 8;
                BSON.BSON_DATA_DATE = 9;
                BSON.BSON_DATA_NULL = 10;
                BSON.BSON_DATA_REGEXP = 11;
                BSON.BSON_DATA_DBPOINTER = 12;
                BSON.BSON_DATA_CODE = 13;
                BSON.BSON_DATA_SYMBOL = 14;
                BSON.BSON_DATA_CODE_W_SCOPE = 15;
                BSON.BSON_DATA_INT = 16;
                BSON.BSON_DATA_TIMESTAMP = 17;
                BSON.BSON_DATA_LONG = 18;
                BSON.BSON_DATA_DECIMAL128 = 19;
                BSON.BSON_DATA_MIN_KEY = 255;
                BSON.BSON_DATA_MAX_KEY = 127;
                BSON.BSON_BINARY_SUBTYPE_DEFAULT = 0;
                BSON.BSON_BINARY_SUBTYPE_FUNCTION = 1;
                BSON.BSON_BINARY_SUBTYPE_BYTE_ARRAY = 2;
                BSON.BSON_BINARY_SUBTYPE_UUID = 3;
                BSON.BSON_BINARY_SUBTYPE_MD5 = 4;
                BSON.BSON_BINARY_SUBTYPE_USER_DEFINED = 128;
                BSON.BSON_INT32_MAX = 2147483647;
                BSON.BSON_INT32_MIN = -2147483648;
                BSON.BSON_INT64_MAX = Math.pow(2, 63) - 1;
                BSON.BSON_INT64_MIN = -Math.pow(2, 63);
                BSON.JS_INT_MAX = 9007199254740992;
                BSON.JS_INT_MIN = -9007199254740992;
                var JS_INT_MAX_LONG = Long.fromNumber(9007199254740992);
                var JS_INT_MIN_LONG = Long.fromNumber(-9007199254740992);
                module.exports = deserialize;
            }).call(this, require("buffer").Buffer);
        }, {
            "../binary": 13,
            "../code": 15,
            "../db_ref": 16,
            "../decimal128": 17,
            "../double": 18,
            "../float_parser": 19,
            "../int_32": 20,
            "../long": 21,
            "../max_key": 23,
            "../min_key": 24,
            "../objectid": 25,
            "../regexp": 29,
            "../symbol": 30,
            "../timestamp": 31,
            buffer: 1,
            util: 7
        } ],
        28: [ function(require, module, exports) {
            (function(Buffer) {
                "use strict";
                var writeIEEE754 = require("../float_parser").writeIEEE754, readIEEE754 = require("../float_parser").readIEEE754, Long = require("../long").Long, Map = require("../map"), Double = require("../double").Double, Timestamp = require("../timestamp").Timestamp, ObjectID = require("../objectid").ObjectID, Symbol = require("../symbol").Symbol, Code = require("../code").Code, BSONRegExp = require("../regexp").BSONRegExp, Int32 = require("../int_32").Int32, MinKey = require("../min_key").MinKey, MaxKey = require("../max_key").MaxKey, Decimal128 = require("../decimal128"), DBRef = require("../db_ref").DBRef, Binary = require("../binary").Binary;
                try {
                    var _Buffer = Uint8Array;
                } catch (e) {
                    var _Buffer = Buffer;
                }
                var regexp = /\x00/;
                var isDate = function isDate(d) {
                    return typeof d === "object" && Object.prototype.toString.call(d) === "[object Date]";
                };
                var isRegExp = function isRegExp(d) {
                    return Object.prototype.toString.call(d) === "[object RegExp]";
                };
                var serializeString = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_STRING;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes + 1;
                    buffer[index - 1] = 0;
                    var size = buffer.write(value, index + 4, "utf8");
                    buffer[index + 3] = size + 1 >> 24 & 255;
                    buffer[index + 2] = size + 1 >> 16 & 255;
                    buffer[index + 1] = size + 1 >> 8 & 255;
                    buffer[index] = size + 1 & 255;
                    index = index + 4 + size;
                    buffer[index++] = 0;
                    return index;
                };
                var serializeNumber = function(buffer, key, value, index, isArray) {
                    if (Math.floor(value) === value && value >= BSON.JS_INT_MIN && value <= BSON.JS_INT_MAX) {
                        if (value >= BSON.BSON_INT32_MIN && value <= BSON.BSON_INT32_MAX) {
                            buffer[index++] = BSON.BSON_DATA_INT;
                            var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                            index = index + numberOfWrittenBytes;
                            buffer[index++] = 0;
                            buffer[index++] = value & 255;
                            buffer[index++] = value >> 8 & 255;
                            buffer[index++] = value >> 16 & 255;
                            buffer[index++] = value >> 24 & 255;
                        } else if (value >= BSON.JS_INT_MIN && value <= BSON.JS_INT_MAX) {
                            buffer[index++] = BSON.BSON_DATA_NUMBER;
                            var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                            index = index + numberOfWrittenBytes;
                            buffer[index++] = 0;
                            writeIEEE754(buffer, value, index, "little", 52, 8);
                            index = index + 8;
                        } else {
                            buffer[index++] = BSON.BSON_DATA_LONG;
                            var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                            index = index + numberOfWrittenBytes;
                            buffer[index++] = 0;
                            var longVal = Long.fromNumber(value);
                            var lowBits = longVal.getLowBits();
                            var highBits = longVal.getHighBits();
                            buffer[index++] = lowBits & 255;
                            buffer[index++] = lowBits >> 8 & 255;
                            buffer[index++] = lowBits >> 16 & 255;
                            buffer[index++] = lowBits >> 24 & 255;
                            buffer[index++] = highBits & 255;
                            buffer[index++] = highBits >> 8 & 255;
                            buffer[index++] = highBits >> 16 & 255;
                            buffer[index++] = highBits >> 24 & 255;
                        }
                    } else {
                        buffer[index++] = BSON.BSON_DATA_NUMBER;
                        var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                        index = index + numberOfWrittenBytes;
                        buffer[index++] = 0;
                        writeIEEE754(buffer, value, index, "little", 52, 8);
                        index = index + 8;
                    }
                    return index;
                };
                var serializeNull = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_NULL;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    return index;
                };
                var serializeBoolean = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_BOOLEAN;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    buffer[index++] = value ? 1 : 0;
                    return index;
                };
                var serializeDate = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_DATE;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var dateInMilis = Long.fromNumber(value.getTime());
                    var lowBits = dateInMilis.getLowBits();
                    var highBits = dateInMilis.getHighBits();
                    buffer[index++] = lowBits & 255;
                    buffer[index++] = lowBits >> 8 & 255;
                    buffer[index++] = lowBits >> 16 & 255;
                    buffer[index++] = lowBits >> 24 & 255;
                    buffer[index++] = highBits & 255;
                    buffer[index++] = highBits >> 8 & 255;
                    buffer[index++] = highBits >> 16 & 255;
                    buffer[index++] = highBits >> 24 & 255;
                    return index;
                };
                var serializeRegExp = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_REGEXP;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    if (value.source && value.source.match(regexp) != null) {
                        throw Error("value " + value.source + " must not contain null bytes");
                    }
                    index = index + buffer.write(value.source, index, "utf8");
                    buffer[index++] = 0;
                    if (value.global) buffer[index++] = 115;
                    if (value.ignoreCase) buffer[index++] = 105;
                    if (value.multiline) buffer[index++] = 109;
                    buffer[index++] = 0;
                    return index;
                };
                var serializeBSONRegExp = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_REGEXP;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    if (value.pattern.match(regexp) != null) {
                        throw Error("pattern " + value.pattern + " must not contain null bytes");
                    }
                    index = index + buffer.write(value.pattern, index, "utf8");
                    buffer[index++] = 0;
                    index = index + buffer.write(value.options.split("").sort().join(""), index, "utf8");
                    buffer[index++] = 0;
                    return index;
                };
                var serializeMinMax = function(buffer, key, value, index, isArray) {
                    if (value === null) {
                        buffer[index++] = BSON.BSON_DATA_NULL;
                    } else if (value instanceof MinKey) {
                        buffer[index++] = BSON.BSON_DATA_MIN_KEY;
                    } else {
                        buffer[index++] = BSON.BSON_DATA_MAX_KEY;
                    }
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    return index;
                };
                var serializeObjectId = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_OID;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    if (typeof value.id == "string") {
                        buffer.write(value.id, index, "binary");
                    } else if (value.id && value.id.copy) {
                        value.id.copy(buffer, index, 0, 12);
                    } else {
                        throw new Error("object [" + JSON.stringify(value) + "] is not a valid ObjectId");
                    }
                    return index + 12;
                };
                var serializeBuffer = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_BINARY;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var size = value.length;
                    buffer[index++] = size & 255;
                    buffer[index++] = size >> 8 & 255;
                    buffer[index++] = size >> 16 & 255;
                    buffer[index++] = size >> 24 & 255;
                    buffer[index++] = BSON.BSON_BINARY_SUBTYPE_DEFAULT;
                    value.copy(buffer, index, 0, size);
                    index = index + size;
                    return index;
                };
                var serializeObject = function(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, isArray, path) {
                    for (var i = 0; i < path.length; i++) {
                        if (path[i] === value) throw new Error("cyclic dependency detected");
                    }
                    path.push(value);
                    buffer[index++] = Array.isArray(value) ? BSON.BSON_DATA_ARRAY : BSON.BSON_DATA_OBJECT;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var endIndex = serializeInto(buffer, value, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined, path);
                    path.pop();
                    var size = endIndex - index;
                    return endIndex;
                };
                var serializeDecimal128 = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_DECIMAL128;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    value.bytes.copy(buffer, index, 0, 16);
                    return index + 16;
                };
                var serializeLong = function(buffer, key, value, index, isArray) {
                    buffer[index++] = value._bsontype == "Long" ? BSON.BSON_DATA_LONG : BSON.BSON_DATA_TIMESTAMP;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var lowBits = value.getLowBits();
                    var highBits = value.getHighBits();
                    buffer[index++] = lowBits & 255;
                    buffer[index++] = lowBits >> 8 & 255;
                    buffer[index++] = lowBits >> 16 & 255;
                    buffer[index++] = lowBits >> 24 & 255;
                    buffer[index++] = highBits & 255;
                    buffer[index++] = highBits >> 8 & 255;
                    buffer[index++] = highBits >> 16 & 255;
                    buffer[index++] = highBits >> 24 & 255;
                    return index;
                };
                var serializeInt32 = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_INT;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    buffer[index++] = value & 255;
                    buffer[index++] = value >> 8 & 255;
                    buffer[index++] = value >> 16 & 255;
                    buffer[index++] = value >> 24 & 255;
                    return index;
                };
                var serializeDouble = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_NUMBER;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    writeIEEE754(buffer, value, index, "little", 52, 8);
                    index = index + 8;
                    return index;
                };
                var serializeFunction = function(buffer, key, value, index, checkKeys, depth, isArray) {
                    buffer[index++] = BSON.BSON_DATA_CODE;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var functionString = value.toString();
                    var size = buffer.write(functionString, index + 4, "utf8") + 1;
                    buffer[index] = size & 255;
                    buffer[index + 1] = size >> 8 & 255;
                    buffer[index + 2] = size >> 16 & 255;
                    buffer[index + 3] = size >> 24 & 255;
                    index = index + 4 + size - 1;
                    buffer[index++] = 0;
                    return index;
                };
                var serializeCode = function(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, isArray) {
                    if (value.scope && typeof value.scope == "object") {
                        buffer[index++] = BSON.BSON_DATA_CODE_W_SCOPE;
                        var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                        index = index + numberOfWrittenBytes;
                        buffer[index++] = 0;
                        var startIndex = index;
                        var functionString = typeof value.code == "string" ? value.code : value.code.toString();
                        index = index + 4;
                        var codeSize = buffer.write(functionString, index + 4, "utf8") + 1;
                        buffer[index] = codeSize & 255;
                        buffer[index + 1] = codeSize >> 8 & 255;
                        buffer[index + 2] = codeSize >> 16 & 255;
                        buffer[index + 3] = codeSize >> 24 & 255;
                        buffer[index + 4 + codeSize - 1] = 0;
                        index = index + codeSize + 4;
                        var endIndex = serializeInto(buffer, value.scope, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined);
                        index = endIndex - 1;
                        var totalSize = endIndex - startIndex;
                        buffer[startIndex++] = totalSize & 255;
                        buffer[startIndex++] = totalSize >> 8 & 255;
                        buffer[startIndex++] = totalSize >> 16 & 255;
                        buffer[startIndex++] = totalSize >> 24 & 255;
                        buffer[index++] = 0;
                    } else {
                        buffer[index++] = BSON.BSON_DATA_CODE;
                        var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                        index = index + numberOfWrittenBytes;
                        buffer[index++] = 0;
                        var functionString = value.code.toString();
                        var size = buffer.write(functionString, index + 4, "utf8") + 1;
                        buffer[index] = size & 255;
                        buffer[index + 1] = size >> 8 & 255;
                        buffer[index + 2] = size >> 16 & 255;
                        buffer[index + 3] = size >> 24 & 255;
                        index = index + 4 + size - 1;
                        buffer[index++] = 0;
                    }
                    return index;
                };
                var serializeBinary = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_BINARY;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var data = value.value(true);
                    var size = value.position;
                    if (value.sub_type == Binary.SUBTYPE_BYTE_ARRAY) size = size + 4;
                    buffer[index++] = size & 255;
                    buffer[index++] = size >> 8 & 255;
                    buffer[index++] = size >> 16 & 255;
                    buffer[index++] = size >> 24 & 255;
                    buffer[index++] = value.sub_type;
                    if (value.sub_type == Binary.SUBTYPE_BYTE_ARRAY) {
                        size = size - 4;
                        buffer[index++] = size & 255;
                        buffer[index++] = size >> 8 & 255;
                        buffer[index++] = size >> 16 & 255;
                        buffer[index++] = size >> 24 & 255;
                    }
                    data.copy(buffer, index, 0, value.position);
                    index = index + value.position;
                    return index;
                };
                var serializeSymbol = function(buffer, key, value, index, isArray) {
                    buffer[index++] = BSON.BSON_DATA_SYMBOL;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var size = buffer.write(value.value, index + 4, "utf8") + 1;
                    buffer[index] = size & 255;
                    buffer[index + 1] = size >> 8 & 255;
                    buffer[index + 2] = size >> 16 & 255;
                    buffer[index + 3] = size >> 24 & 255;
                    index = index + 4 + size - 1;
                    buffer[index++] = 0;
                    return index;
                };
                var serializeDBRef = function(buffer, key, value, index, depth, serializeFunctions, isArray) {
                    buffer[index++] = BSON.BSON_DATA_OBJECT;
                    var numberOfWrittenBytes = !isArray ? buffer.write(key, index, "utf8") : buffer.write(key, index, "ascii");
                    index = index + numberOfWrittenBytes;
                    buffer[index++] = 0;
                    var startIndex = index;
                    var endIndex;
                    if (null != value.db) {
                        endIndex = serializeInto(buffer, {
                            $ref: value.namespace,
                            $id: value.oid,
                            $db: value.db
                        }, false, index, depth + 1, serializeFunctions);
                    } else {
                        endIndex = serializeInto(buffer, {
                            $ref: value.namespace,
                            $id: value.oid
                        }, false, index, depth + 1, serializeFunctions);
                    }
                    var size = endIndex - startIndex;
                    buffer[startIndex++] = size & 255;
                    buffer[startIndex++] = size >> 8 & 255;
                    buffer[startIndex++] = size >> 16 & 255;
                    buffer[startIndex++] = size >> 24 & 255;
                    return endIndex;
                };
                var serializeInto = function serializeInto(buffer, object, checkKeys, startingIndex, depth, serializeFunctions, ignoreUndefined, path) {
                    startingIndex = startingIndex || 0;
                    path = path || [];
                    path.push(object);
                    var index = startingIndex + 4;
                    var self = this;
                    if (Array.isArray(object)) {
                        for (var i = 0; i < object.length; i++) {
                            var key = "" + i;
                            var value = object[i];
                            if (value && value.toBSON) {
                                if (typeof value.toBSON != "function") throw new Error("toBSON is not a function");
                                value = value.toBSON();
                            }
                            var type = typeof value;
                            if (type == "string") {
                                index = serializeString(buffer, key, value, index, true);
                            } else if (type == "number") {
                                index = serializeNumber(buffer, key, value, index, true);
                            } else if (type == "boolean") {
                                index = serializeBoolean(buffer, key, value, index, true);
                            } else if (value instanceof Date || isDate(value)) {
                                index = serializeDate(buffer, key, value, index, true);
                            } else if (value === undefined) {
                                index = serializeNull(buffer, key, value, index, true);
                            } else if (value === null) {
                                index = serializeNull(buffer, key, value, index, true);
                            } else if (value["_bsontype"] == "ObjectID") {
                                index = serializeObjectId(buffer, key, value, index, true);
                            } else if (Buffer.isBuffer(value)) {
                                index = serializeBuffer(buffer, key, value, index, true);
                            } else if (value instanceof RegExp || isRegExp(value)) {
                                index = serializeRegExp(buffer, key, value, index, true);
                            } else if (type == "object" && value["_bsontype"] == null) {
                                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true, path);
                            } else if (type == "object" && value["_bsontype"] == "Decimal128") {
                                index = serializeDecimal128(buffer, key, value, index, true);
                            } else if (value["_bsontype"] == "Long" || value["_bsontype"] == "Timestamp") {
                                index = serializeLong(buffer, key, value, index, true);
                            } else if (value["_bsontype"] == "Double") {
                                index = serializeDouble(buffer, key, value, index, true);
                            } else if (typeof value == "function" && serializeFunctions) {
                                index = serializeFunction(buffer, key, value, index, checkKeys, depth, serializeFunctions, true);
                            } else if (value["_bsontype"] == "Code") {
                                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true);
                            } else if (value["_bsontype"] == "Binary") {
                                index = serializeBinary(buffer, key, value, index, true);
                            } else if (value["_bsontype"] == "Symbol") {
                                index = serializeSymbol(buffer, key, value, index, true);
                            } else if (value["_bsontype"] == "DBRef") {
                                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions, true);
                            } else if (value["_bsontype"] == "BSONRegExp") {
                                index = serializeBSONRegExp(buffer, key, value, index, true);
                            } else if (value["_bsontype"] == "Int32") {
                                index = serializeInt32(buffer, key, value, index, true);
                            } else if (value["_bsontype"] == "MinKey" || value["_bsontype"] == "MaxKey") {
                                index = serializeMinMax(buffer, key, value, index, true);
                            }
                        }
                    } else if (object instanceof Map) {
                        var iterator = object.entries();
                        var done = false;
                        while (!done) {
                            var entry = iterator.next();
                            done = entry.done;
                            if (done) continue;
                            var key = entry.value[0];
                            var value = entry.value[1];
                            var type = typeof value;
                            if (key != "$db" && key != "$ref" && key != "$id") {
                                if (key.match(regexp) != null) {
                                    throw Error("key " + key + " must not contain null bytes");
                                }
                                if (checkKeys) {
                                    if ("$" == key[0]) {
                                        throw Error("key " + key + " must not start with '$'");
                                    } else if (!!~key.indexOf(".")) {
                                        throw Error("key " + key + " must not contain '.'");
                                    }
                                }
                            }
                            if (type == "string") {
                                index = serializeString(buffer, key, value, index);
                            } else if (type == "number") {
                                index = serializeNumber(buffer, key, value, index);
                            } else if (type == "boolean") {
                                index = serializeBoolean(buffer, key, value, index);
                            } else if (value instanceof Date || isDate(value)) {
                                index = serializeDate(buffer, key, value, index);
                            } else if (value === undefined && ignoreUndefined == true) {} else if (value === null || value === undefined) {
                                index = serializeNull(buffer, key, value, index);
                            } else if (value["_bsontype"] == "ObjectID") {
                                index = serializeObjectId(buffer, key, value, index);
                            } else if (Buffer.isBuffer(value)) {
                                index = serializeBuffer(buffer, key, value, index);
                            } else if (value instanceof RegExp || isRegExp(value)) {
                                index = serializeRegExp(buffer, key, value, index);
                            } else if (type == "object" && value["_bsontype"] == null) {
                                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
                            } else if (type == "object" && value["_bsontype"] == "Decimal128") {
                                index = serializeDecimal128(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Long" || value["_bsontype"] == "Timestamp") {
                                index = serializeLong(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Double") {
                                index = serializeDouble(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Code") {
                                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
                            } else if (typeof value == "function" && serializeFunctions) {
                                index = serializeFunction(buffer, key, value, index, checkKeys, depth, serializeFunctions);
                            } else if (value["_bsontype"] == "Binary") {
                                index = serializeBinary(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Symbol") {
                                index = serializeSymbol(buffer, key, value, index);
                            } else if (value["_bsontype"] == "DBRef") {
                                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions);
                            } else if (value["_bsontype"] == "BSONRegExp") {
                                index = serializeBSONRegExp(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Int32") {
                                index = serializeInt32(buffer, key, value, index);
                            } else if (value["_bsontype"] == "MinKey" || value["_bsontype"] == "MaxKey") {
                                index = serializeMinMax(buffer, key, value, index);
                            }
                        }
                    } else {
                        if (object.toBSON) {
                            if (typeof object.toBSON != "function") throw new Error("toBSON is not a function");
                            object = object.toBSON();
                            if (object != null && typeof object != "object") throw new Error("toBSON function did not return an object");
                        }
                        for (var key in object) {
                            var value = object[key];
                            if (value && value.toBSON) {
                                if (typeof value.toBSON != "function") throw new Error("toBSON is not a function");
                                value = value.toBSON();
                            }
                            var type = typeof value;
                            if (key != "$db" && key != "$ref" && key != "$id") {
                                if (key.match(regexp) != null) {
                                    throw Error("key " + key + " must not contain null bytes");
                                }
                                if (checkKeys) {
                                    if ("$" == key[0]) {
                                        throw Error("key " + key + " must not start with '$'");
                                    } else if (!!~key.indexOf(".")) {
                                        throw Error("key " + key + " must not contain '.'");
                                    }
                                }
                            }
                            if (type == "string") {
                                index = serializeString(buffer, key, value, index);
                            } else if (type == "number") {
                                index = serializeNumber(buffer, key, value, index);
                            } else if (type == "boolean") {
                                index = serializeBoolean(buffer, key, value, index);
                            } else if (value instanceof Date || isDate(value)) {
                                index = serializeDate(buffer, key, value, index);
                            } else if (value === undefined && ignoreUndefined == true) {} else if (value === null || value === undefined) {
                                index = serializeNull(buffer, key, value, index);
                            } else if (value["_bsontype"] == "ObjectID") {
                                index = serializeObjectId(buffer, key, value, index);
                            } else if (Buffer.isBuffer(value)) {
                                index = serializeBuffer(buffer, key, value, index);
                            } else if (value instanceof RegExp || isRegExp(value)) {
                                index = serializeRegExp(buffer, key, value, index);
                            } else if (type == "object" && value["_bsontype"] == null) {
                                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
                            } else if (type == "object" && value["_bsontype"] == "Decimal128") {
                                index = serializeDecimal128(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Long" || value["_bsontype"] == "Timestamp") {
                                index = serializeLong(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Double") {
                                index = serializeDouble(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Code") {
                                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
                            } else if (typeof value == "function" && serializeFunctions) {
                                index = serializeFunction(buffer, key, value, index, checkKeys, depth, serializeFunctions);
                            } else if (value["_bsontype"] == "Binary") {
                                index = serializeBinary(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Symbol") {
                                index = serializeSymbol(buffer, key, value, index);
                            } else if (value["_bsontype"] == "DBRef") {
                                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions);
                            } else if (value["_bsontype"] == "BSONRegExp") {
                                index = serializeBSONRegExp(buffer, key, value, index);
                            } else if (value["_bsontype"] == "Int32") {
                                index = serializeInt32(buffer, key, value, index);
                            } else if (value["_bsontype"] == "MinKey" || value["_bsontype"] == "MaxKey") {
                                index = serializeMinMax(buffer, key, value, index);
                            }
                        }
                    }
                    path.pop();
                    buffer[index++] = 0;
                    var size = index - startingIndex;
                    buffer[startingIndex++] = size & 255;
                    buffer[startingIndex++] = size >> 8 & 255;
                    buffer[startingIndex++] = size >> 16 & 255;
                    buffer[startingIndex++] = size >> 24 & 255;
                    return index;
                };
                var BSON = {};
                var functionCache = BSON.functionCache = {};
                BSON.BSON_DATA_NUMBER = 1;
                BSON.BSON_DATA_STRING = 2;
                BSON.BSON_DATA_OBJECT = 3;
                BSON.BSON_DATA_ARRAY = 4;
                BSON.BSON_DATA_BINARY = 5;
                BSON.BSON_DATA_UNDEFINED = 6;
                BSON.BSON_DATA_OID = 7;
                BSON.BSON_DATA_BOOLEAN = 8;
                BSON.BSON_DATA_DATE = 9;
                BSON.BSON_DATA_NULL = 10;
                BSON.BSON_DATA_REGEXP = 11;
                BSON.BSON_DATA_CODE = 13;
                BSON.BSON_DATA_SYMBOL = 14;
                BSON.BSON_DATA_CODE_W_SCOPE = 15;
                BSON.BSON_DATA_INT = 16;
                BSON.BSON_DATA_TIMESTAMP = 17;
                BSON.BSON_DATA_LONG = 18;
                BSON.BSON_DATA_DECIMAL128 = 19;
                BSON.BSON_DATA_MIN_KEY = 255;
                BSON.BSON_DATA_MAX_KEY = 127;
                BSON.BSON_BINARY_SUBTYPE_DEFAULT = 0;
                BSON.BSON_BINARY_SUBTYPE_FUNCTION = 1;
                BSON.BSON_BINARY_SUBTYPE_BYTE_ARRAY = 2;
                BSON.BSON_BINARY_SUBTYPE_UUID = 3;
                BSON.BSON_BINARY_SUBTYPE_MD5 = 4;
                BSON.BSON_BINARY_SUBTYPE_USER_DEFINED = 128;
                BSON.BSON_INT32_MAX = 2147483647;
                BSON.BSON_INT32_MIN = -2147483648;
                BSON.BSON_INT64_MAX = Math.pow(2, 63) - 1;
                BSON.BSON_INT64_MIN = -Math.pow(2, 63);
                BSON.JS_INT_MAX = 9007199254740992;
                BSON.JS_INT_MIN = -9007199254740992;
                var JS_INT_MAX_LONG = Long.fromNumber(9007199254740992);
                var JS_INT_MIN_LONG = Long.fromNumber(-9007199254740992);
                module.exports = serializeInto;
            }).call(this, require("buffer").Buffer);
        }, {
            "../binary": 13,
            "../code": 15,
            "../db_ref": 16,
            "../decimal128": 17,
            "../double": 18,
            "../float_parser": 19,
            "../int_32": 20,
            "../long": 21,
            "../map": 22,
            "../max_key": 23,
            "../min_key": 24,
            "../objectid": 25,
            "../regexp": 29,
            "../symbol": 30,
            "../timestamp": 31,
            buffer: 1
        } ],
        29: [ function(require, module, exports) {
            function BSONRegExp(pattern, options) {
                if (!(this instanceof BSONRegExp)) return new BSONRegExp();
                this._bsontype = "BSONRegExp";
                this.pattern = pattern || "";
                this.options = options || "";
                for (var i = 0; i < this.options.length; i++) {
                    if (!(this.options[i] == "i" || this.options[i] == "m" || this.options[i] == "x" || this.options[i] == "l" || this.options[i] == "s" || this.options[i] == "u")) {
                        throw new Error("the regular expression options [" + this.options[i] + "] is not supported");
                    }
                }
            }
            module.exports = BSONRegExp;
            module.exports.BSONRegExp = BSONRegExp;
        }, {} ],
        30: [ function(require, module, exports) {
            function Symbol(value) {
                if (!(this instanceof Symbol)) return new Symbol(value);
                this._bsontype = "Symbol";
                this.value = value;
            }
            Symbol.prototype.valueOf = function() {
                return this.value;
            };
            Symbol.prototype.toString = function() {
                return this.value;
            };
            Symbol.prototype.inspect = function() {
                return this.value;
            };
            Symbol.prototype.toJSON = function() {
                return this.value;
            };
            module.exports = Symbol;
            module.exports.Symbol = Symbol;
        }, {} ],
        31: [ function(require, module, exports) {
            function Timestamp(low, high) {
                if (!(this instanceof Timestamp)) return new Timestamp(low, high);
                this._bsontype = "Timestamp";
                this.low_ = low | 0;
                this.high_ = high | 0;
            }
            Timestamp.prototype.toInt = function() {
                return this.low_;
            };
            Timestamp.prototype.toNumber = function() {
                return this.high_ * Timestamp.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned();
            };
            Timestamp.prototype.toJSON = function() {
                return this.toString();
            };
            Timestamp.prototype.toString = function(opt_radix) {
                var radix = opt_radix || 10;
                if (radix < 2 || 36 < radix) {
                    throw Error("radix out of range: " + radix);
                }
                if (this.isZero()) {
                    return "0";
                }
                if (this.isNegative()) {
                    if (this.equals(Timestamp.MIN_VALUE)) {
                        var radixTimestamp = Timestamp.fromNumber(radix);
                        var div = this.div(radixTimestamp);
                        var rem = div.multiply(radixTimestamp).subtract(this);
                        return div.toString(radix) + rem.toInt().toString(radix);
                    } else {
                        return "-" + this.negate().toString(radix);
                    }
                }
                var radixToPower = Timestamp.fromNumber(Math.pow(radix, 6));
                var rem = this;
                var result = "";
                while (true) {
                    var remDiv = rem.div(radixToPower);
                    var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
                    var digits = intval.toString(radix);
                    rem = remDiv;
                    if (rem.isZero()) {
                        return digits + result;
                    } else {
                        while (digits.length < 6) {
                            digits = "0" + digits;
                        }
                        result = "" + digits + result;
                    }
                }
            };
            Timestamp.prototype.getHighBits = function() {
                return this.high_;
            };
            Timestamp.prototype.getLowBits = function() {
                return this.low_;
            };
            Timestamp.prototype.getLowBitsUnsigned = function() {
                return this.low_ >= 0 ? this.low_ : Timestamp.TWO_PWR_32_DBL_ + this.low_;
            };
            Timestamp.prototype.getNumBitsAbs = function() {
                if (this.isNegative()) {
                    if (this.equals(Timestamp.MIN_VALUE)) {
                        return 64;
                    } else {
                        return this.negate().getNumBitsAbs();
                    }
                } else {
                    var val = this.high_ != 0 ? this.high_ : this.low_;
                    for (var bit = 31; bit > 0; bit--) {
                        if ((val & 1 << bit) != 0) {
                            break;
                        }
                    }
                    return this.high_ != 0 ? bit + 33 : bit + 1;
                }
            };
            Timestamp.prototype.isZero = function() {
                return this.high_ == 0 && this.low_ == 0;
            };
            Timestamp.prototype.isNegative = function() {
                return this.high_ < 0;
            };
            Timestamp.prototype.isOdd = function() {
                return (this.low_ & 1) == 1;
            };
            Timestamp.prototype.equals = function(other) {
                return this.high_ == other.high_ && this.low_ == other.low_;
            };
            Timestamp.prototype.notEquals = function(other) {
                return this.high_ != other.high_ || this.low_ != other.low_;
            };
            Timestamp.prototype.lessThan = function(other) {
                return this.compare(other) < 0;
            };
            Timestamp.prototype.lessThanOrEqual = function(other) {
                return this.compare(other) <= 0;
            };
            Timestamp.prototype.greaterThan = function(other) {
                return this.compare(other) > 0;
            };
            Timestamp.prototype.greaterThanOrEqual = function(other) {
                return this.compare(other) >= 0;
            };
            Timestamp.prototype.compare = function(other) {
                if (this.equals(other)) {
                    return 0;
                }
                var thisNeg = this.isNegative();
                var otherNeg = other.isNegative();
                if (thisNeg && !otherNeg) {
                    return -1;
                }
                if (!thisNeg && otherNeg) {
                    return 1;
                }
                if (this.subtract(other).isNegative()) {
                    return -1;
                } else {
                    return 1;
                }
            };
            Timestamp.prototype.negate = function() {
                if (this.equals(Timestamp.MIN_VALUE)) {
                    return Timestamp.MIN_VALUE;
                } else {
                    return this.not().add(Timestamp.ONE);
                }
            };
            Timestamp.prototype.add = function(other) {
                var a48 = this.high_ >>> 16;
                var a32 = this.high_ & 65535;
                var a16 = this.low_ >>> 16;
                var a00 = this.low_ & 65535;
                var b48 = other.high_ >>> 16;
                var b32 = other.high_ & 65535;
                var b16 = other.low_ >>> 16;
                var b00 = other.low_ & 65535;
                var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
                c00 += a00 + b00;
                c16 += c00 >>> 16;
                c00 &= 65535;
                c16 += a16 + b16;
                c32 += c16 >>> 16;
                c16 &= 65535;
                c32 += a32 + b32;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c48 += a48 + b48;
                c48 &= 65535;
                return Timestamp.fromBits(c16 << 16 | c00, c48 << 16 | c32);
            };
            Timestamp.prototype.subtract = function(other) {
                return this.add(other.negate());
            };
            Timestamp.prototype.multiply = function(other) {
                if (this.isZero()) {
                    return Timestamp.ZERO;
                } else if (other.isZero()) {
                    return Timestamp.ZERO;
                }
                if (this.equals(Timestamp.MIN_VALUE)) {
                    return other.isOdd() ? Timestamp.MIN_VALUE : Timestamp.ZERO;
                } else if (other.equals(Timestamp.MIN_VALUE)) {
                    return this.isOdd() ? Timestamp.MIN_VALUE : Timestamp.ZERO;
                }
                if (this.isNegative()) {
                    if (other.isNegative()) {
                        return this.negate().multiply(other.negate());
                    } else {
                        return this.negate().multiply(other).negate();
                    }
                } else if (other.isNegative()) {
                    return this.multiply(other.negate()).negate();
                }
                if (this.lessThan(Timestamp.TWO_PWR_24_) && other.lessThan(Timestamp.TWO_PWR_24_)) {
                    return Timestamp.fromNumber(this.toNumber() * other.toNumber());
                }
                var a48 = this.high_ >>> 16;
                var a32 = this.high_ & 65535;
                var a16 = this.low_ >>> 16;
                var a00 = this.low_ & 65535;
                var b48 = other.high_ >>> 16;
                var b32 = other.high_ & 65535;
                var b16 = other.low_ >>> 16;
                var b00 = other.low_ & 65535;
                var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
                c00 += a00 * b00;
                c16 += c00 >>> 16;
                c00 &= 65535;
                c16 += a16 * b00;
                c32 += c16 >>> 16;
                c16 &= 65535;
                c16 += a00 * b16;
                c32 += c16 >>> 16;
                c16 &= 65535;
                c32 += a32 * b00;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c32 += a16 * b16;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c32 += a00 * b32;
                c48 += c32 >>> 16;
                c32 &= 65535;
                c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
                c48 &= 65535;
                return Timestamp.fromBits(c16 << 16 | c00, c48 << 16 | c32);
            };
            Timestamp.prototype.div = function(other) {
                if (other.isZero()) {
                    throw Error("division by zero");
                } else if (this.isZero()) {
                    return Timestamp.ZERO;
                }
                if (this.equals(Timestamp.MIN_VALUE)) {
                    if (other.equals(Timestamp.ONE) || other.equals(Timestamp.NEG_ONE)) {
                        return Timestamp.MIN_VALUE;
                    } else if (other.equals(Timestamp.MIN_VALUE)) {
                        return Timestamp.ONE;
                    } else {
                        var halfThis = this.shiftRight(1);
                        var approx = halfThis.div(other).shiftLeft(1);
                        if (approx.equals(Timestamp.ZERO)) {
                            return other.isNegative() ? Timestamp.ONE : Timestamp.NEG_ONE;
                        } else {
                            var rem = this.subtract(other.multiply(approx));
                            var result = approx.add(rem.div(other));
                            return result;
                        }
                    }
                } else if (other.equals(Timestamp.MIN_VALUE)) {
                    return Timestamp.ZERO;
                }
                if (this.isNegative()) {
                    if (other.isNegative()) {
                        return this.negate().div(other.negate());
                    } else {
                        return this.negate().div(other).negate();
                    }
                } else if (other.isNegative()) {
                    return this.div(other.negate()).negate();
                }
                var res = Timestamp.ZERO;
                var rem = this;
                while (rem.greaterThanOrEqual(other)) {
                    var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
                    var log2 = Math.ceil(Math.log(approx) / Math.LN2);
                    var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
                    var approxRes = Timestamp.fromNumber(approx);
                    var approxRem = approxRes.multiply(other);
                    while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
                        approx -= delta;
                        approxRes = Timestamp.fromNumber(approx);
                        approxRem = approxRes.multiply(other);
                    }
                    if (approxRes.isZero()) {
                        approxRes = Timestamp.ONE;
                    }
                    res = res.add(approxRes);
                    rem = rem.subtract(approxRem);
                }
                return res;
            };
            Timestamp.prototype.modulo = function(other) {
                return this.subtract(this.div(other).multiply(other));
            };
            Timestamp.prototype.not = function() {
                return Timestamp.fromBits(~this.low_, ~this.high_);
            };
            Timestamp.prototype.and = function(other) {
                return Timestamp.fromBits(this.low_ & other.low_, this.high_ & other.high_);
            };
            Timestamp.prototype.or = function(other) {
                return Timestamp.fromBits(this.low_ | other.low_, this.high_ | other.high_);
            };
            Timestamp.prototype.xor = function(other) {
                return Timestamp.fromBits(this.low_ ^ other.low_, this.high_ ^ other.high_);
            };
            Timestamp.prototype.shiftLeft = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var low = this.low_;
                    if (numBits < 32) {
                        var high = this.high_;
                        return Timestamp.fromBits(low << numBits, high << numBits | low >>> 32 - numBits);
                    } else {
                        return Timestamp.fromBits(0, low << numBits - 32);
                    }
                }
            };
            Timestamp.prototype.shiftRight = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var high = this.high_;
                    if (numBits < 32) {
                        var low = this.low_;
                        return Timestamp.fromBits(low >>> numBits | high << 32 - numBits, high >> numBits);
                    } else {
                        return Timestamp.fromBits(high >> numBits - 32, high >= 0 ? 0 : -1);
                    }
                }
            };
            Timestamp.prototype.shiftRightUnsigned = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var high = this.high_;
                    if (numBits < 32) {
                        var low = this.low_;
                        return Timestamp.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits);
                    } else if (numBits == 32) {
                        return Timestamp.fromBits(high, 0);
                    } else {
                        return Timestamp.fromBits(high >>> numBits - 32, 0);
                    }
                }
            };
            Timestamp.fromInt = function(value) {
                if (-128 <= value && value < 128) {
                    var cachedObj = Timestamp.INT_CACHE_[value];
                    if (cachedObj) {
                        return cachedObj;
                    }
                }
                var obj = new Timestamp(value | 0, value < 0 ? -1 : 0);
                if (-128 <= value && value < 128) {
                    Timestamp.INT_CACHE_[value] = obj;
                }
                return obj;
            };
            Timestamp.fromNumber = function(value) {
                if (isNaN(value) || !isFinite(value)) {
                    return Timestamp.ZERO;
                } else if (value <= -Timestamp.TWO_PWR_63_DBL_) {
                    return Timestamp.MIN_VALUE;
                } else if (value + 1 >= Timestamp.TWO_PWR_63_DBL_) {
                    return Timestamp.MAX_VALUE;
                } else if (value < 0) {
                    return Timestamp.fromNumber(-value).negate();
                } else {
                    return new Timestamp(value % Timestamp.TWO_PWR_32_DBL_ | 0, value / Timestamp.TWO_PWR_32_DBL_ | 0);
                }
            };
            Timestamp.fromBits = function(lowBits, highBits) {
                return new Timestamp(lowBits, highBits);
            };
            Timestamp.fromString = function(str, opt_radix) {
                if (str.length == 0) {
                    throw Error("number format error: empty string");
                }
                var radix = opt_radix || 10;
                if (radix < 2 || 36 < radix) {
                    throw Error("radix out of range: " + radix);
                }
                if (str.charAt(0) == "-") {
                    return Timestamp.fromString(str.substring(1), radix).negate();
                } else if (str.indexOf("-") >= 0) {
                    throw Error('number format error: interior "-" character: ' + str);
                }
                var radixToPower = Timestamp.fromNumber(Math.pow(radix, 8));
                var result = Timestamp.ZERO;
                for (var i = 0; i < str.length; i += 8) {
                    var size = Math.min(8, str.length - i);
                    var value = parseInt(str.substring(i, i + size), radix);
                    if (size < 8) {
                        var power = Timestamp.fromNumber(Math.pow(radix, size));
                        result = result.multiply(power).add(Timestamp.fromNumber(value));
                    } else {
                        result = result.multiply(radixToPower);
                        result = result.add(Timestamp.fromNumber(value));
                    }
                }
                return result;
            };
            Timestamp.INT_CACHE_ = {};
            Timestamp.TWO_PWR_16_DBL_ = 1 << 16;
            Timestamp.TWO_PWR_24_DBL_ = 1 << 24;
            Timestamp.TWO_PWR_32_DBL_ = Timestamp.TWO_PWR_16_DBL_ * Timestamp.TWO_PWR_16_DBL_;
            Timestamp.TWO_PWR_31_DBL_ = Timestamp.TWO_PWR_32_DBL_ / 2;
            Timestamp.TWO_PWR_48_DBL_ = Timestamp.TWO_PWR_32_DBL_ * Timestamp.TWO_PWR_16_DBL_;
            Timestamp.TWO_PWR_64_DBL_ = Timestamp.TWO_PWR_32_DBL_ * Timestamp.TWO_PWR_32_DBL_;
            Timestamp.TWO_PWR_63_DBL_ = Timestamp.TWO_PWR_64_DBL_ / 2;
            Timestamp.ZERO = Timestamp.fromInt(0);
            Timestamp.ONE = Timestamp.fromInt(1);
            Timestamp.NEG_ONE = Timestamp.fromInt(-1);
            Timestamp.MAX_VALUE = Timestamp.fromBits(4294967295 | 0, 2147483647 | 0);
            Timestamp.MIN_VALUE = Timestamp.fromBits(0, 2147483648 | 0);
            Timestamp.TWO_PWR_24_ = Timestamp.fromInt(1 << 24);
            module.exports = Timestamp;
            module.exports.Timestamp = Timestamp;
        }, {} ],
        32: [ function(require, module, exports) {
            var funcTag = "[object Function]", genTag = "[object GeneratorFunction]";
            var objectProto = Object.prototype;
            var objectToString = objectProto.toString;
            function isFunction(value) {
                var tag = isObject(value) ? objectToString.call(value) : "";
                return tag == funcTag || tag == genTag;
            }
            function isObject(value) {
                var type = typeof value;
                return !!value && (type == "object" || type == "function");
            }
            module.exports = isFunction;
        }, {} ],
        33: [ function(require, module, exports) {
            (function(global) {
                var LARGE_ARRAY_SIZE = 200;
                var FUNC_ERROR_TEXT = "Expected a function";
                var HASH_UNDEFINED = "__lodash_hash_undefined__";
                var UNORDERED_COMPARE_FLAG = 1, PARTIAL_COMPARE_FLAG = 2;
                var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991;
                var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", promiseTag = "[object Promise]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", weakMapTag = "[object WeakMap]";
                var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
                var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, reLeadingDot = /^\./, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
                var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
                var reEscapeChar = /\\(\\)?/g;
                var reIsHostCtor = /^\[object .+?Constructor\]$/;
                var reIsUint = /^(?:0|[1-9]\d*)$/;
                var typedArrayTags = {};
                typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
                typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
                var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
                var freeSelf = typeof self == "object" && self && self.Object === Object && self;
                var root = freeGlobal || freeSelf || Function("return this")();
                var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
                var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
                var moduleExports = freeModule && freeModule.exports === freeExports;
                var freeProcess = moduleExports && freeGlobal.process;
                var nodeUtil = function() {
                    try {
                        return freeProcess && freeProcess.binding("util");
                    } catch (e) {}
                }();
                var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
                function arrayEach(array, iteratee) {
                    var index = -1, length = array ? array.length : 0;
                    while (++index < length) {
                        if (iteratee(array[index], index, array) === false) {
                            break;
                        }
                    }
                    return array;
                }
                function arraySome(array, predicate) {
                    var index = -1, length = array ? array.length : 0;
                    while (++index < length) {
                        if (predicate(array[index], index, array)) {
                            return true;
                        }
                    }
                    return false;
                }
                function baseProperty(key) {
                    return function(object) {
                        return object == null ? undefined : object[key];
                    };
                }
                function baseTimes(n, iteratee) {
                    var index = -1, result = Array(n);
                    while (++index < n) {
                        result[index] = iteratee(index);
                    }
                    return result;
                }
                function baseUnary(func) {
                    return function(value) {
                        return func(value);
                    };
                }
                function getValue(object, key) {
                    return object == null ? undefined : object[key];
                }
                function isHostObject(value) {
                    var result = false;
                    if (value != null && typeof value.toString != "function") {
                        try {
                            result = !!(value + "");
                        } catch (e) {}
                    }
                    return result;
                }
                function mapToArray(map) {
                    var index = -1, result = Array(map.size);
                    map.forEach(function(value, key) {
                        result[++index] = [ key, value ];
                    });
                    return result;
                }
                function overArg(func, transform) {
                    return function(arg) {
                        return func(transform(arg));
                    };
                }
                function setToArray(set) {
                    var index = -1, result = Array(set.size);
                    set.forEach(function(value) {
                        result[++index] = value;
                    });
                    return result;
                }
                var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
                var coreJsData = root["__core-js_shared__"];
                var maskSrcKey = function() {
                    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
                    return uid ? "Symbol(src)_1." + uid : "";
                }();
                var funcToString = funcProto.toString;
                var hasOwnProperty = objectProto.hasOwnProperty;
                var objectToString = objectProto.toString;
                var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
                var Symbol = root.Symbol, Uint8Array = root.Uint8Array, getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice;
                var nativeKeys = overArg(Object.keys, Object);
                var DataView = getNative(root, "DataView"), Map = getNative(root, "Map"), Promise = getNative(root, "Promise"), Set = getNative(root, "Set"), WeakMap = getNative(root, "WeakMap"), nativeCreate = getNative(Object, "create");
                var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
                var symbolProto = Symbol ? Symbol.prototype : undefined, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined, symbolToString = symbolProto ? symbolProto.toString : undefined;
                function Hash(entries) {
                    var index = -1, length = entries ? entries.length : 0;
                    this.clear();
                    while (++index < length) {
                        var entry = entries[index];
                        this.set(entry[0], entry[1]);
                    }
                }
                function hashClear() {
                    this.__data__ = nativeCreate ? nativeCreate(null) : {};
                }
                function hashDelete(key) {
                    return this.has(key) && delete this.__data__[key];
                }
                function hashGet(key) {
                    var data = this.__data__;
                    if (nativeCreate) {
                        var result = data[key];
                        return result === HASH_UNDEFINED ? undefined : result;
                    }
                    return hasOwnProperty.call(data, key) ? data[key] : undefined;
                }
                function hashHas(key) {
                    var data = this.__data__;
                    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
                }
                function hashSet(key, value) {
                    var data = this.__data__;
                    data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
                    return this;
                }
                Hash.prototype.clear = hashClear;
                Hash.prototype["delete"] = hashDelete;
                Hash.prototype.get = hashGet;
                Hash.prototype.has = hashHas;
                Hash.prototype.set = hashSet;
                function ListCache(entries) {
                    var index = -1, length = entries ? entries.length : 0;
                    this.clear();
                    while (++index < length) {
                        var entry = entries[index];
                        this.set(entry[0], entry[1]);
                    }
                }
                function listCacheClear() {
                    this.__data__ = [];
                }
                function listCacheDelete(key) {
                    var data = this.__data__, index = assocIndexOf(data, key);
                    if (index < 0) {
                        return false;
                    }
                    var lastIndex = data.length - 1;
                    if (index == lastIndex) {
                        data.pop();
                    } else {
                        splice.call(data, index, 1);
                    }
                    return true;
                }
                function listCacheGet(key) {
                    var data = this.__data__, index = assocIndexOf(data, key);
                    return index < 0 ? undefined : data[index][1];
                }
                function listCacheHas(key) {
                    return assocIndexOf(this.__data__, key) > -1;
                }
                function listCacheSet(key, value) {
                    var data = this.__data__, index = assocIndexOf(data, key);
                    if (index < 0) {
                        data.push([ key, value ]);
                    } else {
                        data[index][1] = value;
                    }
                    return this;
                }
                ListCache.prototype.clear = listCacheClear;
                ListCache.prototype["delete"] = listCacheDelete;
                ListCache.prototype.get = listCacheGet;
                ListCache.prototype.has = listCacheHas;
                ListCache.prototype.set = listCacheSet;
                function MapCache(entries) {
                    var index = -1, length = entries ? entries.length : 0;
                    this.clear();
                    while (++index < length) {
                        var entry = entries[index];
                        this.set(entry[0], entry[1]);
                    }
                }
                function mapCacheClear() {
                    this.__data__ = {
                        hash: new Hash(),
                        map: new (Map || ListCache)(),
                        string: new Hash()
                    };
                }
                function mapCacheDelete(key) {
                    return getMapData(this, key)["delete"](key);
                }
                function mapCacheGet(key) {
                    return getMapData(this, key).get(key);
                }
                function mapCacheHas(key) {
                    return getMapData(this, key).has(key);
                }
                function mapCacheSet(key, value) {
                    getMapData(this, key).set(key, value);
                    return this;
                }
                MapCache.prototype.clear = mapCacheClear;
                MapCache.prototype["delete"] = mapCacheDelete;
                MapCache.prototype.get = mapCacheGet;
                MapCache.prototype.has = mapCacheHas;
                MapCache.prototype.set = mapCacheSet;
                function SetCache(values) {
                    var index = -1, length = values ? values.length : 0;
                    this.__data__ = new MapCache();
                    while (++index < length) {
                        this.add(values[index]);
                    }
                }
                function setCacheAdd(value) {
                    this.__data__.set(value, HASH_UNDEFINED);
                    return this;
                }
                function setCacheHas(value) {
                    return this.__data__.has(value);
                }
                SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
                SetCache.prototype.has = setCacheHas;
                function Stack(entries) {
                    this.__data__ = new ListCache(entries);
                }
                function stackClear() {
                    this.__data__ = new ListCache();
                }
                function stackDelete(key) {
                    return this.__data__["delete"](key);
                }
                function stackGet(key) {
                    return this.__data__.get(key);
                }
                function stackHas(key) {
                    return this.__data__.has(key);
                }
                function stackSet(key, value) {
                    var cache = this.__data__;
                    if (cache instanceof ListCache) {
                        var pairs = cache.__data__;
                        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
                            pairs.push([ key, value ]);
                            return this;
                        }
                        cache = this.__data__ = new MapCache(pairs);
                    }
                    cache.set(key, value);
                    return this;
                }
                Stack.prototype.clear = stackClear;
                Stack.prototype["delete"] = stackDelete;
                Stack.prototype.get = stackGet;
                Stack.prototype.has = stackHas;
                Stack.prototype.set = stackSet;
                function arrayLikeKeys(value, inherited) {
                    var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
                    var length = result.length, skipIndexes = !!length;
                    for (var key in value) {
                        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
                            result.push(key);
                        }
                    }
                    return result;
                }
                function assocIndexOf(array, key) {
                    var length = array.length;
                    while (length--) {
                        if (eq(array[length][0], key)) {
                            return length;
                        }
                    }
                    return -1;
                }
                function baseCreate(proto) {
                    return isObject(proto) ? objectCreate(proto) : {};
                }
                var baseFor = createBaseFor();
                function baseForOwn(object, iteratee) {
                    return object && baseFor(object, iteratee, keys);
                }
                function baseGet(object, path) {
                    path = isKey(path, object) ? [ path ] : castPath(path);
                    var index = 0, length = path.length;
                    while (object != null && index < length) {
                        object = object[toKey(path[index++])];
                    }
                    return index && index == length ? object : undefined;
                }
                function baseGetTag(value) {
                    return objectToString.call(value);
                }
                function baseHasIn(object, key) {
                    return object != null && key in Object(object);
                }
                function baseIsEqual(value, other, customizer, bitmask, stack) {
                    if (value === other) {
                        return true;
                    }
                    if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
                        return value !== value && other !== other;
                    }
                    return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
                }
                function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
                    var objIsArr = isArray(object), othIsArr = isArray(other), objTag = arrayTag, othTag = arrayTag;
                    if (!objIsArr) {
                        objTag = getTag(object);
                        objTag = objTag == argsTag ? objectTag : objTag;
                    }
                    if (!othIsArr) {
                        othTag = getTag(other);
                        othTag = othTag == argsTag ? objectTag : othTag;
                    }
                    var objIsObj = objTag == objectTag && !isHostObject(object), othIsObj = othTag == objectTag && !isHostObject(other), isSameTag = objTag == othTag;
                    if (isSameTag && !objIsObj) {
                        stack || (stack = new Stack());
                        return objIsArr || isTypedArray(object) ? equalArrays(object, other, equalFunc, customizer, bitmask, stack) : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
                    }
                    if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
                        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
                        if (objIsWrapped || othIsWrapped) {
                            var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
                            stack || (stack = new Stack());
                            return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
                        }
                    }
                    if (!isSameTag) {
                        return false;
                    }
                    stack || (stack = new Stack());
                    return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
                }
                function baseIsMatch(object, source, matchData, customizer) {
                    var index = matchData.length, length = index, noCustomizer = !customizer;
                    if (object == null) {
                        return !length;
                    }
                    object = Object(object);
                    while (index--) {
                        var data = matchData[index];
                        if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
                            return false;
                        }
                    }
                    while (++index < length) {
                        data = matchData[index];
                        var key = data[0], objValue = object[key], srcValue = data[1];
                        if (noCustomizer && data[2]) {
                            if (objValue === undefined && !(key in object)) {
                                return false;
                            }
                        } else {
                            var stack = new Stack();
                            if (customizer) {
                                var result = customizer(objValue, srcValue, key, object, source, stack);
                            }
                            if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack) : result)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
                function baseIsNative(value) {
                    if (!isObject(value) || isMasked(value)) {
                        return false;
                    }
                    var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
                    return pattern.test(toSource(value));
                }
                function baseIsTypedArray(value) {
                    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
                }
                function baseIteratee(value) {
                    if (typeof value == "function") {
                        return value;
                    }
                    if (value == null) {
                        return identity;
                    }
                    if (typeof value == "object") {
                        return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
                    }
                    return property(value);
                }
                function baseKeys(object) {
                    if (!isPrototype(object)) {
                        return nativeKeys(object);
                    }
                    var result = [];
                    for (var key in Object(object)) {
                        if (hasOwnProperty.call(object, key) && key != "constructor") {
                            result.push(key);
                        }
                    }
                    return result;
                }
                function baseMatches(source) {
                    var matchData = getMatchData(source);
                    if (matchData.length == 1 && matchData[0][2]) {
                        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
                    }
                    return function(object) {
                        return object === source || baseIsMatch(object, source, matchData);
                    };
                }
                function baseMatchesProperty(path, srcValue) {
                    if (isKey(path) && isStrictComparable(srcValue)) {
                        return matchesStrictComparable(toKey(path), srcValue);
                    }
                    return function(object) {
                        var objValue = get(object, path);
                        return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
                    };
                }
                function basePropertyDeep(path) {
                    return function(object) {
                        return baseGet(object, path);
                    };
                }
                function baseToString(value) {
                    if (typeof value == "string") {
                        return value;
                    }
                    if (isSymbol(value)) {
                        return symbolToString ? symbolToString.call(value) : "";
                    }
                    var result = value + "";
                    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
                }
                function castPath(value) {
                    return isArray(value) ? value : stringToPath(value);
                }
                function createBaseFor(fromRight) {
                    return function(object, iteratee, keysFunc) {
                        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
                        while (length--) {
                            var key = props[fromRight ? length : ++index];
                            if (iteratee(iterable[key], key, iterable) === false) {
                                break;
                            }
                        }
                        return object;
                    };
                }
                function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
                    var isPartial = bitmask & PARTIAL_COMPARE_FLAG, arrLength = array.length, othLength = other.length;
                    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
                        return false;
                    }
                    var stacked = stack.get(array);
                    if (stacked && stack.get(other)) {
                        return stacked == other;
                    }
                    var index = -1, result = true, seen = bitmask & UNORDERED_COMPARE_FLAG ? new SetCache() : undefined;
                    stack.set(array, other);
                    stack.set(other, array);
                    while (++index < arrLength) {
                        var arrValue = array[index], othValue = other[index];
                        if (customizer) {
                            var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
                        }
                        if (compared !== undefined) {
                            if (compared) {
                                continue;
                            }
                            result = false;
                            break;
                        }
                        if (seen) {
                            if (!arraySome(other, function(othValue, othIndex) {
                                if (!seen.has(othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
                                    return seen.add(othIndex);
                                }
                            })) {
                                result = false;
                                break;
                            }
                        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
                            result = false;
                            break;
                        }
                    }
                    stack["delete"](array);
                    stack["delete"](other);
                    return result;
                }
                function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
                    switch (tag) {
                      case dataViewTag:
                        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
                            return false;
                        }
                        object = object.buffer;
                        other = other.buffer;

                      case arrayBufferTag:
                        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
                            return false;
                        }
                        return true;

                      case boolTag:
                      case dateTag:
                      case numberTag:
                        return eq(+object, +other);

                      case errorTag:
                        return object.name == other.name && object.message == other.message;

                      case regexpTag:
                      case stringTag:
                        return object == other + "";

                      case mapTag:
                        var convert = mapToArray;

                      case setTag:
                        var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
                        convert || (convert = setToArray);
                        if (object.size != other.size && !isPartial) {
                            return false;
                        }
                        var stacked = stack.get(object);
                        if (stacked) {
                            return stacked == other;
                        }
                        bitmask |= UNORDERED_COMPARE_FLAG;
                        stack.set(object, other);
                        var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
                        stack["delete"](object);
                        return result;

                      case symbolTag:
                        if (symbolValueOf) {
                            return symbolValueOf.call(object) == symbolValueOf.call(other);
                        }
                    }
                    return false;
                }
                function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
                    var isPartial = bitmask & PARTIAL_COMPARE_FLAG, objProps = keys(object), objLength = objProps.length, othProps = keys(other), othLength = othProps.length;
                    if (objLength != othLength && !isPartial) {
                        return false;
                    }
                    var index = objLength;
                    while (index--) {
                        var key = objProps[index];
                        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
                            return false;
                        }
                    }
                    var stacked = stack.get(object);
                    if (stacked && stack.get(other)) {
                        return stacked == other;
                    }
                    var result = true;
                    stack.set(object, other);
                    stack.set(other, object);
                    var skipCtor = isPartial;
                    while (++index < objLength) {
                        key = objProps[index];
                        var objValue = object[key], othValue = other[key];
                        if (customizer) {
                            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
                        }
                        if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack) : compared)) {
                            result = false;
                            break;
                        }
                        skipCtor || (skipCtor = key == "constructor");
                    }
                    if (result && !skipCtor) {
                        var objCtor = object.constructor, othCtor = other.constructor;
                        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
                            result = false;
                        }
                    }
                    stack["delete"](object);
                    stack["delete"](other);
                    return result;
                }
                function getMapData(map, key) {
                    var data = map.__data__;
                    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
                }
                function getMatchData(object) {
                    var result = keys(object), length = result.length;
                    while (length--) {
                        var key = result[length], value = object[key];
                        result[length] = [ key, value, isStrictComparable(value) ];
                    }
                    return result;
                }
                function getNative(object, key) {
                    var value = getValue(object, key);
                    return baseIsNative(value) ? value : undefined;
                }
                var getTag = baseGetTag;
                if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
                    getTag = function(value) {
                        var result = objectToString.call(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : undefined;
                        if (ctorString) {
                            switch (ctorString) {
                              case dataViewCtorString:
                                return dataViewTag;

                              case mapCtorString:
                                return mapTag;

                              case promiseCtorString:
                                return promiseTag;

                              case setCtorString:
                                return setTag;

                              case weakMapCtorString:
                                return weakMapTag;
                            }
                        }
                        return result;
                    };
                }
                function hasPath(object, path, hasFunc) {
                    path = isKey(path, object) ? [ path ] : castPath(path);
                    var result, index = -1, length = path.length;
                    while (++index < length) {
                        var key = toKey(path[index]);
                        if (!(result = object != null && hasFunc(object, key))) {
                            break;
                        }
                        object = object[key];
                    }
                    if (result) {
                        return result;
                    }
                    var length = object ? object.length : 0;
                    return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
                }
                function isIndex(value, length) {
                    length = length == null ? MAX_SAFE_INTEGER : length;
                    return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
                }
                function isKey(value, object) {
                    if (isArray(value)) {
                        return false;
                    }
                    var type = typeof value;
                    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
                        return true;
                    }
                    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
                }
                function isKeyable(value) {
                    var type = typeof value;
                    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
                }
                function isMasked(func) {
                    return !!maskSrcKey && maskSrcKey in func;
                }
                function isPrototype(value) {
                    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
                    return value === proto;
                }
                function isStrictComparable(value) {
                    return value === value && !isObject(value);
                }
                function matchesStrictComparable(key, srcValue) {
                    return function(object) {
                        if (object == null) {
                            return false;
                        }
                        return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
                    };
                }
                var stringToPath = memoize(function(string) {
                    string = toString(string);
                    var result = [];
                    if (reLeadingDot.test(string)) {
                        result.push("");
                    }
                    string.replace(rePropName, function(match, number, quote, string) {
                        result.push(quote ? string.replace(reEscapeChar, "$1") : number || match);
                    });
                    return result;
                });
                function toKey(value) {
                    if (typeof value == "string" || isSymbol(value)) {
                        return value;
                    }
                    var result = value + "";
                    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
                }
                function toSource(func) {
                    if (func != null) {
                        try {
                            return funcToString.call(func);
                        } catch (e) {}
                        try {
                            return func + "";
                        } catch (e) {}
                    }
                    return "";
                }
                function memoize(func, resolver) {
                    if (typeof func != "function" || resolver && typeof resolver != "function") {
                        throw new TypeError(FUNC_ERROR_TEXT);
                    }
                    var memoized = function() {
                        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
                        if (cache.has(key)) {
                            return cache.get(key);
                        }
                        var result = func.apply(this, args);
                        memoized.cache = cache.set(key, result);
                        return result;
                    };
                    memoized.cache = new (memoize.Cache || MapCache)();
                    return memoized;
                }
                memoize.Cache = MapCache;
                function eq(value, other) {
                    return value === other || value !== value && other !== other;
                }
                function isArguments(value) {
                    return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
                }
                var isArray = Array.isArray;
                function isArrayLike(value) {
                    return value != null && isLength(value.length) && !isFunction(value);
                }
                function isArrayLikeObject(value) {
                    return isObjectLike(value) && isArrayLike(value);
                }
                function isFunction(value) {
                    var tag = isObject(value) ? objectToString.call(value) : "";
                    return tag == funcTag || tag == genTag;
                }
                function isLength(value) {
                    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
                }
                function isObject(value) {
                    var type = typeof value;
                    return !!value && (type == "object" || type == "function");
                }
                function isObjectLike(value) {
                    return !!value && typeof value == "object";
                }
                function isSymbol(value) {
                    return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
                }
                var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
                function toString(value) {
                    return value == null ? "" : baseToString(value);
                }
                function get(object, path, defaultValue) {
                    var result = object == null ? undefined : baseGet(object, path);
                    return result === undefined ? defaultValue : result;
                }
                function hasIn(object, path) {
                    return object != null && hasPath(object, path, baseHasIn);
                }
                function keys(object) {
                    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
                }
                function transform(object, iteratee, accumulator) {
                    var isArr = isArray(object) || isTypedArray(object);
                    iteratee = baseIteratee(iteratee, 4);
                    if (accumulator == null) {
                        if (isArr || isObject(object)) {
                            var Ctor = object.constructor;
                            if (isArr) {
                                accumulator = isArray(object) ? new Ctor() : [];
                            } else {
                                accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
                            }
                        } else {
                            accumulator = {};
                        }
                    }
                    (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
                        return iteratee(accumulator, value, index, object);
                    });
                    return accumulator;
                }
                function identity(value) {
                    return value;
                }
                function property(path) {
                    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
                }
                module.exports = transform;
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {} ],
        34: [ function(require, module, exports) {
            (function(global) {
                var now = require("performance-now"), root = typeof window === "undefined" ? global : window, vendors = [ "moz", "webkit" ], suffix = "AnimationFrame", raf = root["request" + suffix], caf = root["cancel" + suffix] || root["cancelRequest" + suffix];
                for (var i = 0; !raf && i < vendors.length; i++) {
                    raf = root[vendors[i] + "Request" + suffix];
                    caf = root[vendors[i] + "Cancel" + suffix] || root[vendors[i] + "CancelRequest" + suffix];
                }
                if (!raf || !caf) {
                    var last = 0, id = 0, queue = [], frameDuration = 1e3 / 60;
                    raf = function(callback) {
                        if (queue.length === 0) {
                            var _now = now(), next = Math.max(0, frameDuration - (_now - last));
                            last = next + _now;
                            setTimeout(function() {
                                var cp = queue.slice(0);
                                queue.length = 0;
                                for (var i = 0; i < cp.length; i++) {
                                    if (!cp[i].cancelled) {
                                        try {
                                            cp[i].callback(last);
                                        } catch (e) {
                                            setTimeout(function() {
                                                throw e;
                                            }, 0);
                                        }
                                    }
                                }
                            }, Math.round(next));
                        }
                        queue.push({
                            handle: ++id,
                            callback: callback,
                            cancelled: false
                        });
                        return id;
                    };
                    caf = function(handle) {
                        for (var i = 0; i < queue.length; i++) {
                            if (queue[i].handle === handle) {
                                queue[i].cancelled = true;
                            }
                        }
                    };
                }
                module.exports = function(fn) {
                    return raf.call(root, fn);
                };
                module.exports.cancel = function() {
                    caf.apply(root, arguments);
                };
                module.exports.polyfill = function(object) {
                    if (!object) {
                        object = root;
                    }
                    object.requestAnimationFrame = raf;
                    object.cancelAnimationFrame = caf;
                };
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {
            "performance-now": 35
        } ],
        35: [ function(require, module, exports) {
            (function(process) {
                (function() {
                    var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;
                    if (typeof performance !== "undefined" && performance !== null && performance.now) {
                        module.exports = function() {
                            return performance.now();
                        };
                    } else if (typeof process !== "undefined" && process !== null && process.hrtime) {
                        module.exports = function() {
                            return (getNanoSeconds() - nodeLoadTime) / 1e6;
                        };
                        hrtime = process.hrtime;
                        getNanoSeconds = function() {
                            var hr;
                            hr = hrtime();
                            return hr[0] * 1e9 + hr[1];
                        };
                        moduleLoadTime = getNanoSeconds();
                        upTime = process.uptime() * 1e9;
                        nodeLoadTime = moduleLoadTime - upTime;
                    } else if (Date.now) {
                        module.exports = function() {
                            return Date.now() - loadTime;
                        };
                        loadTime = Date.now();
                    } else {
                        module.exports = function() {
                            return new Date().getTime() - loadTime;
                        };
                        loadTime = new Date().getTime();
                    }
                }).call(this);
            }).call(this, require("_process"));
        }, {
            _process: 4
        } ],
        36: [ function(require, module, exports) {
            "use strict";
            var serialize = require("mongodb-extended-json/lib/deserialize");
            var deserialize = require("mongodb-extended-json/lib/serialize");
            module.exports.parse = function(text, reviver, mode) {
                var normalized = preprocess(text, mode);
                var parsed = JSON.parse(normalized, reviver);
                return deserialize(parsed);
            };
            module.exports.stringify = function(value, replacer, space) {
                return JSON.stringify(serialize(value), replacer, space);
            };
            module.exports.deserialize = deserialize;
            module.exports.serialize = serialize;
        }, {
            "mongodb-extended-json/lib/deserialize": 8,
            "mongodb-extended-json/lib/serialize": 10
        } ]
    }, {}, [ 36 ])(36);
});