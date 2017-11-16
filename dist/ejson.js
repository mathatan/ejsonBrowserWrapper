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
        1: [ function(require, module, exports) {}, {} ],
        2: [ function(require, module, exports) {
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
            "base64-js": 3,
            ieee754: 4
        } ],
        3: [ function(require, module, exports) {
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
        4: [ function(require, module, exports) {
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
        5: [ function(require, module, exports) {
            function EventEmitter() {
                this._events = this._events || {};
                this._maxListeners = this._maxListeners || undefined;
            }
            module.exports = EventEmitter;
            EventEmitter.EventEmitter = EventEmitter;
            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype._maxListeners = undefined;
            EventEmitter.defaultMaxListeners = 10;
            EventEmitter.prototype.setMaxListeners = function(n) {
                if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
                this._maxListeners = n;
                return this;
            };
            EventEmitter.prototype.emit = function(type) {
                var er, handler, len, args, i, listeners;
                if (!this._events) this._events = {};
                if (type === "error") {
                    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
                        er = arguments[1];
                        if (er instanceof Error) {
                            throw er;
                        } else {
                            var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
                            err.context = er;
                            throw err;
                        }
                    }
                }
                handler = this._events[type];
                if (isUndefined(handler)) return false;
                if (isFunction(handler)) {
                    switch (arguments.length) {
                      case 1:
                        handler.call(this);
                        break;

                      case 2:
                        handler.call(this, arguments[1]);
                        break;

                      case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;

                      default:
                        args = Array.prototype.slice.call(arguments, 1);
                        handler.apply(this, args);
                    }
                } else if (isObject(handler)) {
                    args = Array.prototype.slice.call(arguments, 1);
                    listeners = handler.slice();
                    len = listeners.length;
                    for (i = 0; i < len; i++) listeners[i].apply(this, args);
                }
                return true;
            };
            EventEmitter.prototype.addListener = function(type, listener) {
                var m;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events) this._events = {};
                if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
                if (!this._events[type]) this._events[type] = listener; else if (isObject(this._events[type])) this._events[type].push(listener); else this._events[type] = [ this._events[type], listener ];
                if (isObject(this._events[type]) && !this._events[type].warned) {
                    if (!isUndefined(this._maxListeners)) {
                        m = this._maxListeners;
                    } else {
                        m = EventEmitter.defaultMaxListeners;
                    }
                    if (m && m > 0 && this._events[type].length > m) {
                        this._events[type].warned = true;
                        console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                        if (typeof console.trace === "function") {
                            console.trace();
                        }
                    }
                }
                return this;
            };
            EventEmitter.prototype.on = EventEmitter.prototype.addListener;
            EventEmitter.prototype.once = function(type, listener) {
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                var fired = false;
                function g() {
                    this.removeListener(type, g);
                    if (!fired) {
                        fired = true;
                        listener.apply(this, arguments);
                    }
                }
                g.listener = listener;
                this.on(type, g);
                return this;
            };
            EventEmitter.prototype.removeListener = function(type, listener) {
                var list, position, length, i;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[type]) return this;
                list = this._events[type];
                length = list.length;
                position = -1;
                if (list === listener || isFunction(list.listener) && list.listener === listener) {
                    delete this._events[type];
                    if (this._events.removeListener) this.emit("removeListener", type, listener);
                } else if (isObject(list)) {
                    for (i = length; i-- > 0; ) {
                        if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                            position = i;
                            break;
                        }
                    }
                    if (position < 0) return this;
                    if (list.length === 1) {
                        list.length = 0;
                        delete this._events[type];
                    } else {
                        list.splice(position, 1);
                    }
                    if (this._events.removeListener) this.emit("removeListener", type, listener);
                }
                return this;
            };
            EventEmitter.prototype.removeAllListeners = function(type) {
                var key, listeners;
                if (!this._events) return this;
                if (!this._events.removeListener) {
                    if (arguments.length === 0) this._events = {}; else if (this._events[type]) delete this._events[type];
                    return this;
                }
                if (arguments.length === 0) {
                    for (key in this._events) {
                        if (key === "removeListener") continue;
                        this.removeAllListeners(key);
                    }
                    this.removeAllListeners("removeListener");
                    this._events = {};
                    return this;
                }
                listeners = this._events[type];
                if (isFunction(listeners)) {
                    this.removeListener(type, listeners);
                } else if (listeners) {
                    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
                }
                delete this._events[type];
                return this;
            };
            EventEmitter.prototype.listeners = function(type) {
                var ret;
                if (!this._events || !this._events[type]) ret = []; else if (isFunction(this._events[type])) ret = [ this._events[type] ]; else ret = this._events[type].slice();
                return ret;
            };
            EventEmitter.prototype.listenerCount = function(type) {
                if (this._events) {
                    var evlistener = this._events[type];
                    if (isFunction(evlistener)) return 1; else if (evlistener) return evlistener.length;
                }
                return 0;
            };
            EventEmitter.listenerCount = function(emitter, type) {
                return emitter.listenerCount(type);
            };
            function isFunction(arg) {
                return typeof arg === "function";
            }
            function isNumber(arg) {
                return typeof arg === "number";
            }
            function isObject(arg) {
                return typeof arg === "object" && arg !== null;
            }
            function isUndefined(arg) {
                return arg === void 0;
            }
        }, {} ],
        6: [ function(require, module, exports) {
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
        7: [ function(require, module, exports) {
            module.exports = function(obj) {
                return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
            };
            function isBuffer(obj) {
                return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
            }
            function isSlowBuffer(obj) {
                return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
            }
        }, {} ],
        8: [ function(require, module, exports) {
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
        9: [ function(require, module, exports) {
            module.exports = require("./lib/_stream_duplex.js");
        }, {
            "./lib/_stream_duplex.js": 10
        } ],
        10: [ function(require, module, exports) {
            "use strict";
            var processNextTick = require("process-nextick-args");
            var objectKeys = Object.keys || function(obj) {
                var keys = [];
                for (var key in obj) {
                    keys.push(key);
                }
                return keys;
            };
            module.exports = Duplex;
            var util = require("core-util-is");
            util.inherits = require("inherits");
            var Readable = require("./_stream_readable");
            var Writable = require("./_stream_writable");
            util.inherits(Duplex, Readable);
            var keys = objectKeys(Writable.prototype);
            for (var v = 0; v < keys.length; v++) {
                var method = keys[v];
                if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
            }
            function Duplex(options) {
                if (!(this instanceof Duplex)) return new Duplex(options);
                Readable.call(this, options);
                Writable.call(this, options);
                if (options && options.readable === false) this.readable = false;
                if (options && options.writable === false) this.writable = false;
                this.allowHalfOpen = true;
                if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
                this.once("end", onend);
            }
            function onend() {
                if (this.allowHalfOpen || this._writableState.ended) return;
                processNextTick(onEndNT, this);
            }
            function onEndNT(self) {
                self.end();
            }
            Object.defineProperty(Duplex.prototype, "destroyed", {
                get: function() {
                    if (this._readableState === undefined || this._writableState === undefined) {
                        return false;
                    }
                    return this._readableState.destroyed && this._writableState.destroyed;
                },
                set: function(value) {
                    if (this._readableState === undefined || this._writableState === undefined) {
                        return;
                    }
                    this._readableState.destroyed = value;
                    this._writableState.destroyed = value;
                }
            });
            Duplex.prototype._destroy = function(err, cb) {
                this.push(null);
                this.end();
                processNextTick(cb, err);
            };
            function forEach(xs, f) {
                for (var i = 0, l = xs.length; i < l; i++) {
                    f(xs[i], i);
                }
            }
        }, {
            "./_stream_readable": 12,
            "./_stream_writable": 14,
            "core-util-is": 18,
            inherits: 6,
            "process-nextick-args": 20
        } ],
        11: [ function(require, module, exports) {
            "use strict";
            module.exports = PassThrough;
            var Transform = require("./_stream_transform");
            var util = require("core-util-is");
            util.inherits = require("inherits");
            util.inherits(PassThrough, Transform);
            function PassThrough(options) {
                if (!(this instanceof PassThrough)) return new PassThrough(options);
                Transform.call(this, options);
            }
            PassThrough.prototype._transform = function(chunk, encoding, cb) {
                cb(null, chunk);
            };
        }, {
            "./_stream_transform": 13,
            "core-util-is": 18,
            inherits: 6
        } ],
        12: [ function(require, module, exports) {
            (function(process, global) {
                "use strict";
                var processNextTick = require("process-nextick-args");
                module.exports = Readable;
                var isArray = require("isarray");
                var Duplex;
                Readable.ReadableState = ReadableState;
                var EE = require("events").EventEmitter;
                var EElistenerCount = function(emitter, type) {
                    return emitter.listeners(type).length;
                };
                var Stream = require("./internal/streams/stream");
                var Buffer = require("safe-buffer").Buffer;
                var OurUint8Array = global.Uint8Array || function() {};
                function _uint8ArrayToBuffer(chunk) {
                    return Buffer.from(chunk);
                }
                function _isUint8Array(obj) {
                    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
                }
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var debugUtil = require("util");
                var debug = void 0;
                if (debugUtil && debugUtil.debuglog) {
                    debug = debugUtil.debuglog("stream");
                } else {
                    debug = function() {};
                }
                var BufferList = require("./internal/streams/BufferList");
                var destroyImpl = require("./internal/streams/destroy");
                var StringDecoder;
                util.inherits(Readable, Stream);
                var kProxyEvents = [ "error", "close", "destroy", "pause", "resume" ];
                function prependListener(emitter, event, fn) {
                    if (typeof emitter.prependListener === "function") {
                        return emitter.prependListener(event, fn);
                    } else {
                        if (!emitter._events || !emitter._events[event]) emitter.on(event, fn); else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn); else emitter._events[event] = [ fn, emitter._events[event] ];
                    }
                }
                function ReadableState(options, stream) {
                    Duplex = Duplex || require("./_stream_duplex");
                    options = options || {};
                    this.objectMode = !!options.objectMode;
                    if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
                    var hwm = options.highWaterMark;
                    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                    this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                    this.highWaterMark = Math.floor(this.highWaterMark);
                    this.buffer = new BufferList();
                    this.length = 0;
                    this.pipes = null;
                    this.pipesCount = 0;
                    this.flowing = null;
                    this.ended = false;
                    this.endEmitted = false;
                    this.reading = false;
                    this.sync = true;
                    this.needReadable = false;
                    this.emittedReadable = false;
                    this.readableListening = false;
                    this.resumeScheduled = false;
                    this.destroyed = false;
                    this.defaultEncoding = options.defaultEncoding || "utf8";
                    this.awaitDrain = 0;
                    this.readingMore = false;
                    this.decoder = null;
                    this.encoding = null;
                    if (options.encoding) {
                        if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                        this.decoder = new StringDecoder(options.encoding);
                        this.encoding = options.encoding;
                    }
                }
                function Readable(options) {
                    Duplex = Duplex || require("./_stream_duplex");
                    if (!(this instanceof Readable)) return new Readable(options);
                    this._readableState = new ReadableState(options, this);
                    this.readable = true;
                    if (options) {
                        if (typeof options.read === "function") this._read = options.read;
                        if (typeof options.destroy === "function") this._destroy = options.destroy;
                    }
                    Stream.call(this);
                }
                Object.defineProperty(Readable.prototype, "destroyed", {
                    get: function() {
                        if (this._readableState === undefined) {
                            return false;
                        }
                        return this._readableState.destroyed;
                    },
                    set: function(value) {
                        if (!this._readableState) {
                            return;
                        }
                        this._readableState.destroyed = value;
                    }
                });
                Readable.prototype.destroy = destroyImpl.destroy;
                Readable.prototype._undestroy = destroyImpl.undestroy;
                Readable.prototype._destroy = function(err, cb) {
                    this.push(null);
                    cb(err);
                };
                Readable.prototype.push = function(chunk, encoding) {
                    var state = this._readableState;
                    var skipChunkCheck;
                    if (!state.objectMode) {
                        if (typeof chunk === "string") {
                            encoding = encoding || state.defaultEncoding;
                            if (encoding !== state.encoding) {
                                chunk = Buffer.from(chunk, encoding);
                                encoding = "";
                            }
                            skipChunkCheck = true;
                        }
                    } else {
                        skipChunkCheck = true;
                    }
                    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
                };
                Readable.prototype.unshift = function(chunk) {
                    return readableAddChunk(this, chunk, null, true, false);
                };
                function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
                    var state = stream._readableState;
                    if (chunk === null) {
                        state.reading = false;
                        onEofChunk(stream, state);
                    } else {
                        var er;
                        if (!skipChunkCheck) er = chunkInvalid(state, chunk);
                        if (er) {
                            stream.emit("error", er);
                        } else if (state.objectMode || chunk && chunk.length > 0) {
                            if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
                                chunk = _uint8ArrayToBuffer(chunk);
                            }
                            if (addToFront) {
                                if (state.endEmitted) stream.emit("error", new Error("stream.unshift() after end event")); else addChunk(stream, state, chunk, true);
                            } else if (state.ended) {
                                stream.emit("error", new Error("stream.push() after EOF"));
                            } else {
                                state.reading = false;
                                if (state.decoder && !encoding) {
                                    chunk = state.decoder.write(chunk);
                                    if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false); else maybeReadMore(stream, state);
                                } else {
                                    addChunk(stream, state, chunk, false);
                                }
                            }
                        } else if (!addToFront) {
                            state.reading = false;
                        }
                    }
                    return needMoreData(state);
                }
                function addChunk(stream, state, chunk, addToFront) {
                    if (state.flowing && state.length === 0 && !state.sync) {
                        stream.emit("data", chunk);
                        stream.read(0);
                    } else {
                        state.length += state.objectMode ? 1 : chunk.length;
                        if (addToFront) state.buffer.unshift(chunk); else state.buffer.push(chunk);
                        if (state.needReadable) emitReadable(stream);
                    }
                    maybeReadMore(stream, state);
                }
                function chunkInvalid(state, chunk) {
                    var er;
                    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== undefined && !state.objectMode) {
                        er = new TypeError("Invalid non-string/buffer chunk");
                    }
                    return er;
                }
                function needMoreData(state) {
                    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
                }
                Readable.prototype.isPaused = function() {
                    return this._readableState.flowing === false;
                };
                Readable.prototype.setEncoding = function(enc) {
                    if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                    this._readableState.decoder = new StringDecoder(enc);
                    this._readableState.encoding = enc;
                    return this;
                };
                var MAX_HWM = 8388608;
                function computeNewHighWaterMark(n) {
                    if (n >= MAX_HWM) {
                        n = MAX_HWM;
                    } else {
                        n--;
                        n |= n >>> 1;
                        n |= n >>> 2;
                        n |= n >>> 4;
                        n |= n >>> 8;
                        n |= n >>> 16;
                        n++;
                    }
                    return n;
                }
                function howMuchToRead(n, state) {
                    if (n <= 0 || state.length === 0 && state.ended) return 0;
                    if (state.objectMode) return 1;
                    if (n !== n) {
                        if (state.flowing && state.length) return state.buffer.head.data.length; else return state.length;
                    }
                    if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
                    if (n <= state.length) return n;
                    if (!state.ended) {
                        state.needReadable = true;
                        return 0;
                    }
                    return state.length;
                }
                Readable.prototype.read = function(n) {
                    debug("read", n);
                    n = parseInt(n, 10);
                    var state = this._readableState;
                    var nOrig = n;
                    if (n !== 0) state.emittedReadable = false;
                    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                        debug("read: emitReadable", state.length, state.ended);
                        if (state.length === 0 && state.ended) endReadable(this); else emitReadable(this);
                        return null;
                    }
                    n = howMuchToRead(n, state);
                    if (n === 0 && state.ended) {
                        if (state.length === 0) endReadable(this);
                        return null;
                    }
                    var doRead = state.needReadable;
                    debug("need readable", doRead);
                    if (state.length === 0 || state.length - n < state.highWaterMark) {
                        doRead = true;
                        debug("length less than watermark", doRead);
                    }
                    if (state.ended || state.reading) {
                        doRead = false;
                        debug("reading or ended", doRead);
                    } else if (doRead) {
                        debug("do read");
                        state.reading = true;
                        state.sync = true;
                        if (state.length === 0) state.needReadable = true;
                        this._read(state.highWaterMark);
                        state.sync = false;
                        if (!state.reading) n = howMuchToRead(nOrig, state);
                    }
                    var ret;
                    if (n > 0) ret = fromList(n, state); else ret = null;
                    if (ret === null) {
                        state.needReadable = true;
                        n = 0;
                    } else {
                        state.length -= n;
                    }
                    if (state.length === 0) {
                        if (!state.ended) state.needReadable = true;
                        if (nOrig !== n && state.ended) endReadable(this);
                    }
                    if (ret !== null) this.emit("data", ret);
                    return ret;
                };
                function onEofChunk(stream, state) {
                    if (state.ended) return;
                    if (state.decoder) {
                        var chunk = state.decoder.end();
                        if (chunk && chunk.length) {
                            state.buffer.push(chunk);
                            state.length += state.objectMode ? 1 : chunk.length;
                        }
                    }
                    state.ended = true;
                    emitReadable(stream);
                }
                function emitReadable(stream) {
                    var state = stream._readableState;
                    state.needReadable = false;
                    if (!state.emittedReadable) {
                        debug("emitReadable", state.flowing);
                        state.emittedReadable = true;
                        if (state.sync) processNextTick(emitReadable_, stream); else emitReadable_(stream);
                    }
                }
                function emitReadable_(stream) {
                    debug("emit readable");
                    stream.emit("readable");
                    flow(stream);
                }
                function maybeReadMore(stream, state) {
                    if (!state.readingMore) {
                        state.readingMore = true;
                        processNextTick(maybeReadMore_, stream, state);
                    }
                }
                function maybeReadMore_(stream, state) {
                    var len = state.length;
                    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                        debug("maybeReadMore read 0");
                        stream.read(0);
                        if (len === state.length) break; else len = state.length;
                    }
                    state.readingMore = false;
                }
                Readable.prototype._read = function(n) {
                    this.emit("error", new Error("_read() is not implemented"));
                };
                Readable.prototype.pipe = function(dest, pipeOpts) {
                    var src = this;
                    var state = this._readableState;
                    switch (state.pipesCount) {
                      case 0:
                        state.pipes = dest;
                        break;

                      case 1:
                        state.pipes = [ state.pipes, dest ];
                        break;

                      default:
                        state.pipes.push(dest);
                        break;
                    }
                    state.pipesCount += 1;
                    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
                    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
                    var endFn = doEnd ? onend : unpipe;
                    if (state.endEmitted) processNextTick(endFn); else src.once("end", endFn);
                    dest.on("unpipe", onunpipe);
                    function onunpipe(readable, unpipeInfo) {
                        debug("onunpipe");
                        if (readable === src) {
                            if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
                                unpipeInfo.hasUnpiped = true;
                                cleanup();
                            }
                        }
                    }
                    function onend() {
                        debug("onend");
                        dest.end();
                    }
                    var ondrain = pipeOnDrain(src);
                    dest.on("drain", ondrain);
                    var cleanedUp = false;
                    function cleanup() {
                        debug("cleanup");
                        dest.removeListener("close", onclose);
                        dest.removeListener("finish", onfinish);
                        dest.removeListener("drain", ondrain);
                        dest.removeListener("error", onerror);
                        dest.removeListener("unpipe", onunpipe);
                        src.removeListener("end", onend);
                        src.removeListener("end", unpipe);
                        src.removeListener("data", ondata);
                        cleanedUp = true;
                        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
                    }
                    var increasedAwaitDrain = false;
                    src.on("data", ondata);
                    function ondata(chunk) {
                        debug("ondata");
                        increasedAwaitDrain = false;
                        var ret = dest.write(chunk);
                        if (false === ret && !increasedAwaitDrain) {
                            if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                                debug("false write response, pause", src._readableState.awaitDrain);
                                src._readableState.awaitDrain++;
                                increasedAwaitDrain = true;
                            }
                            src.pause();
                        }
                    }
                    function onerror(er) {
                        debug("onerror", er);
                        unpipe();
                        dest.removeListener("error", onerror);
                        if (EElistenerCount(dest, "error") === 0) dest.emit("error", er);
                    }
                    prependListener(dest, "error", onerror);
                    function onclose() {
                        dest.removeListener("finish", onfinish);
                        unpipe();
                    }
                    dest.once("close", onclose);
                    function onfinish() {
                        debug("onfinish");
                        dest.removeListener("close", onclose);
                        unpipe();
                    }
                    dest.once("finish", onfinish);
                    function unpipe() {
                        debug("unpipe");
                        src.unpipe(dest);
                    }
                    dest.emit("pipe", src);
                    if (!state.flowing) {
                        debug("pipe resume");
                        src.resume();
                    }
                    return dest;
                };
                function pipeOnDrain(src) {
                    return function() {
                        var state = src._readableState;
                        debug("pipeOnDrain", state.awaitDrain);
                        if (state.awaitDrain) state.awaitDrain--;
                        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
                            state.flowing = true;
                            flow(src);
                        }
                    };
                }
                Readable.prototype.unpipe = function(dest) {
                    var state = this._readableState;
                    var unpipeInfo = {
                        hasUnpiped: false
                    };
                    if (state.pipesCount === 0) return this;
                    if (state.pipesCount === 1) {
                        if (dest && dest !== state.pipes) return this;
                        if (!dest) dest = state.pipes;
                        state.pipes = null;
                        state.pipesCount = 0;
                        state.flowing = false;
                        if (dest) dest.emit("unpipe", this, unpipeInfo);
                        return this;
                    }
                    if (!dest) {
                        var dests = state.pipes;
                        var len = state.pipesCount;
                        state.pipes = null;
                        state.pipesCount = 0;
                        state.flowing = false;
                        for (var i = 0; i < len; i++) {
                            dests[i].emit("unpipe", this, unpipeInfo);
                        }
                        return this;
                    }
                    var index = indexOf(state.pipes, dest);
                    if (index === -1) return this;
                    state.pipes.splice(index, 1);
                    state.pipesCount -= 1;
                    if (state.pipesCount === 1) state.pipes = state.pipes[0];
                    dest.emit("unpipe", this, unpipeInfo);
                    return this;
                };
                Readable.prototype.on = function(ev, fn) {
                    var res = Stream.prototype.on.call(this, ev, fn);
                    if (ev === "data") {
                        if (this._readableState.flowing !== false) this.resume();
                    } else if (ev === "readable") {
                        var state = this._readableState;
                        if (!state.endEmitted && !state.readableListening) {
                            state.readableListening = state.needReadable = true;
                            state.emittedReadable = false;
                            if (!state.reading) {
                                processNextTick(nReadingNextTick, this);
                            } else if (state.length) {
                                emitReadable(this);
                            }
                        }
                    }
                    return res;
                };
                Readable.prototype.addListener = Readable.prototype.on;
                function nReadingNextTick(self) {
                    debug("readable nexttick read 0");
                    self.read(0);
                }
                Readable.prototype.resume = function() {
                    var state = this._readableState;
                    if (!state.flowing) {
                        debug("resume");
                        state.flowing = true;
                        resume(this, state);
                    }
                    return this;
                };
                function resume(stream, state) {
                    if (!state.resumeScheduled) {
                        state.resumeScheduled = true;
                        processNextTick(resume_, stream, state);
                    }
                }
                function resume_(stream, state) {
                    if (!state.reading) {
                        debug("resume read 0");
                        stream.read(0);
                    }
                    state.resumeScheduled = false;
                    state.awaitDrain = 0;
                    stream.emit("resume");
                    flow(stream);
                    if (state.flowing && !state.reading) stream.read(0);
                }
                Readable.prototype.pause = function() {
                    debug("call pause flowing=%j", this._readableState.flowing);
                    if (false !== this._readableState.flowing) {
                        debug("pause");
                        this._readableState.flowing = false;
                        this.emit("pause");
                    }
                    return this;
                };
                function flow(stream) {
                    var state = stream._readableState;
                    debug("flow", state.flowing);
                    while (state.flowing && stream.read() !== null) {}
                }
                Readable.prototype.wrap = function(stream) {
                    var state = this._readableState;
                    var paused = false;
                    var self = this;
                    stream.on("end", function() {
                        debug("wrapped end");
                        if (state.decoder && !state.ended) {
                            var chunk = state.decoder.end();
                            if (chunk && chunk.length) self.push(chunk);
                        }
                        self.push(null);
                    });
                    stream.on("data", function(chunk) {
                        debug("wrapped data");
                        if (state.decoder) chunk = state.decoder.write(chunk);
                        if (state.objectMode && (chunk === null || chunk === undefined)) return; else if (!state.objectMode && (!chunk || !chunk.length)) return;
                        var ret = self.push(chunk);
                        if (!ret) {
                            paused = true;
                            stream.pause();
                        }
                    });
                    for (var i in stream) {
                        if (this[i] === undefined && typeof stream[i] === "function") {
                            this[i] = function(method) {
                                return function() {
                                    return stream[method].apply(stream, arguments);
                                };
                            }(i);
                        }
                    }
                    for (var n = 0; n < kProxyEvents.length; n++) {
                        stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
                    }
                    self._read = function(n) {
                        debug("wrapped _read", n);
                        if (paused) {
                            paused = false;
                            stream.resume();
                        }
                    };
                    return self;
                };
                Readable._fromList = fromList;
                function fromList(n, state) {
                    if (state.length === 0) return null;
                    var ret;
                    if (state.objectMode) ret = state.buffer.shift(); else if (!n || n >= state.length) {
                        if (state.decoder) ret = state.buffer.join(""); else if (state.buffer.length === 1) ret = state.buffer.head.data; else ret = state.buffer.concat(state.length);
                        state.buffer.clear();
                    } else {
                        ret = fromListPartial(n, state.buffer, state.decoder);
                    }
                    return ret;
                }
                function fromListPartial(n, list, hasStrings) {
                    var ret;
                    if (n < list.head.data.length) {
                        ret = list.head.data.slice(0, n);
                        list.head.data = list.head.data.slice(n);
                    } else if (n === list.head.data.length) {
                        ret = list.shift();
                    } else {
                        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
                    }
                    return ret;
                }
                function copyFromBufferString(n, list) {
                    var p = list.head;
                    var c = 1;
                    var ret = p.data;
                    n -= ret.length;
                    while (p = p.next) {
                        var str = p.data;
                        var nb = n > str.length ? str.length : n;
                        if (nb === str.length) ret += str; else ret += str.slice(0, n);
                        n -= nb;
                        if (n === 0) {
                            if (nb === str.length) {
                                ++c;
                                if (p.next) list.head = p.next; else list.head = list.tail = null;
                            } else {
                                list.head = p;
                                p.data = str.slice(nb);
                            }
                            break;
                        }
                        ++c;
                    }
                    list.length -= c;
                    return ret;
                }
                function copyFromBuffer(n, list) {
                    var ret = Buffer.allocUnsafe(n);
                    var p = list.head;
                    var c = 1;
                    p.data.copy(ret);
                    n -= p.data.length;
                    while (p = p.next) {
                        var buf = p.data;
                        var nb = n > buf.length ? buf.length : n;
                        buf.copy(ret, ret.length - n, 0, nb);
                        n -= nb;
                        if (n === 0) {
                            if (nb === buf.length) {
                                ++c;
                                if (p.next) list.head = p.next; else list.head = list.tail = null;
                            } else {
                                list.head = p;
                                p.data = buf.slice(nb);
                            }
                            break;
                        }
                        ++c;
                    }
                    list.length -= c;
                    return ret;
                }
                function endReadable(stream) {
                    var state = stream._readableState;
                    if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
                    if (!state.endEmitted) {
                        state.ended = true;
                        processNextTick(endReadableNT, state, stream);
                    }
                }
                function endReadableNT(state, stream) {
                    if (!state.endEmitted && state.length === 0) {
                        state.endEmitted = true;
                        stream.readable = false;
                        stream.emit("end");
                    }
                }
                function forEach(xs, f) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        f(xs[i], i);
                    }
                }
                function indexOf(xs, x) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        if (xs[i] === x) return i;
                    }
                    return -1;
                }
            }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {
            "./_stream_duplex": 10,
            "./internal/streams/BufferList": 15,
            "./internal/streams/destroy": 16,
            "./internal/streams/stream": 17,
            _process: 8,
            "core-util-is": 18,
            events: 5,
            inherits: 6,
            isarray: 19,
            "process-nextick-args": 20,
            "safe-buffer": 21,
            "string_decoder/": 28,
            util: 1
        } ],
        13: [ function(require, module, exports) {
            "use strict";
            module.exports = Transform;
            var Duplex = require("./_stream_duplex");
            var util = require("core-util-is");
            util.inherits = require("inherits");
            util.inherits(Transform, Duplex);
            function TransformState(stream) {
                this.afterTransform = function(er, data) {
                    return afterTransform(stream, er, data);
                };
                this.needTransform = false;
                this.transforming = false;
                this.writecb = null;
                this.writechunk = null;
                this.writeencoding = null;
            }
            function afterTransform(stream, er, data) {
                var ts = stream._transformState;
                ts.transforming = false;
                var cb = ts.writecb;
                if (!cb) {
                    return stream.emit("error", new Error("write callback called multiple times"));
                }
                ts.writechunk = null;
                ts.writecb = null;
                if (data !== null && data !== undefined) stream.push(data);
                cb(er);
                var rs = stream._readableState;
                rs.reading = false;
                if (rs.needReadable || rs.length < rs.highWaterMark) {
                    stream._read(rs.highWaterMark);
                }
            }
            function Transform(options) {
                if (!(this instanceof Transform)) return new Transform(options);
                Duplex.call(this, options);
                this._transformState = new TransformState(this);
                var stream = this;
                this._readableState.needReadable = true;
                this._readableState.sync = false;
                if (options) {
                    if (typeof options.transform === "function") this._transform = options.transform;
                    if (typeof options.flush === "function") this._flush = options.flush;
                }
                this.once("prefinish", function() {
                    if (typeof this._flush === "function") this._flush(function(er, data) {
                        done(stream, er, data);
                    }); else done(stream);
                });
            }
            Transform.prototype.push = function(chunk, encoding) {
                this._transformState.needTransform = false;
                return Duplex.prototype.push.call(this, chunk, encoding);
            };
            Transform.prototype._transform = function(chunk, encoding, cb) {
                throw new Error("_transform() is not implemented");
            };
            Transform.prototype._write = function(chunk, encoding, cb) {
                var ts = this._transformState;
                ts.writecb = cb;
                ts.writechunk = chunk;
                ts.writeencoding = encoding;
                if (!ts.transforming) {
                    var rs = this._readableState;
                    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
                }
            };
            Transform.prototype._read = function(n) {
                var ts = this._transformState;
                if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
                    ts.transforming = true;
                    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
                } else {
                    ts.needTransform = true;
                }
            };
            Transform.prototype._destroy = function(err, cb) {
                var _this = this;
                Duplex.prototype._destroy.call(this, err, function(err2) {
                    cb(err2);
                    _this.emit("close");
                });
            };
            function done(stream, er, data) {
                if (er) return stream.emit("error", er);
                if (data !== null && data !== undefined) stream.push(data);
                var ws = stream._writableState;
                var ts = stream._transformState;
                if (ws.length) throw new Error("Calling transform done when ws.length != 0");
                if (ts.transforming) throw new Error("Calling transform done when still transforming");
                return stream.push(null);
            }
        }, {
            "./_stream_duplex": 10,
            "core-util-is": 18,
            inherits: 6
        } ],
        14: [ function(require, module, exports) {
            (function(process, global) {
                "use strict";
                var processNextTick = require("process-nextick-args");
                module.exports = Writable;
                function WriteReq(chunk, encoding, cb) {
                    this.chunk = chunk;
                    this.encoding = encoding;
                    this.callback = cb;
                    this.next = null;
                }
                function CorkedRequest(state) {
                    var _this = this;
                    this.next = null;
                    this.entry = null;
                    this.finish = function() {
                        onCorkedFinish(_this, state);
                    };
                }
                var asyncWrite = !process.browser && [ "v0.10", "v0.9." ].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
                var Duplex;
                Writable.WritableState = WritableState;
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var internalUtil = {
                    deprecate: require("util-deprecate")
                };
                var Stream = require("./internal/streams/stream");
                var Buffer = require("safe-buffer").Buffer;
                var OurUint8Array = global.Uint8Array || function() {};
                function _uint8ArrayToBuffer(chunk) {
                    return Buffer.from(chunk);
                }
                function _isUint8Array(obj) {
                    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
                }
                var destroyImpl = require("./internal/streams/destroy");
                util.inherits(Writable, Stream);
                function nop() {}
                function WritableState(options, stream) {
                    Duplex = Duplex || require("./_stream_duplex");
                    options = options || {};
                    this.objectMode = !!options.objectMode;
                    if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
                    var hwm = options.highWaterMark;
                    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                    this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                    this.highWaterMark = Math.floor(this.highWaterMark);
                    this.finalCalled = false;
                    this.needDrain = false;
                    this.ending = false;
                    this.ended = false;
                    this.finished = false;
                    this.destroyed = false;
                    var noDecode = options.decodeStrings === false;
                    this.decodeStrings = !noDecode;
                    this.defaultEncoding = options.defaultEncoding || "utf8";
                    this.length = 0;
                    this.writing = false;
                    this.corked = 0;
                    this.sync = true;
                    this.bufferProcessing = false;
                    this.onwrite = function(er) {
                        onwrite(stream, er);
                    };
                    this.writecb = null;
                    this.writelen = 0;
                    this.bufferedRequest = null;
                    this.lastBufferedRequest = null;
                    this.pendingcb = 0;
                    this.prefinished = false;
                    this.errorEmitted = false;
                    this.bufferedRequestCount = 0;
                    this.corkedRequestsFree = new CorkedRequest(this);
                }
                WritableState.prototype.getBuffer = function getBuffer() {
                    var current = this.bufferedRequest;
                    var out = [];
                    while (current) {
                        out.push(current);
                        current = current.next;
                    }
                    return out;
                };
                (function() {
                    try {
                        Object.defineProperty(WritableState.prototype, "buffer", {
                            get: internalUtil.deprecate(function() {
                                return this.getBuffer();
                            }, "_writableState.buffer is deprecated. Use _writableState.getBuffer " + "instead.", "DEP0003")
                        });
                    } catch (_) {}
                })();
                var realHasInstance;
                if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
                    realHasInstance = Function.prototype[Symbol.hasInstance];
                    Object.defineProperty(Writable, Symbol.hasInstance, {
                        value: function(object) {
                            if (realHasInstance.call(this, object)) return true;
                            return object && object._writableState instanceof WritableState;
                        }
                    });
                } else {
                    realHasInstance = function(object) {
                        return object instanceof this;
                    };
                }
                function Writable(options) {
                    Duplex = Duplex || require("./_stream_duplex");
                    if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
                        return new Writable(options);
                    }
                    this._writableState = new WritableState(options, this);
                    this.writable = true;
                    if (options) {
                        if (typeof options.write === "function") this._write = options.write;
                        if (typeof options.writev === "function") this._writev = options.writev;
                        if (typeof options.destroy === "function") this._destroy = options.destroy;
                        if (typeof options.final === "function") this._final = options.final;
                    }
                    Stream.call(this);
                }
                Writable.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe, not readable"));
                };
                function writeAfterEnd(stream, cb) {
                    var er = new Error("write after end");
                    stream.emit("error", er);
                    processNextTick(cb, er);
                }
                function validChunk(stream, state, chunk, cb) {
                    var valid = true;
                    var er = false;
                    if (chunk === null) {
                        er = new TypeError("May not write null values to stream");
                    } else if (typeof chunk !== "string" && chunk !== undefined && !state.objectMode) {
                        er = new TypeError("Invalid non-string/buffer chunk");
                    }
                    if (er) {
                        stream.emit("error", er);
                        processNextTick(cb, er);
                        valid = false;
                    }
                    return valid;
                }
                Writable.prototype.write = function(chunk, encoding, cb) {
                    var state = this._writableState;
                    var ret = false;
                    var isBuf = _isUint8Array(chunk) && !state.objectMode;
                    if (isBuf && !Buffer.isBuffer(chunk)) {
                        chunk = _uint8ArrayToBuffer(chunk);
                    }
                    if (typeof encoding === "function") {
                        cb = encoding;
                        encoding = null;
                    }
                    if (isBuf) encoding = "buffer"; else if (!encoding) encoding = state.defaultEncoding;
                    if (typeof cb !== "function") cb = nop;
                    if (state.ended) writeAfterEnd(this, cb); else if (isBuf || validChunk(this, state, chunk, cb)) {
                        state.pendingcb++;
                        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
                    }
                    return ret;
                };
                Writable.prototype.cork = function() {
                    var state = this._writableState;
                    state.corked++;
                };
                Writable.prototype.uncork = function() {
                    var state = this._writableState;
                    if (state.corked) {
                        state.corked--;
                        if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
                    }
                };
                Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
                    if (typeof encoding === "string") encoding = encoding.toLowerCase();
                    if (!([ "hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw" ].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
                    this._writableState.defaultEncoding = encoding;
                    return this;
                };
                function decodeChunk(state, chunk, encoding) {
                    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
                        chunk = Buffer.from(chunk, encoding);
                    }
                    return chunk;
                }
                function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
                    if (!isBuf) {
                        var newChunk = decodeChunk(state, chunk, encoding);
                        if (chunk !== newChunk) {
                            isBuf = true;
                            encoding = "buffer";
                            chunk = newChunk;
                        }
                    }
                    var len = state.objectMode ? 1 : chunk.length;
                    state.length += len;
                    var ret = state.length < state.highWaterMark;
                    if (!ret) state.needDrain = true;
                    if (state.writing || state.corked) {
                        var last = state.lastBufferedRequest;
                        state.lastBufferedRequest = {
                            chunk: chunk,
                            encoding: encoding,
                            isBuf: isBuf,
                            callback: cb,
                            next: null
                        };
                        if (last) {
                            last.next = state.lastBufferedRequest;
                        } else {
                            state.bufferedRequest = state.lastBufferedRequest;
                        }
                        state.bufferedRequestCount += 1;
                    } else {
                        doWrite(stream, state, false, len, chunk, encoding, cb);
                    }
                    return ret;
                }
                function doWrite(stream, state, writev, len, chunk, encoding, cb) {
                    state.writelen = len;
                    state.writecb = cb;
                    state.writing = true;
                    state.sync = true;
                    if (writev) stream._writev(chunk, state.onwrite); else stream._write(chunk, encoding, state.onwrite);
                    state.sync = false;
                }
                function onwriteError(stream, state, sync, er, cb) {
                    --state.pendingcb;
                    if (sync) {
                        processNextTick(cb, er);
                        processNextTick(finishMaybe, stream, state);
                        stream._writableState.errorEmitted = true;
                        stream.emit("error", er);
                    } else {
                        cb(er);
                        stream._writableState.errorEmitted = true;
                        stream.emit("error", er);
                        finishMaybe(stream, state);
                    }
                }
                function onwriteStateUpdate(state) {
                    state.writing = false;
                    state.writecb = null;
                    state.length -= state.writelen;
                    state.writelen = 0;
                }
                function onwrite(stream, er) {
                    var state = stream._writableState;
                    var sync = state.sync;
                    var cb = state.writecb;
                    onwriteStateUpdate(state);
                    if (er) onwriteError(stream, state, sync, er, cb); else {
                        var finished = needFinish(state);
                        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
                            clearBuffer(stream, state);
                        }
                        if (sync) {
                            asyncWrite(afterWrite, stream, state, finished, cb);
                        } else {
                            afterWrite(stream, state, finished, cb);
                        }
                    }
                }
                function afterWrite(stream, state, finished, cb) {
                    if (!finished) onwriteDrain(stream, state);
                    state.pendingcb--;
                    cb();
                    finishMaybe(stream, state);
                }
                function onwriteDrain(stream, state) {
                    if (state.length === 0 && state.needDrain) {
                        state.needDrain = false;
                        stream.emit("drain");
                    }
                }
                function clearBuffer(stream, state) {
                    state.bufferProcessing = true;
                    var entry = state.bufferedRequest;
                    if (stream._writev && entry && entry.next) {
                        var l = state.bufferedRequestCount;
                        var buffer = new Array(l);
                        var holder = state.corkedRequestsFree;
                        holder.entry = entry;
                        var count = 0;
                        var allBuffers = true;
                        while (entry) {
                            buffer[count] = entry;
                            if (!entry.isBuf) allBuffers = false;
                            entry = entry.next;
                            count += 1;
                        }
                        buffer.allBuffers = allBuffers;
                        doWrite(stream, state, true, state.length, buffer, "", holder.finish);
                        state.pendingcb++;
                        state.lastBufferedRequest = null;
                        if (holder.next) {
                            state.corkedRequestsFree = holder.next;
                            holder.next = null;
                        } else {
                            state.corkedRequestsFree = new CorkedRequest(state);
                        }
                    } else {
                        while (entry) {
                            var chunk = entry.chunk;
                            var encoding = entry.encoding;
                            var cb = entry.callback;
                            var len = state.objectMode ? 1 : chunk.length;
                            doWrite(stream, state, false, len, chunk, encoding, cb);
                            entry = entry.next;
                            if (state.writing) {
                                break;
                            }
                        }
                        if (entry === null) state.lastBufferedRequest = null;
                    }
                    state.bufferedRequestCount = 0;
                    state.bufferedRequest = entry;
                    state.bufferProcessing = false;
                }
                Writable.prototype._write = function(chunk, encoding, cb) {
                    cb(new Error("_write() is not implemented"));
                };
                Writable.prototype._writev = null;
                Writable.prototype.end = function(chunk, encoding, cb) {
                    var state = this._writableState;
                    if (typeof chunk === "function") {
                        cb = chunk;
                        chunk = null;
                        encoding = null;
                    } else if (typeof encoding === "function") {
                        cb = encoding;
                        encoding = null;
                    }
                    if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);
                    if (state.corked) {
                        state.corked = 1;
                        this.uncork();
                    }
                    if (!state.ending && !state.finished) endWritable(this, state, cb);
                };
                function needFinish(state) {
                    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
                }
                function callFinal(stream, state) {
                    stream._final(function(err) {
                        state.pendingcb--;
                        if (err) {
                            stream.emit("error", err);
                        }
                        state.prefinished = true;
                        stream.emit("prefinish");
                        finishMaybe(stream, state);
                    });
                }
                function prefinish(stream, state) {
                    if (!state.prefinished && !state.finalCalled) {
                        if (typeof stream._final === "function") {
                            state.pendingcb++;
                            state.finalCalled = true;
                            processNextTick(callFinal, stream, state);
                        } else {
                            state.prefinished = true;
                            stream.emit("prefinish");
                        }
                    }
                }
                function finishMaybe(stream, state) {
                    var need = needFinish(state);
                    if (need) {
                        prefinish(stream, state);
                        if (state.pendingcb === 0) {
                            state.finished = true;
                            stream.emit("finish");
                        }
                    }
                    return need;
                }
                function endWritable(stream, state, cb) {
                    state.ending = true;
                    finishMaybe(stream, state);
                    if (cb) {
                        if (state.finished) processNextTick(cb); else stream.once("finish", cb);
                    }
                    state.ended = true;
                    stream.writable = false;
                }
                function onCorkedFinish(corkReq, state, err) {
                    var entry = corkReq.entry;
                    corkReq.entry = null;
                    while (entry) {
                        var cb = entry.callback;
                        state.pendingcb--;
                        cb(err);
                        entry = entry.next;
                    }
                    if (state.corkedRequestsFree) {
                        state.corkedRequestsFree.next = corkReq;
                    } else {
                        state.corkedRequestsFree = corkReq;
                    }
                }
                Object.defineProperty(Writable.prototype, "destroyed", {
                    get: function() {
                        if (this._writableState === undefined) {
                            return false;
                        }
                        return this._writableState.destroyed;
                    },
                    set: function(value) {
                        if (!this._writableState) {
                            return;
                        }
                        this._writableState.destroyed = value;
                    }
                });
                Writable.prototype.destroy = destroyImpl.destroy;
                Writable.prototype._undestroy = destroyImpl.undestroy;
                Writable.prototype._destroy = function(err, cb) {
                    this.end();
                    cb(err);
                };
            }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {
            "./_stream_duplex": 10,
            "./internal/streams/destroy": 16,
            "./internal/streams/stream": 17,
            _process: 8,
            "core-util-is": 18,
            inherits: 6,
            "process-nextick-args": 20,
            "safe-buffer": 21,
            "util-deprecate": 22
        } ],
        15: [ function(require, module, exports) {
            "use strict";
            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }
            var Buffer = require("safe-buffer").Buffer;
            function copyBuffer(src, target, offset) {
                src.copy(target, offset);
            }
            module.exports = function() {
                function BufferList() {
                    _classCallCheck(this, BufferList);
                    this.head = null;
                    this.tail = null;
                    this.length = 0;
                }
                BufferList.prototype.push = function push(v) {
                    var entry = {
                        data: v,
                        next: null
                    };
                    if (this.length > 0) this.tail.next = entry; else this.head = entry;
                    this.tail = entry;
                    ++this.length;
                };
                BufferList.prototype.unshift = function unshift(v) {
                    var entry = {
                        data: v,
                        next: this.head
                    };
                    if (this.length === 0) this.tail = entry;
                    this.head = entry;
                    ++this.length;
                };
                BufferList.prototype.shift = function shift() {
                    if (this.length === 0) return;
                    var ret = this.head.data;
                    if (this.length === 1) this.head = this.tail = null; else this.head = this.head.next;
                    --this.length;
                    return ret;
                };
                BufferList.prototype.clear = function clear() {
                    this.head = this.tail = null;
                    this.length = 0;
                };
                BufferList.prototype.join = function join(s) {
                    if (this.length === 0) return "";
                    var p = this.head;
                    var ret = "" + p.data;
                    while (p = p.next) {
                        ret += s + p.data;
                    }
                    return ret;
                };
                BufferList.prototype.concat = function concat(n) {
                    if (this.length === 0) return Buffer.alloc(0);
                    if (this.length === 1) return this.head.data;
                    var ret = Buffer.allocUnsafe(n >>> 0);
                    var p = this.head;
                    var i = 0;
                    while (p) {
                        copyBuffer(p.data, ret, i);
                        i += p.data.length;
                        p = p.next;
                    }
                    return ret;
                };
                return BufferList;
            }();
        }, {
            "safe-buffer": 21
        } ],
        16: [ function(require, module, exports) {
            "use strict";
            var processNextTick = require("process-nextick-args");
            function destroy(err, cb) {
                var _this = this;
                var readableDestroyed = this._readableState && this._readableState.destroyed;
                var writableDestroyed = this._writableState && this._writableState.destroyed;
                if (readableDestroyed || writableDestroyed) {
                    if (cb) {
                        cb(err);
                    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
                        processNextTick(emitErrorNT, this, err);
                    }
                    return;
                }
                if (this._readableState) {
                    this._readableState.destroyed = true;
                }
                if (this._writableState) {
                    this._writableState.destroyed = true;
                }
                this._destroy(err || null, function(err) {
                    if (!cb && err) {
                        processNextTick(emitErrorNT, _this, err);
                        if (_this._writableState) {
                            _this._writableState.errorEmitted = true;
                        }
                    } else if (cb) {
                        cb(err);
                    }
                });
            }
            function undestroy() {
                if (this._readableState) {
                    this._readableState.destroyed = false;
                    this._readableState.reading = false;
                    this._readableState.ended = false;
                    this._readableState.endEmitted = false;
                }
                if (this._writableState) {
                    this._writableState.destroyed = false;
                    this._writableState.ended = false;
                    this._writableState.ending = false;
                    this._writableState.finished = false;
                    this._writableState.errorEmitted = false;
                }
            }
            function emitErrorNT(self, err) {
                self.emit("error", err);
            }
            module.exports = {
                destroy: destroy,
                undestroy: undestroy
            };
        }, {
            "process-nextick-args": 20
        } ],
        17: [ function(require, module, exports) {
            module.exports = require("events").EventEmitter;
        }, {
            events: 5
        } ],
        18: [ function(require, module, exports) {
            (function(Buffer) {
                function isArray(arg) {
                    if (Array.isArray) {
                        return Array.isArray(arg);
                    }
                    return objectToString(arg) === "[object Array]";
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
                    return objectToString(re) === "[object RegExp]";
                }
                exports.isRegExp = isRegExp;
                function isObject(arg) {
                    return typeof arg === "object" && arg !== null;
                }
                exports.isObject = isObject;
                function isDate(d) {
                    return objectToString(d) === "[object Date]";
                }
                exports.isDate = isDate;
                function isError(e) {
                    return objectToString(e) === "[object Error]" || e instanceof Error;
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
                exports.isBuffer = Buffer.isBuffer;
                function objectToString(o) {
                    return Object.prototype.toString.call(o);
                }
            }).call(this, {
                isBuffer: require("../../../../insert-module-globals/node_modules/is-buffer/index.js")
            });
        }, {
            "../../../../insert-module-globals/node_modules/is-buffer/index.js": 7
        } ],
        19: [ function(require, module, exports) {
            var toString = {}.toString;
            module.exports = Array.isArray || function(arr) {
                return toString.call(arr) == "[object Array]";
            };
        }, {} ],
        20: [ function(require, module, exports) {
            (function(process) {
                "use strict";
                if (!process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
                    module.exports = nextTick;
                } else {
                    module.exports = process.nextTick;
                }
                function nextTick(fn, arg1, arg2, arg3) {
                    if (typeof fn !== "function") {
                        throw new TypeError('"callback" argument must be a function');
                    }
                    var len = arguments.length;
                    var args, i;
                    switch (len) {
                      case 0:
                      case 1:
                        return process.nextTick(fn);

                      case 2:
                        return process.nextTick(function afterTickOne() {
                            fn.call(null, arg1);
                        });

                      case 3:
                        return process.nextTick(function afterTickTwo() {
                            fn.call(null, arg1, arg2);
                        });

                      case 4:
                        return process.nextTick(function afterTickThree() {
                            fn.call(null, arg1, arg2, arg3);
                        });

                      default:
                        args = new Array(len - 1);
                        i = 0;
                        while (i < args.length) {
                            args[i++] = arguments[i];
                        }
                        return process.nextTick(function afterTick() {
                            fn.apply(null, args);
                        });
                    }
                }
            }).call(this, require("_process"));
        }, {
            _process: 8
        } ],
        21: [ function(require, module, exports) {
            var buffer = require("buffer");
            var Buffer = buffer.Buffer;
            function copyProps(src, dst) {
                for (var key in src) {
                    dst[key] = src[key];
                }
            }
            if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
                module.exports = buffer;
            } else {
                copyProps(buffer, exports);
                exports.Buffer = SafeBuffer;
            }
            function SafeBuffer(arg, encodingOrOffset, length) {
                return Buffer(arg, encodingOrOffset, length);
            }
            copyProps(Buffer, SafeBuffer);
            SafeBuffer.from = function(arg, encodingOrOffset, length) {
                if (typeof arg === "number") {
                    throw new TypeError("Argument must not be a number");
                }
                return Buffer(arg, encodingOrOffset, length);
            };
            SafeBuffer.alloc = function(size, fill, encoding) {
                if (typeof size !== "number") {
                    throw new TypeError("Argument must be a number");
                }
                var buf = Buffer(size);
                if (fill !== undefined) {
                    if (typeof encoding === "string") {
                        buf.fill(fill, encoding);
                    } else {
                        buf.fill(fill);
                    }
                } else {
                    buf.fill(0);
                }
                return buf;
            };
            SafeBuffer.allocUnsafe = function(size) {
                if (typeof size !== "number") {
                    throw new TypeError("Argument must be a number");
                }
                return Buffer(size);
            };
            SafeBuffer.allocUnsafeSlow = function(size) {
                if (typeof size !== "number") {
                    throw new TypeError("Argument must be a number");
                }
                return buffer.SlowBuffer(size);
            };
        }, {
            buffer: 2
        } ],
        22: [ function(require, module, exports) {
            (function(global) {
                module.exports = deprecate;
                function deprecate(fn, msg) {
                    if (config("noDeprecation")) {
                        return fn;
                    }
                    var warned = false;
                    function deprecated() {
                        if (!warned) {
                            if (config("throwDeprecation")) {
                                throw new Error(msg);
                            } else if (config("traceDeprecation")) {
                                console.trace(msg);
                            } else {
                                console.warn(msg);
                            }
                            warned = true;
                        }
                        return fn.apply(this, arguments);
                    }
                    return deprecated;
                }
                function config(name) {
                    try {
                        if (!global.localStorage) return false;
                    } catch (_) {
                        return false;
                    }
                    var val = global.localStorage[name];
                    if (null == val) return false;
                    return String(val).toLowerCase() === "true";
                }
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {} ],
        23: [ function(require, module, exports) {
            module.exports = require("./readable").PassThrough;
        }, {
            "./readable": 24
        } ],
        24: [ function(require, module, exports) {
            exports = module.exports = require("./lib/_stream_readable.js");
            exports.Stream = exports;
            exports.Readable = exports;
            exports.Writable = require("./lib/_stream_writable.js");
            exports.Duplex = require("./lib/_stream_duplex.js");
            exports.Transform = require("./lib/_stream_transform.js");
            exports.PassThrough = require("./lib/_stream_passthrough.js");
        }, {
            "./lib/_stream_duplex.js": 10,
            "./lib/_stream_passthrough.js": 11,
            "./lib/_stream_readable.js": 12,
            "./lib/_stream_transform.js": 13,
            "./lib/_stream_writable.js": 14
        } ],
        25: [ function(require, module, exports) {
            module.exports = require("./readable").Transform;
        }, {
            "./readable": 24
        } ],
        26: [ function(require, module, exports) {
            module.exports = require("./lib/_stream_writable.js");
        }, {
            "./lib/_stream_writable.js": 14
        } ],
        27: [ function(require, module, exports) {
            module.exports = Stream;
            var EE = require("events").EventEmitter;
            var inherits = require("inherits");
            inherits(Stream, EE);
            Stream.Readable = require("readable-stream/readable.js");
            Stream.Writable = require("readable-stream/writable.js");
            Stream.Duplex = require("readable-stream/duplex.js");
            Stream.Transform = require("readable-stream/transform.js");
            Stream.PassThrough = require("readable-stream/passthrough.js");
            Stream.Stream = Stream;
            function Stream() {
                EE.call(this);
            }
            Stream.prototype.pipe = function(dest, options) {
                var source = this;
                function ondata(chunk) {
                    if (dest.writable) {
                        if (false === dest.write(chunk) && source.pause) {
                            source.pause();
                        }
                    }
                }
                source.on("data", ondata);
                function ondrain() {
                    if (source.readable && source.resume) {
                        source.resume();
                    }
                }
                dest.on("drain", ondrain);
                if (!dest._isStdio && (!options || options.end !== false)) {
                    source.on("end", onend);
                    source.on("close", onclose);
                }
                var didOnEnd = false;
                function onend() {
                    if (didOnEnd) return;
                    didOnEnd = true;
                    dest.end();
                }
                function onclose() {
                    if (didOnEnd) return;
                    didOnEnd = true;
                    if (typeof dest.destroy === "function") dest.destroy();
                }
                function onerror(er) {
                    cleanup();
                    if (EE.listenerCount(this, "error") === 0) {
                        throw er;
                    }
                }
                source.on("error", onerror);
                dest.on("error", onerror);
                function cleanup() {
                    source.removeListener("data", ondata);
                    dest.removeListener("drain", ondrain);
                    source.removeListener("end", onend);
                    source.removeListener("close", onclose);
                    source.removeListener("error", onerror);
                    dest.removeListener("error", onerror);
                    source.removeListener("end", cleanup);
                    source.removeListener("close", cleanup);
                    dest.removeListener("close", cleanup);
                }
                source.on("end", cleanup);
                source.on("close", cleanup);
                dest.on("close", cleanup);
                dest.emit("pipe", source);
                return dest;
            };
        }, {
            events: 5,
            inherits: 6,
            "readable-stream/duplex.js": 9,
            "readable-stream/passthrough.js": 23,
            "readable-stream/readable.js": 24,
            "readable-stream/transform.js": 25,
            "readable-stream/writable.js": 26
        } ],
        28: [ function(require, module, exports) {
            "use strict";
            var Buffer = require("safe-buffer").Buffer;
            var isEncoding = Buffer.isEncoding || function(encoding) {
                encoding = "" + encoding;
                switch (encoding && encoding.toLowerCase()) {
                  case "hex":
                  case "utf8":
                  case "utf-8":
                  case "ascii":
                  case "binary":
                  case "base64":
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                  case "raw":
                    return true;

                  default:
                    return false;
                }
            };
            function _normalizeEncoding(enc) {
                if (!enc) return "utf8";
                var retried;
                while (true) {
                    switch (enc) {
                      case "utf8":
                      case "utf-8":
                        return "utf8";

                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return "utf16le";

                      case "latin1":
                      case "binary":
                        return "latin1";

                      case "base64":
                      case "ascii":
                      case "hex":
                        return enc;

                      default:
                        if (retried) return;
                        enc = ("" + enc).toLowerCase();
                        retried = true;
                    }
                }
            }
            function normalizeEncoding(enc) {
                var nenc = _normalizeEncoding(enc);
                if (typeof nenc !== "string" && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
                return nenc || enc;
            }
            exports.StringDecoder = StringDecoder;
            function StringDecoder(encoding) {
                this.encoding = normalizeEncoding(encoding);
                var nb;
                switch (this.encoding) {
                  case "utf16le":
                    this.text = utf16Text;
                    this.end = utf16End;
                    nb = 4;
                    break;

                  case "utf8":
                    this.fillLast = utf8FillLast;
                    nb = 4;
                    break;

                  case "base64":
                    this.text = base64Text;
                    this.end = base64End;
                    nb = 3;
                    break;

                  default:
                    this.write = simpleWrite;
                    this.end = simpleEnd;
                    return;
                }
                this.lastNeed = 0;
                this.lastTotal = 0;
                this.lastChar = Buffer.allocUnsafe(nb);
            }
            StringDecoder.prototype.write = function(buf) {
                if (buf.length === 0) return "";
                var r;
                var i;
                if (this.lastNeed) {
                    r = this.fillLast(buf);
                    if (r === undefined) return "";
                    i = this.lastNeed;
                    this.lastNeed = 0;
                } else {
                    i = 0;
                }
                if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
                return r || "";
            };
            StringDecoder.prototype.end = utf8End;
            StringDecoder.prototype.text = utf8Text;
            StringDecoder.prototype.fillLast = function(buf) {
                if (this.lastNeed <= buf.length) {
                    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
                    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
                }
                buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
                this.lastNeed -= buf.length;
            };
            function utf8CheckByte(byte) {
                if (byte <= 127) return 0; else if (byte >> 5 === 6) return 2; else if (byte >> 4 === 14) return 3; else if (byte >> 3 === 30) return 4;
                return -1;
            }
            function utf8CheckIncomplete(self, buf, i) {
                var j = buf.length - 1;
                if (j < i) return 0;
                var nb = utf8CheckByte(buf[j]);
                if (nb >= 0) {
                    if (nb > 0) self.lastNeed = nb - 1;
                    return nb;
                }
                if (--j < i) return 0;
                nb = utf8CheckByte(buf[j]);
                if (nb >= 0) {
                    if (nb > 0) self.lastNeed = nb - 2;
                    return nb;
                }
                if (--j < i) return 0;
                nb = utf8CheckByte(buf[j]);
                if (nb >= 0) {
                    if (nb > 0) {
                        if (nb === 2) nb = 0; else self.lastNeed = nb - 3;
                    }
                    return nb;
                }
                return 0;
            }
            function utf8CheckExtraBytes(self, buf, p) {
                if ((buf[0] & 192) !== 128) {
                    self.lastNeed = 0;
                    return "�".repeat(p);
                }
                if (self.lastNeed > 1 && buf.length > 1) {
                    if ((buf[1] & 192) !== 128) {
                        self.lastNeed = 1;
                        return "�".repeat(p + 1);
                    }
                    if (self.lastNeed > 2 && buf.length > 2) {
                        if ((buf[2] & 192) !== 128) {
                            self.lastNeed = 2;
                            return "�".repeat(p + 2);
                        }
                    }
                }
            }
            function utf8FillLast(buf) {
                var p = this.lastTotal - this.lastNeed;
                var r = utf8CheckExtraBytes(this, buf, p);
                if (r !== undefined) return r;
                if (this.lastNeed <= buf.length) {
                    buf.copy(this.lastChar, p, 0, this.lastNeed);
                    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
                }
                buf.copy(this.lastChar, p, 0, buf.length);
                this.lastNeed -= buf.length;
            }
            function utf8Text(buf, i) {
                var total = utf8CheckIncomplete(this, buf, i);
                if (!this.lastNeed) return buf.toString("utf8", i);
                this.lastTotal = total;
                var end = buf.length - (total - this.lastNeed);
                buf.copy(this.lastChar, 0, end);
                return buf.toString("utf8", i, end);
            }
            function utf8End(buf) {
                var r = buf && buf.length ? this.write(buf) : "";
                if (this.lastNeed) return r + "�".repeat(this.lastTotal - this.lastNeed);
                return r;
            }
            function utf16Text(buf, i) {
                if ((buf.length - i) % 2 === 0) {
                    var r = buf.toString("utf16le", i);
                    if (r) {
                        var c = r.charCodeAt(r.length - 1);
                        if (c >= 55296 && c <= 56319) {
                            this.lastNeed = 2;
                            this.lastTotal = 4;
                            this.lastChar[0] = buf[buf.length - 2];
                            this.lastChar[1] = buf[buf.length - 1];
                            return r.slice(0, -1);
                        }
                    }
                    return r;
                }
                this.lastNeed = 1;
                this.lastTotal = 2;
                this.lastChar[0] = buf[buf.length - 1];
                return buf.toString("utf16le", i, buf.length - 1);
            }
            function utf16End(buf) {
                var r = buf && buf.length ? this.write(buf) : "";
                if (this.lastNeed) {
                    var end = this.lastTotal - this.lastNeed;
                    return r + this.lastChar.toString("utf16le", 0, end);
                }
                return r;
            }
            function base64Text(buf, i) {
                var n = (buf.length - i) % 3;
                if (n === 0) return buf.toString("base64", i);
                this.lastNeed = 3 - n;
                this.lastTotal = 3;
                if (n === 1) {
                    this.lastChar[0] = buf[buf.length - 1];
                } else {
                    this.lastChar[0] = buf[buf.length - 2];
                    this.lastChar[1] = buf[buf.length - 1];
                }
                return buf.toString("base64", i, buf.length - n);
            }
            function base64End(buf) {
                var r = buf && buf.length ? this.write(buf) : "";
                if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
                return r;
            }
            function simpleWrite(buf) {
                return buf.toString(this.encoding);
            }
            function simpleEnd(buf) {
                return buf && buf.length ? this.write(buf) : "";
            }
        }, {
            "safe-buffer": 29
        } ],
        29: [ function(require, module, exports) {
            arguments[4][21][0].apply(exports, arguments);
        }, {
            buffer: 2,
            dup: 21
        } ],
        30: [ function(require, module, exports) {
            arguments[4][6][0].apply(exports, arguments);
        }, {
            dup: 6
        } ],
        31: [ function(require, module, exports) {
            module.exports = function isBuffer(arg) {
                return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function";
            };
        }, {} ],
        32: [ function(require, module, exports) {
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
            "./support/isBuffer": 31,
            _process: 8,
            inherits: 30
        } ],
        33: [ function(require, module, exports) {
            module.exports = require("./lib");
        }, {
            "./lib": 35
        } ],
        34: [ function(require, module, exports) {
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
            "./modes/strict": 38,
            "./types": 41,
            async: 45,
            raf: 76
        } ],
        35: [ function(require, module, exports) {
            var deserialize = require("./deserialize");
            var serialize = require("./serialize");
            var shell = require("./modes/shell");
            var log = require("./modes/log");
            var es = require("event-stream");
            var JSONStream = require("JSONStream");
            var raf = require("raf");
            var util = require("util");
            var format = util.format;
            var deprecate = util.deprecate;
            function preprocess(text, mode) {
                mode = mode || "strict";
                switch (mode) {
                  case "strict":
                    return text;

                  case "shell":
                    return shell.toStrict(text);

                  case "log":
                    return log.toStrict(text);

                  default:
                    throw new Error(format("unknown mode `%s`. Use `strict` (default), `shell` or `log`.", mode));
                }
            }
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
            module.exports.reviver = require("./reviver");
            module.exports.deflate = deprecate(deserialize, "mongodb-extended-json#deflate: Use deserialize(obj) instead");
            module.exports.inflate = deprecate(serialize, "mongodb-extended-json#inflate: Use serialize(obj) instead");
            module.exports.createStringifyStream = function(op, sep, cl, indent) {
                indent = indent || 0;
                if (op === false) {
                    op = "";
                    sep = "\n";
                    cl = "";
                } else if (op === null || op === undefined) {
                    op = "[\n";
                    sep = "\n,\n";
                    cl = "\n]\n";
                }
                var first = true;
                var anyData = false;
                return es.through(function(data) {
                    anyData = true;
                    var json = module.exports.stringify(data, null, indent);
                    if (first) {
                        first = false;
                        this.emit("data", op + json);
                    } else {
                        this.emit("data", sep + json);
                    }
                }, function() {
                    if (!anyData) {
                        this.emit("data", op);
                    }
                    this.emit("data", cl);
                    this.emit("end");
                });
            };
            module.exports.createParseStream = function(path, map) {
                var parser = JSONStream.parse(path, map);
                var wrapper = es.through(function(data) {
                    raf(function() {
                        parser.write(data);
                    });
                }, function() {
                    this.emit("end");
                });
                var emit = function ejsonParseEmit(data) {
                    wrapper.emit("data", data);
                };
                parser.on("data", function(data) {
                    deserialize.async(data, function(_, parsed) {
                        if (!Array.isArray(parsed)) {
                            emit(parsed);
                        } else {
                            for (var i = 0; i < parsed.length; i++) {
                                emit(parsed[i]);
                            }
                        }
                    });
                }).on("error", function(err) {
                    wrapper.emit("error", err);
                }).on("end", function() {
                    wrapper.emit("end");
                });
                return wrapper;
            };
        }, {
            "./deserialize": 34,
            "./modes/log": 36,
            "./modes/shell": 37,
            "./reviver": 39,
            "./serialize": 40,
            JSONStream: 42,
            "event-stream": 65,
            raf: 76,
            util: 32
        } ],
        36: [ function(require, module, exports) {
            (function(Buffer) {
                var moment = require("moment");
                function toStrictQuotes(str) {
                    return str.replace(/([{,])\s*([^,{\s\'"]+)\s*:/g, '$1 "$2":');
                }
                function toStrictSimple(str) {
                    return str.replace(/Timestamp (\d+)\|(\d+)/g, '{ "$timestamp": { "t": $1, "i": $2 } }').replace(/MinKey/g, '{ "$minKey": 1 }').replace(/MaxKey/g, '{ "$maxKey": 1 }').replace(/ObjectId\('([0-9abcdef]{24})'\)/g, '{ "$oid": "$1" }');
                }
                function toStrictNumberLong(str) {
                    var match = str.match(/\s\d{10,}/g);
                    if (!match) {
                        return str;
                    }
                    match.forEach(function(m) {
                        var n = m.trim();
                        if (+n > 2147483647) {
                            str = str.replace(n, '{ "$numberLong": "' + n + '" }');
                        }
                    });
                    return str;
                }
                function toStrictRegEx(str) {
                    var regex = /([,:]\s*)\/(.+?)\/([gims]{0,4})(\s+)/g;
                    var match;
                    while ((match = regex.exec(str)) !== null) {
                        var m2 = match[2].replace(/"/g, '"');
                        str = str.replace(match[0], match[1] + '{ "$regex": "' + m2 + '", "$options": "' + match[3] + '" }' + match[4]);
                    }
                    return str;
                }
                function toStrictDate(str) {
                    var regex = /new Date\((\d+)\)/g;
                    var match;
                    while ((match = regex.exec(str)) !== null) {
                        var t = moment(parseInt(match[1], 10));
                        str = str.replace(match[0], '{ "$date": "' + t.toISOString() + '" }');
                    }
                    return str;
                }
                function toStrictBinData(str) {
                    var regex = /BinData\((\d+), ([0-9ABCDEF]+)\)/g;
                    var match;
                    while ((match = regex.exec(str)) !== null) {
                        var hex = new Buffer(match[2], "hex").toString("base64");
                        str = str.replace(match[0], '{ "$binary": "' + hex + '", "$type": "' + match[1] + '" }');
                    }
                    return str;
                }
                module.exports.toStrict = function(str) {
                    str = toStrictQuotes(str);
                    str = toStrictSimple(str);
                    str = toStrictNumberLong(str);
                    str = toStrictRegEx(str);
                    str = toStrictDate(str);
                    str = toStrictBinData(str);
                    return str;
                };
            }).call(this, require("buffer").Buffer);
        }, {
            buffer: 2,
            moment: 75
        } ],
        37: [ function(require, module, exports) {
            var format = require("util").format;
            function toStrictQuotes(str) {
                return str.replace(/'/g, '"').replace(/([{,])\s*([^,{\s\'"]+)\s*:/g, '$1 "$2":');
            }
            function toStrictSimple(str) {
                return str.replace(/Timestamp\((\d+), (\d+)\)/g, '{ "$timestamp": { "t": $1, "i": $2 } }').replace(/ObjectId\("([0-9abcdef]{24})"\)/g, '{ "$oid": "$1" }').replace(/NumberLong\("?([0-9]+)"?\)/g, '{ "$numberLong": "$1" }').replace(/NumberDecimal\("([0-9.]+)"\)/g, '{ "$numberDecimal": "$1" }').replace(/ISODate\("(.+?)"\)/g, '{ "$date": "$1" }').replace(/DBRef\("(.+?)", (.+?)\)/g, function(match, ns, id) {
                    id = toStrictSimple(id);
                    return '{ "$ref": "' + ns + '", "$id": ' + id + " }";
                }).replace("undefined", '{ "$undefined": true }');
            }
            function toStrictRegEx(str) {
                var regex = /([,:]\s*)\/(.+?)\/([gims]{0,4})(\s+)/g;
                var match;
                while ((match = regex.exec(str)) !== null) {
                    var m2 = match[2].replace(/"/g, '"');
                    str = str.replace(match[0], format('%s{ "$regex": "%s", "$options": "%s" }%s', match[1], m2, match[3], match[4]));
                }
                return str;
            }
            function toStrictBinData(str) {
                var regex = /BinData\((\d+),"(.+?)"\)/g;
                var match;
                while ((match = regex.exec(str)) !== null) {
                    var hex = parseInt(match[1], 10).toString(16);
                    str = str.replace(match[0], '{ "$binary": "' + match[2] + '", "$type": "' + hex + '" }');
                }
                return str;
            }
            module.exports.toStrict = function(str) {
                str = toStrictQuotes(str);
                str = toStrictSimple(str);
                str = toStrictRegEx(str);
                str = toStrictBinData(str);
                return str;
            };
            module.exports.serialize = {
                ObjectID: function(v) {
                    return format('ObjectId("%s")', v.toString());
                },
                Timestamp: function(v) {
                    return format("Timestamp(%d, %d)", v.low_, v.high_);
                },
                MinKey: function(v) {
                    return v;
                },
                MaxKey: function(v) {
                    return v;
                },
                NumberLong: function(v) {
                    return format("NumberLong(%d)", v);
                },
                Date: function(v) {
                    return format('ISODate("%s")', v.toISOString());
                },
                DBRef: function(v) {
                    var id = typeof v.oid === "object" && module.exports.serialize[v.oid.constructor.name] ? module.exports.serialize[v.oid.constructor.name](v.oid) : typeof v.oid === "string" ? '"' + v.oid + '"' : v.oid;
                    return format('DBRef("%s", %s)', v.namespace, id);
                },
                Undefined: function() {
                    return "undefined";
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
                    return format("/%s/%s", v.source, o);
                },
                Binary: function(v) {
                    return format('BinData(%s, "%s")', v.sub_type.toString(10), v.buffer.toString("base64"));
                }
            };
        }, {
            util: 32
        } ],
        38: [ function(require, module, exports) {
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
            bson: 47,
            buffer: 2
        } ],
        39: [ function(require, module, exports) {
            var types = require("./types");
            var deserialize = require("./deserialize");
            module.exports = function reviver(k, v) {
                if (!types.isObject(v)) {
                    return v;
                }
                var firstKey = Object.keys(v)[0];
                if (!firstKey || types.special.keys.indexOf(firstKey) === -1) {
                    return v;
                }
                return deserialize(v);
            };
        }, {
            "./deserialize": 34,
            "./types": 41
        } ],
        40: [ function(require, module, exports) {
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
            "./modes/strict": 38,
            "./types": 41,
            "lodash.isfunction": 73,
            "lodash.transform": 74
        } ],
        41: [ function(require, module, exports) {
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
            "./modes/strict": 38
        } ],
        42: [ function(require, module, exports) {
            (function(process, Buffer) {
                "use strict";
                var Parser = require("jsonparse"), through = require("through");
                exports.parse = function(path, map) {
                    var header, footer;
                    var parser = new Parser();
                    var stream = through(function(chunk) {
                        if ("string" === typeof chunk) chunk = new Buffer(chunk);
                        parser.write(chunk);
                    }, function(data) {
                        if (data) stream.write(data);
                        if (header) stream.emit("header", header);
                        if (footer) stream.emit("footer", footer);
                        stream.queue(null);
                    });
                    if ("string" === typeof path) path = path.split(".").map(function(e) {
                        if (e === "$*") return {
                            emitKey: true
                        }; else if (e === "*") return true; else if (e === "") return {
                            recurse: true
                        }; else return e;
                    });
                    var count = 0, _key;
                    if (!path || !path.length) path = null;
                    parser.onValue = function(value) {
                        if (!this.root) stream.root = value;
                        if (!path) return;
                        var i = 0;
                        var j = 0;
                        var emitKey = false;
                        var emitPath = false;
                        while (i < path.length) {
                            var key = path[i];
                            var c;
                            j++;
                            if (key && !key.recurse) {
                                c = j === this.stack.length ? this : this.stack[j];
                                if (!c) return;
                                if (!check(key, c.key)) {
                                    setHeaderFooter(c.key, value);
                                    return;
                                }
                                emitKey = !!key.emitKey;
                                emitPath = !!key.emitPath;
                                i++;
                            } else {
                                i++;
                                var nextKey = path[i];
                                if (!nextKey) return;
                                while (true) {
                                    c = j === this.stack.length ? this : this.stack[j];
                                    if (!c) return;
                                    if (check(nextKey, c.key)) {
                                        i++;
                                        if (!Object.isFrozen(this.stack[j])) this.stack[j].value = null;
                                        break;
                                    } else {
                                        setHeaderFooter(c.key, value);
                                    }
                                    j++;
                                }
                            }
                        }
                        if (header) {
                            stream.emit("header", header);
                            header = false;
                        }
                        if (j !== this.stack.length) return;
                        count++;
                        var actualPath = this.stack.slice(1).map(function(element) {
                            return element.key;
                        }).concat([ this.key ]);
                        var data = this.value[this.key];
                        if (null != data) if (null != (data = map ? map(data, actualPath) : data)) {
                            if (emitKey || emitPath) {
                                data = {
                                    value: data
                                };
                                if (emitKey) data["key"] = this.key;
                                if (emitPath) data["path"] = actualPath;
                            }
                            stream.queue(data);
                        }
                        delete this.value[this.key];
                        for (var k in this.stack) if (!Object.isFrozen(this.stack[k])) this.stack[k].value = null;
                    };
                    parser._onToken = parser.onToken;
                    parser.onToken = function(token, value) {
                        parser._onToken(token, value);
                        if (this.stack.length === 0) {
                            if (stream.root) {
                                if (!path) stream.queue(stream.root);
                                count = 0;
                                stream.root = null;
                            }
                        }
                    };
                    parser.onError = function(err) {
                        if (err.message.indexOf("at position") > -1) err.message = "Invalid JSON (" + err.message + ")";
                        stream.emit("error", err);
                    };
                    return stream;
                    function setHeaderFooter(key, value) {
                        if (header !== false) {
                            header = header || {};
                            header[key] = value;
                        }
                        if (footer !== false && header === false) {
                            footer = footer || {};
                            footer[key] = value;
                        }
                    }
                };
                function check(x, y) {
                    if ("string" === typeof x) return y == x; else if (x && "function" === typeof x.exec) return x.exec(y); else if ("boolean" === typeof x || "object" === typeof x) return x; else if ("function" === typeof x) return x(y);
                    return false;
                }
                exports.stringify = function(op, sep, cl, indent) {
                    indent = indent || 0;
                    if (op === false) {
                        op = "";
                        sep = "\n";
                        cl = "";
                    } else if (op == null) {
                        op = "[\n";
                        sep = "\n,\n";
                        cl = "\n]\n";
                    }
                    var stream, first = true, anyData = false;
                    stream = through(function(data) {
                        anyData = true;
                        try {
                            var json = JSON.stringify(data, null, indent);
                        } catch (err) {
                            return stream.emit("error", err);
                        }
                        if (first) {
                            first = false;
                            stream.queue(op + json);
                        } else stream.queue(sep + json);
                    }, function(data) {
                        if (!anyData) stream.queue(op);
                        stream.queue(cl);
                        stream.queue(null);
                    });
                    return stream;
                };
                exports.stringifyObject = function(op, sep, cl, indent) {
                    indent = indent || 0;
                    if (op === false) {
                        op = "";
                        sep = "\n";
                        cl = "";
                    } else if (op == null) {
                        op = "{\n";
                        sep = "\n,\n";
                        cl = "\n}\n";
                    }
                    var first = true;
                    var anyData = false;
                    var stream = through(function(data) {
                        anyData = true;
                        var json = JSON.stringify(data[0]) + ":" + JSON.stringify(data[1], null, indent);
                        if (first) {
                            first = false;
                            this.queue(op + json);
                        } else this.queue(sep + json);
                    }, function(data) {
                        if (!anyData) this.queue(op);
                        this.queue(cl);
                        this.queue(null);
                    });
                    return stream;
                };
                if (!module.parent && process.title !== "browser") {
                    process.stdin.pipe(exports.parse(process.argv[2])).pipe(exports.stringify("[", ",\n", "]\n", 2)).pipe(process.stdout);
                }
            }).call(this, require("_process"), require("buffer").Buffer);
        }, {
            _process: 8,
            buffer: 2,
            jsonparse: 43,
            through: 44
        } ],
        43: [ function(require, module, exports) {
            (function(Buffer) {
                var C = {};
                var LEFT_BRACE = C.LEFT_BRACE = 1;
                var RIGHT_BRACE = C.RIGHT_BRACE = 2;
                var LEFT_BRACKET = C.LEFT_BRACKET = 3;
                var RIGHT_BRACKET = C.RIGHT_BRACKET = 4;
                var COLON = C.COLON = 5;
                var COMMA = C.COMMA = 6;
                var TRUE = C.TRUE = 7;
                var FALSE = C.FALSE = 8;
                var NULL = C.NULL = 9;
                var STRING = C.STRING = 10;
                var NUMBER = C.NUMBER = 11;
                var START = C.START = 17;
                var STOP = C.STOP = 18;
                var TRUE1 = C.TRUE1 = 33;
                var TRUE2 = C.TRUE2 = 34;
                var TRUE3 = C.TRUE3 = 35;
                var FALSE1 = C.FALSE1 = 49;
                var FALSE2 = C.FALSE2 = 50;
                var FALSE3 = C.FALSE3 = 51;
                var FALSE4 = C.FALSE4 = 52;
                var NULL1 = C.NULL1 = 65;
                var NULL2 = C.NULL2 = 66;
                var NULL3 = C.NULL3 = 67;
                var NUMBER1 = C.NUMBER1 = 81;
                var NUMBER3 = C.NUMBER3 = 83;
                var STRING1 = C.STRING1 = 97;
                var STRING2 = C.STRING2 = 98;
                var STRING3 = C.STRING3 = 99;
                var STRING4 = C.STRING4 = 100;
                var STRING5 = C.STRING5 = 101;
                var STRING6 = C.STRING6 = 102;
                var VALUE = C.VALUE = 113;
                var KEY = C.KEY = 114;
                var OBJECT = C.OBJECT = 129;
                var ARRAY = C.ARRAY = 130;
                var BACK_SLASH = "\\".charCodeAt(0);
                var FORWARD_SLASH = "/".charCodeAt(0);
                var BACKSPACE = "\b".charCodeAt(0);
                var FORM_FEED = "\f".charCodeAt(0);
                var NEWLINE = "\n".charCodeAt(0);
                var CARRIAGE_RETURN = "\r".charCodeAt(0);
                var TAB = "\t".charCodeAt(0);
                var STRING_BUFFER_SIZE = 64 * 1024;
                function Parser() {
                    this.tState = START;
                    this.value = undefined;
                    this.string = undefined;
                    this.stringBuffer = Buffer.alloc ? Buffer.alloc(STRING_BUFFER_SIZE) : new Buffer(STRING_BUFFER_SIZE);
                    this.stringBufferOffset = 0;
                    this.unicode = undefined;
                    this.highSurrogate = undefined;
                    this.key = undefined;
                    this.mode = undefined;
                    this.stack = [];
                    this.state = VALUE;
                    this.bytes_remaining = 0;
                    this.bytes_in_sequence = 0;
                    this.temp_buffs = {
                        "2": new Buffer(2),
                        "3": new Buffer(3),
                        "4": new Buffer(4)
                    };
                    this.offset = -1;
                }
                Parser.toknam = function(code) {
                    var keys = Object.keys(C);
                    for (var i = 0, l = keys.length; i < l; i++) {
                        var key = keys[i];
                        if (C[key] === code) {
                            return key;
                        }
                    }
                    return code && "0x" + code.toString(16);
                };
                var proto = Parser.prototype;
                proto.onError = function(err) {
                    throw err;
                };
                proto.charError = function(buffer, i) {
                    this.tState = STOP;
                    this.onError(new Error("Unexpected " + JSON.stringify(String.fromCharCode(buffer[i])) + " at position " + i + " in state " + Parser.toknam(this.tState)));
                };
                proto.appendStringChar = function(char) {
                    if (this.stringBufferOffset >= STRING_BUFFER_SIZE) {
                        this.string += this.stringBuffer.toString("utf8");
                        this.stringBufferOffset = 0;
                    }
                    this.stringBuffer[this.stringBufferOffset++] = char;
                };
                proto.appendStringBuf = function(buf, start, end) {
                    var size = buf.length;
                    if (typeof start === "number") {
                        if (typeof end === "number") {
                            if (end < 0) {
                                size = buf.length - start + end;
                            } else {
                                size = end - start;
                            }
                        } else {
                            size = buf.length - start;
                        }
                    }
                    if (size < 0) {
                        size = 0;
                    }
                    if (this.stringBufferOffset + size > STRING_BUFFER_SIZE) {
                        this.string += this.stringBuffer.toString("utf8", 0, this.stringBufferOffset);
                        this.stringBufferOffset = 0;
                    }
                    buf.copy(this.stringBuffer, this.stringBufferOffset, start, end);
                    this.stringBufferOffset += size;
                };
                proto.write = function(buffer) {
                    if (typeof buffer === "string") buffer = new Buffer(buffer);
                    var n;
                    for (var i = 0, l = buffer.length; i < l; i++) {
                        if (this.tState === START) {
                            n = buffer[i];
                            this.offset++;
                            if (n === 123) {
                                this.onToken(LEFT_BRACE, "{");
                            } else if (n === 125) {
                                this.onToken(RIGHT_BRACE, "}");
                            } else if (n === 91) {
                                this.onToken(LEFT_BRACKET, "[");
                            } else if (n === 93) {
                                this.onToken(RIGHT_BRACKET, "]");
                            } else if (n === 58) {
                                this.onToken(COLON, ":");
                            } else if (n === 44) {
                                this.onToken(COMMA, ",");
                            } else if (n === 116) {
                                this.tState = TRUE1;
                            } else if (n === 102) {
                                this.tState = FALSE1;
                            } else if (n === 110) {
                                this.tState = NULL1;
                            } else if (n === 34) {
                                this.string = "";
                                this.stringBufferOffset = 0;
                                this.tState = STRING1;
                            } else if (n === 45) {
                                this.string = "-";
                                this.tState = NUMBER1;
                            } else {
                                if (n >= 48 && n < 64) {
                                    this.string = String.fromCharCode(n);
                                    this.tState = NUMBER3;
                                } else if (n === 32 || n === 9 || n === 10 || n === 13) {} else {
                                    return this.charError(buffer, i);
                                }
                            }
                        } else if (this.tState === STRING1) {
                            n = buffer[i];
                            if (this.bytes_remaining > 0) {
                                for (var j = 0; j < this.bytes_remaining; j++) {
                                    this.temp_buffs[this.bytes_in_sequence][this.bytes_in_sequence - this.bytes_remaining + j] = buffer[j];
                                }
                                this.appendStringBuf(this.temp_buffs[this.bytes_in_sequence]);
                                this.bytes_in_sequence = this.bytes_remaining = 0;
                                i = i + j - 1;
                            } else if (this.bytes_remaining === 0 && n >= 128) {
                                if (n <= 193 || n > 244) {
                                    return this.onError(new Error("Invalid UTF-8 character at position " + i + " in state " + Parser.toknam(this.tState)));
                                }
                                if (n >= 194 && n <= 223) this.bytes_in_sequence = 2;
                                if (n >= 224 && n <= 239) this.bytes_in_sequence = 3;
                                if (n >= 240 && n <= 244) this.bytes_in_sequence = 4;
                                if (this.bytes_in_sequence + i > buffer.length) {
                                    for (var k = 0; k <= buffer.length - 1 - i; k++) {
                                        this.temp_buffs[this.bytes_in_sequence][k] = buffer[i + k];
                                    }
                                    this.bytes_remaining = i + this.bytes_in_sequence - buffer.length;
                                    i = buffer.length - 1;
                                } else {
                                    this.appendStringBuf(buffer, i, i + this.bytes_in_sequence);
                                    i = i + this.bytes_in_sequence - 1;
                                }
                            } else if (n === 34) {
                                this.tState = START;
                                this.string += this.stringBuffer.toString("utf8", 0, this.stringBufferOffset);
                                this.stringBufferOffset = 0;
                                this.onToken(STRING, this.string);
                                this.offset += Buffer.byteLength(this.string, "utf8") + 1;
                                this.string = undefined;
                            } else if (n === 92) {
                                this.tState = STRING2;
                            } else if (n >= 32) {
                                this.appendStringChar(n);
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === STRING2) {
                            n = buffer[i];
                            if (n === 34) {
                                this.appendStringChar(n);
                                this.tState = STRING1;
                            } else if (n === 92) {
                                this.appendStringChar(BACK_SLASH);
                                this.tState = STRING1;
                            } else if (n === 47) {
                                this.appendStringChar(FORWARD_SLASH);
                                this.tState = STRING1;
                            } else if (n === 98) {
                                this.appendStringChar(BACKSPACE);
                                this.tState = STRING1;
                            } else if (n === 102) {
                                this.appendStringChar(FORM_FEED);
                                this.tState = STRING1;
                            } else if (n === 110) {
                                this.appendStringChar(NEWLINE);
                                this.tState = STRING1;
                            } else if (n === 114) {
                                this.appendStringChar(CARRIAGE_RETURN);
                                this.tState = STRING1;
                            } else if (n === 116) {
                                this.appendStringChar(TAB);
                                this.tState = STRING1;
                            } else if (n === 117) {
                                this.unicode = "";
                                this.tState = STRING3;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === STRING3 || this.tState === STRING4 || this.tState === STRING5 || this.tState === STRING6) {
                            n = buffer[i];
                            if (n >= 48 && n < 64 || n > 64 && n <= 70 || n > 96 && n <= 102) {
                                this.unicode += String.fromCharCode(n);
                                if (this.tState++ === STRING6) {
                                    var intVal = parseInt(this.unicode, 16);
                                    this.unicode = undefined;
                                    if (this.highSurrogate !== undefined && intVal >= 56320 && intVal < 57343 + 1) {
                                        this.appendStringBuf(new Buffer(String.fromCharCode(this.highSurrogate, intVal)));
                                        this.highSurrogate = undefined;
                                    } else if (this.highSurrogate === undefined && intVal >= 55296 && intVal < 56319 + 1) {
                                        this.highSurrogate = intVal;
                                    } else {
                                        if (this.highSurrogate !== undefined) {
                                            this.appendStringBuf(new Buffer(String.fromCharCode(this.highSurrogate)));
                                            this.highSurrogate = undefined;
                                        }
                                        this.appendStringBuf(new Buffer(String.fromCharCode(intVal)));
                                    }
                                    this.tState = STRING1;
                                }
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === NUMBER1 || this.tState === NUMBER3) {
                            n = buffer[i];
                            switch (n) {
                              case 48:
                              case 49:
                              case 50:
                              case 51:
                              case 52:
                              case 53:
                              case 54:
                              case 55:
                              case 56:
                              case 57:
                              case 46:
                              case 101:
                              case 69:
                              case 43:
                              case 45:
                                this.string += String.fromCharCode(n);
                                this.tState = NUMBER3;
                                break;

                              default:
                                this.tState = START;
                                var result = Number(this.string);
                                if (isNaN(result)) {
                                    return this.charError(buffer, i);
                                }
                                if (this.string.match(/[0-9]+/) == this.string && result.toString() != this.string) {
                                    this.onToken(STRING, this.string);
                                } else {
                                    this.onToken(NUMBER, result);
                                }
                                this.offset += this.string.length - 1;
                                this.string = undefined;
                                i--;
                                break;
                            }
                        } else if (this.tState === TRUE1) {
                            if (buffer[i] === 114) {
                                this.tState = TRUE2;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === TRUE2) {
                            if (buffer[i] === 117) {
                                this.tState = TRUE3;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === TRUE3) {
                            if (buffer[i] === 101) {
                                this.tState = START;
                                this.onToken(TRUE, true);
                                this.offset += 3;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === FALSE1) {
                            if (buffer[i] === 97) {
                                this.tState = FALSE2;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === FALSE2) {
                            if (buffer[i] === 108) {
                                this.tState = FALSE3;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === FALSE3) {
                            if (buffer[i] === 115) {
                                this.tState = FALSE4;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === FALSE4) {
                            if (buffer[i] === 101) {
                                this.tState = START;
                                this.onToken(FALSE, false);
                                this.offset += 4;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === NULL1) {
                            if (buffer[i] === 117) {
                                this.tState = NULL2;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === NULL2) {
                            if (buffer[i] === 108) {
                                this.tState = NULL3;
                            } else {
                                return this.charError(buffer, i);
                            }
                        } else if (this.tState === NULL3) {
                            if (buffer[i] === 108) {
                                this.tState = START;
                                this.onToken(NULL, null);
                                this.offset += 3;
                            } else {
                                return this.charError(buffer, i);
                            }
                        }
                    }
                };
                proto.onToken = function(token, value) {};
                proto.parseError = function(token, value) {
                    this.tState = STOP;
                    this.onError(new Error("Unexpected " + Parser.toknam(token) + (value ? "(" + JSON.stringify(value) + ")" : "") + " in state " + Parser.toknam(this.state)));
                };
                proto.push = function() {
                    this.stack.push({
                        value: this.value,
                        key: this.key,
                        mode: this.mode
                    });
                };
                proto.pop = function() {
                    var value = this.value;
                    var parent = this.stack.pop();
                    this.value = parent.value;
                    this.key = parent.key;
                    this.mode = parent.mode;
                    this.emit(value);
                    if (!this.mode) {
                        this.state = VALUE;
                    }
                };
                proto.emit = function(value) {
                    if (this.mode) {
                        this.state = COMMA;
                    }
                    this.onValue(value);
                };
                proto.onValue = function(value) {};
                proto.onToken = function(token, value) {
                    if (this.state === VALUE) {
                        if (token === STRING || token === NUMBER || token === TRUE || token === FALSE || token === NULL) {
                            if (this.value) {
                                this.value[this.key] = value;
                            }
                            this.emit(value);
                        } else if (token === LEFT_BRACE) {
                            this.push();
                            if (this.value) {
                                this.value = this.value[this.key] = {};
                            } else {
                                this.value = {};
                            }
                            this.key = undefined;
                            this.state = KEY;
                            this.mode = OBJECT;
                        } else if (token === LEFT_BRACKET) {
                            this.push();
                            if (this.value) {
                                this.value = this.value[this.key] = [];
                            } else {
                                this.value = [];
                            }
                            this.key = 0;
                            this.mode = ARRAY;
                            this.state = VALUE;
                        } else if (token === RIGHT_BRACE) {
                            if (this.mode === OBJECT) {
                                this.pop();
                            } else {
                                return this.parseError(token, value);
                            }
                        } else if (token === RIGHT_BRACKET) {
                            if (this.mode === ARRAY) {
                                this.pop();
                            } else {
                                return this.parseError(token, value);
                            }
                        } else {
                            return this.parseError(token, value);
                        }
                    } else if (this.state === KEY) {
                        if (token === STRING) {
                            this.key = value;
                            this.state = COLON;
                        } else if (token === RIGHT_BRACE) {
                            this.pop();
                        } else {
                            return this.parseError(token, value);
                        }
                    } else if (this.state === COLON) {
                        if (token === COLON) {
                            this.state = VALUE;
                        } else {
                            return this.parseError(token, value);
                        }
                    } else if (this.state === COMMA) {
                        if (token === COMMA) {
                            if (this.mode === ARRAY) {
                                this.key++;
                                this.state = VALUE;
                            } else if (this.mode === OBJECT) {
                                this.state = KEY;
                            }
                        } else if (token === RIGHT_BRACKET && this.mode === ARRAY || token === RIGHT_BRACE && this.mode === OBJECT) {
                            this.pop();
                        } else {
                            return this.parseError(token, value);
                        }
                    } else {
                        return this.parseError(token, value);
                    }
                };
                Parser.C = C;
                module.exports = Parser;
            }).call(this, require("buffer").Buffer);
        }, {
            buffer: 2
        } ],
        44: [ function(require, module, exports) {
            (function(process) {
                var Stream = require("stream");
                exports = module.exports = through;
                through.through = through;
                function through(write, end, opts) {
                    write = write || function(data) {
                        this.queue(data);
                    };
                    end = end || function() {
                        this.queue(null);
                    };
                    var ended = false, destroyed = false, buffer = [], _ended = false;
                    var stream = new Stream();
                    stream.readable = stream.writable = true;
                    stream.paused = false;
                    stream.autoDestroy = !(opts && opts.autoDestroy === false);
                    stream.write = function(data) {
                        write.call(this, data);
                        return !stream.paused;
                    };
                    function drain() {
                        while (buffer.length && !stream.paused) {
                            var data = buffer.shift();
                            if (null === data) return stream.emit("end"); else stream.emit("data", data);
                        }
                    }
                    stream.queue = stream.push = function(data) {
                        if (_ended) return stream;
                        if (data === null) _ended = true;
                        buffer.push(data);
                        drain();
                        return stream;
                    };
                    stream.on("end", function() {
                        stream.readable = false;
                        if (!stream.writable && stream.autoDestroy) process.nextTick(function() {
                            stream.destroy();
                        });
                    });
                    function _end() {
                        stream.writable = false;
                        end.call(stream);
                        if (!stream.readable && stream.autoDestroy) stream.destroy();
                    }
                    stream.end = function(data) {
                        if (ended) return;
                        ended = true;
                        if (arguments.length) stream.write(data);
                        _end();
                        return stream;
                    };
                    stream.destroy = function() {
                        if (destroyed) return;
                        destroyed = true;
                        ended = true;
                        buffer.length = 0;
                        stream.writable = stream.readable = false;
                        stream.emit("close");
                        return stream;
                    };
                    stream.pause = function() {
                        if (stream.paused) return;
                        stream.paused = true;
                        return stream;
                    };
                    stream.resume = function() {
                        if (stream.paused) {
                            stream.paused = false;
                            stream.emit("resume");
                        }
                        drain();
                        if (!stream.paused) stream.emit("drain");
                        return stream;
                    };
                    return stream;
                }
            }).call(this, require("_process"));
        }, {
            _process: 8,
            stream: 27
        } ],
        45: [ function(require, module, exports) {
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
            _process: 8
        } ],
        46: [ function(require, module, exports) {
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
            buffer: 2
        } ],
        47: [ function(require, module, exports) {
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
            "./binary": 46,
            "./code": 48,
            "./db_ref": 49,
            "./decimal128": 50,
            "./double": 51,
            "./float_parser": 52,
            "./int_32": 53,
            "./long": 54,
            "./map": 55,
            "./max_key": 56,
            "./min_key": 57,
            "./objectid": 58,
            "./parser/calculate_size": 59,
            "./parser/deserializer": 60,
            "./parser/serializer": 61,
            "./regexp": 62,
            "./symbol": 63,
            "./timestamp": 64,
            buffer: 2
        } ],
        48: [ function(require, module, exports) {
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
        49: [ function(require, module, exports) {
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
        50: [ function(require, module, exports) {
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
            "./long": 54,
            buffer: 2
        } ],
        51: [ function(require, module, exports) {
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
        52: [ function(require, module, exports) {
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
        53: [ function(require, module, exports) {
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
        54: [ function(require, module, exports) {
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
        55: [ function(require, module, exports) {
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
        56: [ function(require, module, exports) {
            function MaxKey() {
                if (!(this instanceof MaxKey)) return new MaxKey();
                this._bsontype = "MaxKey";
            }
            module.exports = MaxKey;
            module.exports.MaxKey = MaxKey;
        }, {} ],
        57: [ function(require, module, exports) {
            function MinKey() {
                if (!(this instanceof MinKey)) return new MinKey();
                this._bsontype = "MinKey";
            }
            module.exports = MinKey;
            module.exports.MinKey = MinKey;
        }, {} ],
        58: [ function(require, module, exports) {
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
            _process: 8,
            buffer: 2
        } ],
        59: [ function(require, module, exports) {
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
            "../binary": 46,
            "../code": 48,
            "../db_ref": 49,
            "../decimal128": 50,
            "../double": 51,
            "../float_parser": 52,
            "../long": 54,
            "../max_key": 56,
            "../min_key": 57,
            "../objectid": 58,
            "../regexp": 62,
            "../symbol": 63,
            "../timestamp": 64,
            buffer: 2
        } ],
        60: [ function(require, module, exports) {
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
            "../binary": 46,
            "../code": 48,
            "../db_ref": 49,
            "../decimal128": 50,
            "../double": 51,
            "../float_parser": 52,
            "../int_32": 53,
            "../long": 54,
            "../max_key": 56,
            "../min_key": 57,
            "../objectid": 58,
            "../regexp": 62,
            "../symbol": 63,
            "../timestamp": 64,
            buffer: 2,
            util: 32
        } ],
        61: [ function(require, module, exports) {
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
            "../binary": 46,
            "../code": 48,
            "../db_ref": 49,
            "../decimal128": 50,
            "../double": 51,
            "../float_parser": 52,
            "../int_32": 53,
            "../long": 54,
            "../map": 55,
            "../max_key": 56,
            "../min_key": 57,
            "../objectid": 58,
            "../regexp": 62,
            "../symbol": 63,
            "../timestamp": 64,
            buffer: 2
        } ],
        62: [ function(require, module, exports) {
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
        63: [ function(require, module, exports) {
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
        64: [ function(require, module, exports) {
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
        65: [ function(require, module, exports) {
            (function(process, global, Buffer) {
                var Stream = require("stream").Stream, es = exports, through = require("through"), from = require("from"), duplex = require("duplexer"), map = require("map-stream"), pause = require("pause-stream"), split = require("split"), pipeline = require("stream-combiner"), immediately = global.setImmediate || process.nextTick;
                es.Stream = Stream;
                es.through = through;
                es.from = from;
                es.duplex = duplex;
                es.map = map;
                es.pause = pause;
                es.split = split;
                es.pipeline = es.connect = es.pipe = pipeline;
                es.concat = es.merge = function() {
                    var toMerge = [].slice.call(arguments);
                    if (toMerge.length === 1 && toMerge[0] instanceof Array) {
                        toMerge = toMerge[0];
                    }
                    var stream = new Stream();
                    stream.setMaxListeners(0);
                    var endCount = 0;
                    stream.writable = stream.readable = true;
                    if (toMerge.length) {
                        toMerge.forEach(function(e) {
                            e.pipe(stream, {
                                end: false
                            });
                            var ended = false;
                            e.on("end", function() {
                                if (ended) return;
                                ended = true;
                                endCount++;
                                if (endCount == toMerge.length) stream.emit("end");
                            });
                        });
                    } else {
                        process.nextTick(function() {
                            stream.emit("end");
                        });
                    }
                    stream.write = function(data) {
                        this.emit("data", data);
                    };
                    stream.destroy = function() {
                        toMerge.forEach(function(e) {
                            if (e.destroy) e.destroy();
                        });
                    };
                    return stream;
                };
                es.writeArray = function(done) {
                    if ("function" !== typeof done) throw new Error("function writeArray (done): done must be function");
                    var a = new Stream(), array = [], isDone = false;
                    a.write = function(l) {
                        array.push(l);
                    };
                    a.end = function() {
                        isDone = true;
                        done(null, array);
                    };
                    a.writable = true;
                    a.readable = false;
                    a.destroy = function() {
                        a.writable = a.readable = false;
                        if (isDone) return;
                        done(new Error("destroyed before end"), array);
                    };
                    return a;
                };
                es.readArray = function(array) {
                    var stream = new Stream(), i = 0, paused = false, ended = false;
                    stream.readable = true;
                    stream.writable = false;
                    if (!Array.isArray(array)) throw new Error("event-stream.read expects an array");
                    stream.resume = function() {
                        if (ended) return;
                        paused = false;
                        var l = array.length;
                        while (i < l && !paused && !ended) {
                            stream.emit("data", array[i++]);
                        }
                        if (i == l && !ended) ended = true, stream.readable = false, stream.emit("end");
                    };
                    process.nextTick(stream.resume);
                    stream.pause = function() {
                        paused = true;
                    };
                    stream.destroy = function() {
                        ended = true;
                        stream.emit("close");
                    };
                    return stream;
                };
                es.readable = function(func, continueOnError) {
                    var stream = new Stream(), i = 0, paused = false, ended = false, reading = false;
                    stream.readable = true;
                    stream.writable = false;
                    if ("function" !== typeof func) throw new Error("event-stream.readable expects async function");
                    stream.on("end", function() {
                        ended = true;
                    });
                    function get(err, data) {
                        if (err) {
                            stream.emit("error", err);
                            if (!continueOnError) stream.emit("end");
                        } else if (arguments.length > 1) stream.emit("data", data);
                        immediately(function() {
                            if (ended || paused || reading) return;
                            try {
                                reading = true;
                                func.call(stream, i++, function() {
                                    reading = false;
                                    get.apply(null, arguments);
                                });
                            } catch (err) {
                                stream.emit("error", err);
                            }
                        });
                    }
                    stream.resume = function() {
                        paused = false;
                        get();
                    };
                    process.nextTick(get);
                    stream.pause = function() {
                        paused = true;
                    };
                    stream.destroy = function() {
                        stream.emit("end");
                        stream.emit("close");
                        ended = true;
                    };
                    return stream;
                };
                es.mapSync = function(sync) {
                    return es.through(function write(data) {
                        var mappedData;
                        try {
                            mappedData = sync(data);
                        } catch (err) {
                            return this.emit("error", err);
                        }
                        if (mappedData !== undefined) this.emit("data", mappedData);
                    });
                };
                es.log = function(name) {
                    return es.through(function(data) {
                        var args = [].slice.call(arguments);
                        if (name) console.error(name, data); else console.error(data);
                        this.emit("data", data);
                    });
                };
                es.child = function(child) {
                    return es.duplex(child.stdin, child.stdout);
                };
                es.parse = function(options) {
                    var emitError = !!(options ? options.error : false);
                    return es.through(function(data) {
                        var obj;
                        try {
                            if (data) obj = JSON.parse(data.toString());
                        } catch (err) {
                            if (emitError) return this.emit("error", err);
                            return console.error(err, "attempting to parse:", data);
                        }
                        if (obj !== undefined) this.emit("data", obj);
                    });
                };
                es.stringify = function() {
                    var Buffer = require("buffer").Buffer;
                    return es.mapSync(function(e) {
                        return JSON.stringify(Buffer.isBuffer(e) ? e.toString() : e) + "\n";
                    });
                };
                es.replace = function(from, to) {
                    return es.pipeline(es.split(from), es.join(to));
                };
                es.join = function(str) {
                    if ("function" === typeof str) return es.wait(str);
                    var first = true;
                    return es.through(function(data) {
                        if (!first) this.emit("data", str);
                        first = false;
                        this.emit("data", data);
                        return true;
                    });
                };
                es.wait = function(callback) {
                    var arr = [];
                    return es.through(function(data) {
                        arr.push(data);
                    }, function() {
                        var body = Buffer.isBuffer(arr[0]) ? Buffer.concat(arr) : arr.join("");
                        this.emit("data", body);
                        this.emit("end");
                        if (callback) callback(null, body);
                    });
                };
                es.pipeable = function() {
                    throw new Error("[EVENT-STREAM] es.pipeable is deprecated");
                };
            }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer);
        }, {
            _process: 8,
            buffer: 2,
            duplexer: 66,
            from: 67,
            "map-stream": 68,
            "pause-stream": 69,
            split: 70,
            stream: 27,
            "stream-combiner": 71,
            through: 72
        } ],
        66: [ function(require, module, exports) {
            var Stream = require("stream");
            var writeMethods = [ "write", "end", "destroy" ];
            var readMethods = [ "resume", "pause" ];
            var readEvents = [ "data", "close" ];
            var slice = Array.prototype.slice;
            module.exports = duplex;
            function forEach(arr, fn) {
                if (arr.forEach) {
                    return arr.forEach(fn);
                }
                for (var i = 0; i < arr.length; i++) {
                    fn(arr[i], i);
                }
            }
            function duplex(writer, reader) {
                var stream = new Stream();
                var ended = false;
                forEach(writeMethods, proxyWriter);
                forEach(readMethods, proxyReader);
                forEach(readEvents, proxyStream);
                reader.on("end", handleEnd);
                writer.on("drain", function() {
                    stream.emit("drain");
                });
                writer.on("error", reemit);
                reader.on("error", reemit);
                stream.writable = writer.writable;
                stream.readable = reader.readable;
                return stream;
                function proxyWriter(methodName) {
                    stream[methodName] = method;
                    function method() {
                        return writer[methodName].apply(writer, arguments);
                    }
                }
                function proxyReader(methodName) {
                    stream[methodName] = method;
                    function method() {
                        stream.emit(methodName);
                        var func = reader[methodName];
                        if (func) {
                            return func.apply(reader, arguments);
                        }
                        reader.emit(methodName);
                    }
                }
                function proxyStream(methodName) {
                    reader.on(methodName, reemit);
                    function reemit() {
                        var args = slice.call(arguments);
                        args.unshift(methodName);
                        stream.emit.apply(stream, args);
                    }
                }
                function handleEnd() {
                    if (ended) {
                        return;
                    }
                    ended = true;
                    var args = slice.call(arguments);
                    args.unshift("end");
                    stream.emit.apply(stream, args);
                }
                function reemit(err) {
                    stream.emit("error", err);
                }
            }
        }, {
            stream: 27
        } ],
        67: [ function(require, module, exports) {
            (function(process) {
                "use strict";
                var Stream = require("stream");
                module.exports = function from(source) {
                    if (Array.isArray(source)) {
                        var source_index = 0, source_len = source.length;
                        return from(function(i) {
                            if (source_index < source_len) this.emit("data", source[source_index++]); else this.emit("end");
                            return true;
                        });
                    }
                    var s = new Stream(), i = 0;
                    s.ended = false;
                    s.started = false;
                    s.readable = true;
                    s.writable = false;
                    s.paused = false;
                    s.ended = false;
                    s.pause = function() {
                        s.started = true;
                        s.paused = true;
                    };
                    function next() {
                        s.started = true;
                        if (s.ended) return;
                        while (!s.ended && !s.paused && source.call(s, i++, function() {
                            if (!s.ended && !s.paused) process.nextTick(next);
                        })) ;
                    }
                    s.resume = function() {
                        s.started = true;
                        s.paused = false;
                        next();
                    };
                    s.on("end", function() {
                        s.ended = true;
                        s.readable = false;
                        process.nextTick(s.destroy);
                    });
                    s.destroy = function() {
                        s.ended = true;
                        s.emit("close");
                    };
                    process.nextTick(function() {
                        if (!s.started) s.resume();
                    });
                    return s;
                };
            }).call(this, require("_process"));
        }, {
            _process: 8,
            stream: 27
        } ],
        68: [ function(require, module, exports) {
            (function(process) {
                var Stream = require("stream").Stream;
                module.exports = function(mapper, opts) {
                    var stream = new Stream(), self = this, inputs = 0, outputs = 0, ended = false, paused = false, destroyed = false, lastWritten = 0, inNext = false;
                    this.opts = opts || {};
                    var errorEventName = this.opts.failures ? "failure" : "error";
                    var writeQueue = {};
                    stream.writable = true;
                    stream.readable = true;
                    function queueData(data, number) {
                        var nextToWrite = lastWritten + 1;
                        if (number === nextToWrite) {
                            if (data !== undefined) {
                                stream.emit.apply(stream, [ "data", data ]);
                            }
                            lastWritten++;
                            nextToWrite++;
                        } else {
                            writeQueue[number] = data;
                        }
                        if (writeQueue.hasOwnProperty(nextToWrite)) {
                            var dataToWrite = writeQueue[nextToWrite];
                            delete writeQueue[nextToWrite];
                            return queueData(dataToWrite, nextToWrite);
                        }
                        outputs++;
                        if (inputs === outputs) {
                            if (paused) paused = false, stream.emit("drain");
                            if (ended) end();
                        }
                    }
                    function next(err, data, number) {
                        if (destroyed) return;
                        inNext = true;
                        if (!err || self.opts.failures) {
                            queueData(data, number);
                        }
                        if (err) {
                            stream.emit.apply(stream, [ errorEventName, err ]);
                        }
                        inNext = false;
                    }
                    function wrappedMapper(input, number, callback) {
                        return mapper.call(null, input, function(err, data) {
                            callback(err, data, number);
                        });
                    }
                    stream.write = function(data) {
                        if (ended) throw new Error("map stream is not writable");
                        inNext = false;
                        inputs++;
                        try {
                            var written = wrappedMapper(data, inputs, next);
                            paused = written === false;
                            return !paused;
                        } catch (err) {
                            if (inNext) throw err;
                            next(err);
                            return !paused;
                        }
                    };
                    function end(data) {
                        ended = true;
                        stream.writable = false;
                        if (data !== undefined) {
                            return queueData(data, inputs);
                        } else if (inputs == outputs) {
                            stream.readable = false, stream.emit("end"), stream.destroy();
                        }
                    }
                    stream.end = function(data) {
                        if (ended) return;
                        end();
                    };
                    stream.destroy = function() {
                        ended = destroyed = true;
                        stream.writable = stream.readable = paused = false;
                        process.nextTick(function() {
                            stream.emit("close");
                        });
                    };
                    stream.pause = function() {
                        paused = true;
                    };
                    stream.resume = function() {
                        paused = false;
                    };
                    return stream;
                };
            }).call(this, require("_process"));
        }, {
            _process: 8,
            stream: 27
        } ],
        69: [ function(require, module, exports) {
            module.exports = require("through");
        }, {
            through: 72
        } ],
        70: [ function(require, module, exports) {
            var through = require("through");
            var Decoder = require("string_decoder").StringDecoder;
            module.exports = split;
            function split(matcher, mapper, options) {
                var decoder = new Decoder();
                var soFar = "";
                var maxLength = options && options.maxLength;
                if ("function" === typeof matcher) mapper = matcher, matcher = null;
                if (!matcher) matcher = /\r?\n/;
                function emit(stream, piece) {
                    if (mapper) {
                        try {
                            piece = mapper(piece);
                        } catch (err) {
                            return stream.emit("error", err);
                        }
                        if ("undefined" !== typeof piece) stream.queue(piece);
                    } else stream.queue(piece);
                }
                function next(stream, buffer) {
                    var pieces = ((soFar != null ? soFar : "") + buffer).split(matcher);
                    soFar = pieces.pop();
                    if (maxLength && soFar.length > maxLength) stream.emit("error", new Error("maximum buffer reached"));
                    for (var i = 0; i < pieces.length; i++) {
                        var piece = pieces[i];
                        emit(stream, piece);
                    }
                }
                return through(function(b) {
                    next(this, decoder.write(b));
                }, function() {
                    if (decoder.end) next(this, decoder.end());
                    if (soFar != null) emit(this, soFar);
                    this.queue(null);
                });
            }
        }, {
            string_decoder: 28,
            through: 72
        } ],
        71: [ function(require, module, exports) {
            var duplexer = require("duplexer");
            module.exports = function() {
                var streams = [].slice.call(arguments), first = streams[0], last = streams[streams.length - 1], thepipe = duplexer(first, last);
                if (streams.length == 1) return streams[0]; else if (!streams.length) throw new Error("connect called with empty args");
                function recurse(streams) {
                    if (streams.length < 2) return;
                    streams[0].pipe(streams[1]);
                    recurse(streams.slice(1));
                }
                recurse(streams);
                function onerror() {
                    var args = [].slice.call(arguments);
                    args.unshift("error");
                    thepipe.emit.apply(thepipe, args);
                }
                for (var i = 1; i < streams.length - 1; i++) streams[i].on("error", onerror);
                return thepipe;
            };
        }, {
            duplexer: 66
        } ],
        72: [ function(require, module, exports) {
            arguments[4][44][0].apply(exports, arguments);
        }, {
            _process: 8,
            dup: 44,
            stream: 27
        } ],
        73: [ function(require, module, exports) {
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
        74: [ function(require, module, exports) {
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
        75: [ function(require, module, exports) {
            (function(global, factory) {
                typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.moment = factory();
            })(this, function() {
                "use strict";
                var hookCallback;
                function hooks() {
                    return hookCallback.apply(null, arguments);
                }
                function setHookCallback(callback) {
                    hookCallback = callback;
                }
                function isArray(input) {
                    return input instanceof Array || Object.prototype.toString.call(input) === "[object Array]";
                }
                function isObject(input) {
                    return input != null && Object.prototype.toString.call(input) === "[object Object]";
                }
                function isObjectEmpty(obj) {
                    if (Object.getOwnPropertyNames) {
                        return Object.getOwnPropertyNames(obj).length === 0;
                    } else {
                        var k;
                        for (k in obj) {
                            if (obj.hasOwnProperty(k)) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
                function isUndefined(input) {
                    return input === void 0;
                }
                function isNumber(input) {
                    return typeof input === "number" || Object.prototype.toString.call(input) === "[object Number]";
                }
                function isDate(input) {
                    return input instanceof Date || Object.prototype.toString.call(input) === "[object Date]";
                }
                function map(arr, fn) {
                    var res = [], i;
                    for (i = 0; i < arr.length; ++i) {
                        res.push(fn(arr[i], i));
                    }
                    return res;
                }
                function hasOwnProp(a, b) {
                    return Object.prototype.hasOwnProperty.call(a, b);
                }
                function extend(a, b) {
                    for (var i in b) {
                        if (hasOwnProp(b, i)) {
                            a[i] = b[i];
                        }
                    }
                    if (hasOwnProp(b, "toString")) {
                        a.toString = b.toString;
                    }
                    if (hasOwnProp(b, "valueOf")) {
                        a.valueOf = b.valueOf;
                    }
                    return a;
                }
                function createUTC(input, format, locale, strict) {
                    return createLocalOrUTC(input, format, locale, strict, true).utc();
                }
                function defaultParsingFlags() {
                    return {
                        empty: false,
                        unusedTokens: [],
                        unusedInput: [],
                        overflow: -2,
                        charsLeftOver: 0,
                        nullInput: false,
                        invalidMonth: null,
                        invalidFormat: false,
                        userInvalidated: false,
                        iso: false,
                        parsedDateParts: [],
                        meridiem: null,
                        rfc2822: false,
                        weekdayMismatch: false
                    };
                }
                function getParsingFlags(m) {
                    if (m._pf == null) {
                        m._pf = defaultParsingFlags();
                    }
                    return m._pf;
                }
                var some;
                if (Array.prototype.some) {
                    some = Array.prototype.some;
                } else {
                    some = function(fun) {
                        var t = Object(this);
                        var len = t.length >>> 0;
                        for (var i = 0; i < len; i++) {
                            if (i in t && fun.call(this, t[i], i, t)) {
                                return true;
                            }
                        }
                        return false;
                    };
                }
                function isValid(m) {
                    if (m._isValid == null) {
                        var flags = getParsingFlags(m);
                        var parsedParts = some.call(flags.parsedDateParts, function(i) {
                            return i != null;
                        });
                        var isNowValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.invalidWeekday && !flags.weekdayMismatch && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || flags.meridiem && parsedParts);
                        if (m._strict) {
                            isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
                        }
                        if (Object.isFrozen == null || !Object.isFrozen(m)) {
                            m._isValid = isNowValid;
                        } else {
                            return isNowValid;
                        }
                    }
                    return m._isValid;
                }
                function createInvalid(flags) {
                    var m = createUTC(NaN);
                    if (flags != null) {
                        extend(getParsingFlags(m), flags);
                    } else {
                        getParsingFlags(m).userInvalidated = true;
                    }
                    return m;
                }
                var momentProperties = hooks.momentProperties = [];
                function copyConfig(to, from) {
                    var i, prop, val;
                    if (!isUndefined(from._isAMomentObject)) {
                        to._isAMomentObject = from._isAMomentObject;
                    }
                    if (!isUndefined(from._i)) {
                        to._i = from._i;
                    }
                    if (!isUndefined(from._f)) {
                        to._f = from._f;
                    }
                    if (!isUndefined(from._l)) {
                        to._l = from._l;
                    }
                    if (!isUndefined(from._strict)) {
                        to._strict = from._strict;
                    }
                    if (!isUndefined(from._tzm)) {
                        to._tzm = from._tzm;
                    }
                    if (!isUndefined(from._isUTC)) {
                        to._isUTC = from._isUTC;
                    }
                    if (!isUndefined(from._offset)) {
                        to._offset = from._offset;
                    }
                    if (!isUndefined(from._pf)) {
                        to._pf = getParsingFlags(from);
                    }
                    if (!isUndefined(from._locale)) {
                        to._locale = from._locale;
                    }
                    if (momentProperties.length > 0) {
                        for (i = 0; i < momentProperties.length; i++) {
                            prop = momentProperties[i];
                            val = from[prop];
                            if (!isUndefined(val)) {
                                to[prop] = val;
                            }
                        }
                    }
                    return to;
                }
                var updateInProgress = false;
                function Moment(config) {
                    copyConfig(this, config);
                    this._d = new Date(config._d != null ? config._d.getTime() : NaN);
                    if (!this.isValid()) {
                        this._d = new Date(NaN);
                    }
                    if (updateInProgress === false) {
                        updateInProgress = true;
                        hooks.updateOffset(this);
                        updateInProgress = false;
                    }
                }
                function isMoment(obj) {
                    return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
                }
                function absFloor(number) {
                    if (number < 0) {
                        return Math.ceil(number) || 0;
                    } else {
                        return Math.floor(number);
                    }
                }
                function toInt(argumentForCoercion) {
                    var coercedNumber = +argumentForCoercion, value = 0;
                    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                        value = absFloor(coercedNumber);
                    }
                    return value;
                }
                function compareArrays(array1, array2, dontConvert) {
                    var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
                    for (i = 0; i < len; i++) {
                        if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
                            diffs++;
                        }
                    }
                    return diffs + lengthDiff;
                }
                function warn(msg) {
                    if (hooks.suppressDeprecationWarnings === false && typeof console !== "undefined" && console.warn) {
                        console.warn("Deprecation warning: " + msg);
                    }
                }
                function deprecate(msg, fn) {
                    var firstTime = true;
                    return extend(function() {
                        if (hooks.deprecationHandler != null) {
                            hooks.deprecationHandler(null, msg);
                        }
                        if (firstTime) {
                            var args = [];
                            var arg;
                            for (var i = 0; i < arguments.length; i++) {
                                arg = "";
                                if (typeof arguments[i] === "object") {
                                    arg += "\n[" + i + "] ";
                                    for (var key in arguments[0]) {
                                        arg += key + ": " + arguments[0][key] + ", ";
                                    }
                                    arg = arg.slice(0, -2);
                                } else {
                                    arg = arguments[i];
                                }
                                args.push(arg);
                            }
                            warn(msg + "\nArguments: " + Array.prototype.slice.call(args).join("") + "\n" + new Error().stack);
                            firstTime = false;
                        }
                        return fn.apply(this, arguments);
                    }, fn);
                }
                var deprecations = {};
                function deprecateSimple(name, msg) {
                    if (hooks.deprecationHandler != null) {
                        hooks.deprecationHandler(name, msg);
                    }
                    if (!deprecations[name]) {
                        warn(msg);
                        deprecations[name] = true;
                    }
                }
                hooks.suppressDeprecationWarnings = false;
                hooks.deprecationHandler = null;
                function isFunction(input) {
                    return input instanceof Function || Object.prototype.toString.call(input) === "[object Function]";
                }
                function set(config) {
                    var prop, i;
                    for (i in config) {
                        prop = config[i];
                        if (isFunction(prop)) {
                            this[i] = prop;
                        } else {
                            this["_" + i] = prop;
                        }
                    }
                    this._config = config;
                    this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source);
                }
                function mergeConfigs(parentConfig, childConfig) {
                    var res = extend({}, parentConfig), prop;
                    for (prop in childConfig) {
                        if (hasOwnProp(childConfig, prop)) {
                            if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                                res[prop] = {};
                                extend(res[prop], parentConfig[prop]);
                                extend(res[prop], childConfig[prop]);
                            } else if (childConfig[prop] != null) {
                                res[prop] = childConfig[prop];
                            } else {
                                delete res[prop];
                            }
                        }
                    }
                    for (prop in parentConfig) {
                        if (hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop])) {
                            res[prop] = extend({}, res[prop]);
                        }
                    }
                    return res;
                }
                function Locale(config) {
                    if (config != null) {
                        this.set(config);
                    }
                }
                var keys;
                if (Object.keys) {
                    keys = Object.keys;
                } else {
                    keys = function(obj) {
                        var i, res = [];
                        for (i in obj) {
                            if (hasOwnProp(obj, i)) {
                                res.push(i);
                            }
                        }
                        return res;
                    };
                }
                var defaultCalendar = {
                    sameDay: "[Today at] LT",
                    nextDay: "[Tomorrow at] LT",
                    nextWeek: "dddd [at] LT",
                    lastDay: "[Yesterday at] LT",
                    lastWeek: "[Last] dddd [at] LT",
                    sameElse: "L"
                };
                function calendar(key, mom, now) {
                    var output = this._calendar[key] || this._calendar["sameElse"];
                    return isFunction(output) ? output.call(mom, now) : output;
                }
                var defaultLongDateFormat = {
                    LTS: "h:mm:ss A",
                    LT: "h:mm A",
                    L: "MM/DD/YYYY",
                    LL: "MMMM D, YYYY",
                    LLL: "MMMM D, YYYY h:mm A",
                    LLLL: "dddd, MMMM D, YYYY h:mm A"
                };
                function longDateFormat(key) {
                    var format = this._longDateFormat[key], formatUpper = this._longDateFormat[key.toUpperCase()];
                    if (format || !formatUpper) {
                        return format;
                    }
                    this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function(val) {
                        return val.slice(1);
                    });
                    return this._longDateFormat[key];
                }
                var defaultInvalidDate = "Invalid date";
                function invalidDate() {
                    return this._invalidDate;
                }
                var defaultOrdinal = "%d";
                var defaultDayOfMonthOrdinalParse = /\d{1,2}/;
                function ordinal(number) {
                    return this._ordinal.replace("%d", number);
                }
                var defaultRelativeTime = {
                    future: "in %s",
                    past: "%s ago",
                    s: "a few seconds",
                    ss: "%d seconds",
                    m: "a minute",
                    mm: "%d minutes",
                    h: "an hour",
                    hh: "%d hours",
                    d: "a day",
                    dd: "%d days",
                    M: "a month",
                    MM: "%d months",
                    y: "a year",
                    yy: "%d years"
                };
                function relativeTime(number, withoutSuffix, string, isFuture) {
                    var output = this._relativeTime[string];
                    return isFunction(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
                }
                function pastFuture(diff, output) {
                    var format = this._relativeTime[diff > 0 ? "future" : "past"];
                    return isFunction(format) ? format(output) : format.replace(/%s/i, output);
                }
                var aliases = {};
                function addUnitAlias(unit, shorthand) {
                    var lowerCase = unit.toLowerCase();
                    aliases[lowerCase] = aliases[lowerCase + "s"] = aliases[shorthand] = unit;
                }
                function normalizeUnits(units) {
                    return typeof units === "string" ? aliases[units] || aliases[units.toLowerCase()] : undefined;
                }
                function normalizeObjectUnits(inputObject) {
                    var normalizedInput = {}, normalizedProp, prop;
                    for (prop in inputObject) {
                        if (hasOwnProp(inputObject, prop)) {
                            normalizedProp = normalizeUnits(prop);
                            if (normalizedProp) {
                                normalizedInput[normalizedProp] = inputObject[prop];
                            }
                        }
                    }
                    return normalizedInput;
                }
                var priorities = {};
                function addUnitPriority(unit, priority) {
                    priorities[unit] = priority;
                }
                function getPrioritizedUnits(unitsObj) {
                    var units = [];
                    for (var u in unitsObj) {
                        units.push({
                            unit: u,
                            priority: priorities[u]
                        });
                    }
                    units.sort(function(a, b) {
                        return a.priority - b.priority;
                    });
                    return units;
                }
                function zeroFill(number, targetLength, forceSign) {
                    var absNumber = "" + Math.abs(number), zerosToFill = targetLength - absNumber.length, sign = number >= 0;
                    return (sign ? forceSign ? "+" : "" : "-") + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
                }
                var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
                var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
                var formatFunctions = {};
                var formatTokenFunctions = {};
                function addFormatToken(token, padded, ordinal, callback) {
                    var func = callback;
                    if (typeof callback === "string") {
                        func = function() {
                            return this[callback]();
                        };
                    }
                    if (token) {
                        formatTokenFunctions[token] = func;
                    }
                    if (padded) {
                        formatTokenFunctions[padded[0]] = function() {
                            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
                        };
                    }
                    if (ordinal) {
                        formatTokenFunctions[ordinal] = function() {
                            return this.localeData().ordinal(func.apply(this, arguments), token);
                        };
                    }
                }
                function removeFormattingTokens(input) {
                    if (input.match(/\[[\s\S]/)) {
                        return input.replace(/^\[|\]$/g, "");
                    }
                    return input.replace(/\\/g, "");
                }
                function makeFormatFunction(format) {
                    var array = format.match(formattingTokens), i, length;
                    for (i = 0, length = array.length; i < length; i++) {
                        if (formatTokenFunctions[array[i]]) {
                            array[i] = formatTokenFunctions[array[i]];
                        } else {
                            array[i] = removeFormattingTokens(array[i]);
                        }
                    }
                    return function(mom) {
                        var output = "", i;
                        for (i = 0; i < length; i++) {
                            output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
                        }
                        return output;
                    };
                }
                function formatMoment(m, format) {
                    if (!m.isValid()) {
                        return m.localeData().invalidDate();
                    }
                    format = expandFormat(format, m.localeData());
                    formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
                    return formatFunctions[format](m);
                }
                function expandFormat(format, locale) {
                    var i = 5;
                    function replaceLongDateFormatTokens(input) {
                        return locale.longDateFormat(input) || input;
                    }
                    localFormattingTokens.lastIndex = 0;
                    while (i >= 0 && localFormattingTokens.test(format)) {
                        format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
                        localFormattingTokens.lastIndex = 0;
                        i -= 1;
                    }
                    return format;
                }
                var match1 = /\d/;
                var match2 = /\d\d/;
                var match3 = /\d{3}/;
                var match4 = /\d{4}/;
                var match6 = /[+-]?\d{6}/;
                var match1to2 = /\d\d?/;
                var match3to4 = /\d\d\d\d?/;
                var match5to6 = /\d\d\d\d\d\d?/;
                var match1to3 = /\d{1,3}/;
                var match1to4 = /\d{1,4}/;
                var match1to6 = /[+-]?\d{1,6}/;
                var matchUnsigned = /\d+/;
                var matchSigned = /[+-]?\d+/;
                var matchOffset = /Z|[+-]\d\d:?\d\d/gi;
                var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi;
                var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/;
                var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
                var regexes = {};
                function addRegexToken(token, regex, strictRegex) {
                    regexes[token] = isFunction(regex) ? regex : function(isStrict, localeData) {
                        return isStrict && strictRegex ? strictRegex : regex;
                    };
                }
                function getParseRegexForToken(token, config) {
                    if (!hasOwnProp(regexes, token)) {
                        return new RegExp(unescapeFormat(token));
                    }
                    return regexes[token](config._strict, config._locale);
                }
                function unescapeFormat(s) {
                    return regexEscape(s.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
                        return p1 || p2 || p3 || p4;
                    }));
                }
                function regexEscape(s) {
                    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                }
                var tokens = {};
                function addParseToken(token, callback) {
                    var i, func = callback;
                    if (typeof token === "string") {
                        token = [ token ];
                    }
                    if (isNumber(callback)) {
                        func = function(input, array) {
                            array[callback] = toInt(input);
                        };
                    }
                    for (i = 0; i < token.length; i++) {
                        tokens[token[i]] = func;
                    }
                }
                function addWeekParseToken(token, callback) {
                    addParseToken(token, function(input, array, config, token) {
                        config._w = config._w || {};
                        callback(input, config._w, config, token);
                    });
                }
                function addTimeToArrayFromToken(token, input, config) {
                    if (input != null && hasOwnProp(tokens, token)) {
                        tokens[token](input, config._a, config, token);
                    }
                }
                var YEAR = 0;
                var MONTH = 1;
                var DATE = 2;
                var HOUR = 3;
                var MINUTE = 4;
                var SECOND = 5;
                var MILLISECOND = 6;
                var WEEK = 7;
                var WEEKDAY = 8;
                addFormatToken("Y", 0, 0, function() {
                    var y = this.year();
                    return y <= 9999 ? "" + y : "+" + y;
                });
                addFormatToken(0, [ "YY", 2 ], 0, function() {
                    return this.year() % 100;
                });
                addFormatToken(0, [ "YYYY", 4 ], 0, "year");
                addFormatToken(0, [ "YYYYY", 5 ], 0, "year");
                addFormatToken(0, [ "YYYYYY", 6, true ], 0, "year");
                addUnitAlias("year", "y");
                addUnitPriority("year", 1);
                addRegexToken("Y", matchSigned);
                addRegexToken("YY", match1to2, match2);
                addRegexToken("YYYY", match1to4, match4);
                addRegexToken("YYYYY", match1to6, match6);
                addRegexToken("YYYYYY", match1to6, match6);
                addParseToken([ "YYYYY", "YYYYYY" ], YEAR);
                addParseToken("YYYY", function(input, array) {
                    array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
                });
                addParseToken("YY", function(input, array) {
                    array[YEAR] = hooks.parseTwoDigitYear(input);
                });
                addParseToken("Y", function(input, array) {
                    array[YEAR] = parseInt(input, 10);
                });
                function daysInYear(year) {
                    return isLeapYear(year) ? 366 : 365;
                }
                function isLeapYear(year) {
                    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
                }
                hooks.parseTwoDigitYear = function(input) {
                    return toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
                };
                var getSetYear = makeGetSet("FullYear", true);
                function getIsLeapYear() {
                    return isLeapYear(this.year());
                }
                function makeGetSet(unit, keepTime) {
                    return function(value) {
                        if (value != null) {
                            set$1(this, unit, value);
                            hooks.updateOffset(this, keepTime);
                            return this;
                        } else {
                            return get(this, unit);
                        }
                    };
                }
                function get(mom, unit) {
                    return mom.isValid() ? mom._d["get" + (mom._isUTC ? "UTC" : "") + unit]() : NaN;
                }
                function set$1(mom, unit, value) {
                    if (mom.isValid() && !isNaN(value)) {
                        if (unit === "FullYear" && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                            mom._d["set" + (mom._isUTC ? "UTC" : "") + unit](value, mom.month(), daysInMonth(value, mom.month()));
                        } else {
                            mom._d["set" + (mom._isUTC ? "UTC" : "") + unit](value);
                        }
                    }
                }
                function stringGet(units) {
                    units = normalizeUnits(units);
                    if (isFunction(this[units])) {
                        return this[units]();
                    }
                    return this;
                }
                function stringSet(units, value) {
                    if (typeof units === "object") {
                        units = normalizeObjectUnits(units);
                        var prioritized = getPrioritizedUnits(units);
                        for (var i = 0; i < prioritized.length; i++) {
                            this[prioritized[i].unit](units[prioritized[i].unit]);
                        }
                    } else {
                        units = normalizeUnits(units);
                        if (isFunction(this[units])) {
                            return this[units](value);
                        }
                    }
                    return this;
                }
                function mod(n, x) {
                    return (n % x + x) % x;
                }
                var indexOf;
                if (Array.prototype.indexOf) {
                    indexOf = Array.prototype.indexOf;
                } else {
                    indexOf = function(o) {
                        var i;
                        for (i = 0; i < this.length; ++i) {
                            if (this[i] === o) {
                                return i;
                            }
                        }
                        return -1;
                    };
                }
                function daysInMonth(year, month) {
                    if (isNaN(year) || isNaN(month)) {
                        return NaN;
                    }
                    var modMonth = mod(month, 12);
                    year += (month - modMonth) / 12;
                    return modMonth === 1 ? isLeapYear(year) ? 29 : 28 : 31 - modMonth % 7 % 2;
                }
                addFormatToken("M", [ "MM", 2 ], "Mo", function() {
                    return this.month() + 1;
                });
                addFormatToken("MMM", 0, 0, function(format) {
                    return this.localeData().monthsShort(this, format);
                });
                addFormatToken("MMMM", 0, 0, function(format) {
                    return this.localeData().months(this, format);
                });
                addUnitAlias("month", "M");
                addUnitPriority("month", 8);
                addRegexToken("M", match1to2);
                addRegexToken("MM", match1to2, match2);
                addRegexToken("MMM", function(isStrict, locale) {
                    return locale.monthsShortRegex(isStrict);
                });
                addRegexToken("MMMM", function(isStrict, locale) {
                    return locale.monthsRegex(isStrict);
                });
                addParseToken([ "M", "MM" ], function(input, array) {
                    array[MONTH] = toInt(input) - 1;
                });
                addParseToken([ "MMM", "MMMM" ], function(input, array, config, token) {
                    var month = config._locale.monthsParse(input, token, config._strict);
                    if (month != null) {
                        array[MONTH] = month;
                    } else {
                        getParsingFlags(config).invalidMonth = input;
                    }
                });
                var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
                var defaultLocaleMonths = "January_February_March_April_May_June_July_August_September_October_November_December".split("_");
                function localeMonths(m, format) {
                    if (!m) {
                        return isArray(this._months) ? this._months : this._months["standalone"];
                    }
                    return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? "format" : "standalone"][m.month()];
                }
                var defaultLocaleMonthsShort = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_");
                function localeMonthsShort(m, format) {
                    if (!m) {
                        return isArray(this._monthsShort) ? this._monthsShort : this._monthsShort["standalone"];
                    }
                    return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format) ? "format" : "standalone"][m.month()];
                }
                function handleStrictParse(monthName, format, strict) {
                    var i, ii, mom, llc = monthName.toLocaleLowerCase();
                    if (!this._monthsParse) {
                        this._monthsParse = [];
                        this._longMonthsParse = [];
                        this._shortMonthsParse = [];
                        for (i = 0; i < 12; ++i) {
                            mom = createUTC([ 2e3, i ]);
                            this._shortMonthsParse[i] = this.monthsShort(mom, "").toLocaleLowerCase();
                            this._longMonthsParse[i] = this.months(mom, "").toLocaleLowerCase();
                        }
                    }
                    if (strict) {
                        if (format === "MMM") {
                            ii = indexOf.call(this._shortMonthsParse, llc);
                            return ii !== -1 ? ii : null;
                        } else {
                            ii = indexOf.call(this._longMonthsParse, llc);
                            return ii !== -1 ? ii : null;
                        }
                    } else {
                        if (format === "MMM") {
                            ii = indexOf.call(this._shortMonthsParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._longMonthsParse, llc);
                            return ii !== -1 ? ii : null;
                        } else {
                            ii = indexOf.call(this._longMonthsParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._shortMonthsParse, llc);
                            return ii !== -1 ? ii : null;
                        }
                    }
                }
                function localeMonthsParse(monthName, format, strict) {
                    var i, mom, regex;
                    if (this._monthsParseExact) {
                        return handleStrictParse.call(this, monthName, format, strict);
                    }
                    if (!this._monthsParse) {
                        this._monthsParse = [];
                        this._longMonthsParse = [];
                        this._shortMonthsParse = [];
                    }
                    for (i = 0; i < 12; i++) {
                        mom = createUTC([ 2e3, i ]);
                        if (strict && !this._longMonthsParse[i]) {
                            this._longMonthsParse[i] = new RegExp("^" + this.months(mom, "").replace(".", "") + "$", "i");
                            this._shortMonthsParse[i] = new RegExp("^" + this.monthsShort(mom, "").replace(".", "") + "$", "i");
                        }
                        if (!strict && !this._monthsParse[i]) {
                            regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
                            this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
                        }
                        if (strict && format === "MMMM" && this._longMonthsParse[i].test(monthName)) {
                            return i;
                        } else if (strict && format === "MMM" && this._shortMonthsParse[i].test(monthName)) {
                            return i;
                        } else if (!strict && this._monthsParse[i].test(monthName)) {
                            return i;
                        }
                    }
                }
                function setMonth(mom, value) {
                    var dayOfMonth;
                    if (!mom.isValid()) {
                        return mom;
                    }
                    if (typeof value === "string") {
                        if (/^\d+$/.test(value)) {
                            value = toInt(value);
                        } else {
                            value = mom.localeData().monthsParse(value);
                            if (!isNumber(value)) {
                                return mom;
                            }
                        }
                    }
                    dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
                    mom._d["set" + (mom._isUTC ? "UTC" : "") + "Month"](value, dayOfMonth);
                    return mom;
                }
                function getSetMonth(value) {
                    if (value != null) {
                        setMonth(this, value);
                        hooks.updateOffset(this, true);
                        return this;
                    } else {
                        return get(this, "Month");
                    }
                }
                function getDaysInMonth() {
                    return daysInMonth(this.year(), this.month());
                }
                var defaultMonthsShortRegex = matchWord;
                function monthsShortRegex(isStrict) {
                    if (this._monthsParseExact) {
                        if (!hasOwnProp(this, "_monthsRegex")) {
                            computeMonthsParse.call(this);
                        }
                        if (isStrict) {
                            return this._monthsShortStrictRegex;
                        } else {
                            return this._monthsShortRegex;
                        }
                    } else {
                        if (!hasOwnProp(this, "_monthsShortRegex")) {
                            this._monthsShortRegex = defaultMonthsShortRegex;
                        }
                        return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
                    }
                }
                var defaultMonthsRegex = matchWord;
                function monthsRegex(isStrict) {
                    if (this._monthsParseExact) {
                        if (!hasOwnProp(this, "_monthsRegex")) {
                            computeMonthsParse.call(this);
                        }
                        if (isStrict) {
                            return this._monthsStrictRegex;
                        } else {
                            return this._monthsRegex;
                        }
                    } else {
                        if (!hasOwnProp(this, "_monthsRegex")) {
                            this._monthsRegex = defaultMonthsRegex;
                        }
                        return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
                    }
                }
                function computeMonthsParse() {
                    function cmpLenRev(a, b) {
                        return b.length - a.length;
                    }
                    var shortPieces = [], longPieces = [], mixedPieces = [], i, mom;
                    for (i = 0; i < 12; i++) {
                        mom = createUTC([ 2e3, i ]);
                        shortPieces.push(this.monthsShort(mom, ""));
                        longPieces.push(this.months(mom, ""));
                        mixedPieces.push(this.months(mom, ""));
                        mixedPieces.push(this.monthsShort(mom, ""));
                    }
                    shortPieces.sort(cmpLenRev);
                    longPieces.sort(cmpLenRev);
                    mixedPieces.sort(cmpLenRev);
                    for (i = 0; i < 12; i++) {
                        shortPieces[i] = regexEscape(shortPieces[i]);
                        longPieces[i] = regexEscape(longPieces[i]);
                    }
                    for (i = 0; i < 24; i++) {
                        mixedPieces[i] = regexEscape(mixedPieces[i]);
                    }
                    this._monthsRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
                    this._monthsShortRegex = this._monthsRegex;
                    this._monthsStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
                    this._monthsShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
                }
                function createDate(y, m, d, h, M, s, ms) {
                    var date = new Date(y, m, d, h, M, s, ms);
                    if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
                        date.setFullYear(y);
                    }
                    return date;
                }
                function createUTCDate(y) {
                    var date = new Date(Date.UTC.apply(null, arguments));
                    if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
                        date.setUTCFullYear(y);
                    }
                    return date;
                }
                function firstWeekOffset(year, dow, doy) {
                    var fwd = 7 + dow - doy, fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
                    return -fwdlw + fwd - 1;
                }
                function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
                    var localWeekday = (7 + weekday - dow) % 7, weekOffset = firstWeekOffset(year, dow, doy), dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset, resYear, resDayOfYear;
                    if (dayOfYear <= 0) {
                        resYear = year - 1;
                        resDayOfYear = daysInYear(resYear) + dayOfYear;
                    } else if (dayOfYear > daysInYear(year)) {
                        resYear = year + 1;
                        resDayOfYear = dayOfYear - daysInYear(year);
                    } else {
                        resYear = year;
                        resDayOfYear = dayOfYear;
                    }
                    return {
                        year: resYear,
                        dayOfYear: resDayOfYear
                    };
                }
                function weekOfYear(mom, dow, doy) {
                    var weekOffset = firstWeekOffset(mom.year(), dow, doy), week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1, resWeek, resYear;
                    if (week < 1) {
                        resYear = mom.year() - 1;
                        resWeek = week + weeksInYear(resYear, dow, doy);
                    } else if (week > weeksInYear(mom.year(), dow, doy)) {
                        resWeek = week - weeksInYear(mom.year(), dow, doy);
                        resYear = mom.year() + 1;
                    } else {
                        resYear = mom.year();
                        resWeek = week;
                    }
                    return {
                        week: resWeek,
                        year: resYear
                    };
                }
                function weeksInYear(year, dow, doy) {
                    var weekOffset = firstWeekOffset(year, dow, doy), weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
                    return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
                }
                addFormatToken("w", [ "ww", 2 ], "wo", "week");
                addFormatToken("W", [ "WW", 2 ], "Wo", "isoWeek");
                addUnitAlias("week", "w");
                addUnitAlias("isoWeek", "W");
                addUnitPriority("week", 5);
                addUnitPriority("isoWeek", 5);
                addRegexToken("w", match1to2);
                addRegexToken("ww", match1to2, match2);
                addRegexToken("W", match1to2);
                addRegexToken("WW", match1to2, match2);
                addWeekParseToken([ "w", "ww", "W", "WW" ], function(input, week, config, token) {
                    week[token.substr(0, 1)] = toInt(input);
                });
                function localeWeek(mom) {
                    return weekOfYear(mom, this._week.dow, this._week.doy).week;
                }
                var defaultLocaleWeek = {
                    dow: 0,
                    doy: 6
                };
                function localeFirstDayOfWeek() {
                    return this._week.dow;
                }
                function localeFirstDayOfYear() {
                    return this._week.doy;
                }
                function getSetWeek(input) {
                    var week = this.localeData().week(this);
                    return input == null ? week : this.add((input - week) * 7, "d");
                }
                function getSetISOWeek(input) {
                    var week = weekOfYear(this, 1, 4).week;
                    return input == null ? week : this.add((input - week) * 7, "d");
                }
                addFormatToken("d", 0, "do", "day");
                addFormatToken("dd", 0, 0, function(format) {
                    return this.localeData().weekdaysMin(this, format);
                });
                addFormatToken("ddd", 0, 0, function(format) {
                    return this.localeData().weekdaysShort(this, format);
                });
                addFormatToken("dddd", 0, 0, function(format) {
                    return this.localeData().weekdays(this, format);
                });
                addFormatToken("e", 0, 0, "weekday");
                addFormatToken("E", 0, 0, "isoWeekday");
                addUnitAlias("day", "d");
                addUnitAlias("weekday", "e");
                addUnitAlias("isoWeekday", "E");
                addUnitPriority("day", 11);
                addUnitPriority("weekday", 11);
                addUnitPriority("isoWeekday", 11);
                addRegexToken("d", match1to2);
                addRegexToken("e", match1to2);
                addRegexToken("E", match1to2);
                addRegexToken("dd", function(isStrict, locale) {
                    return locale.weekdaysMinRegex(isStrict);
                });
                addRegexToken("ddd", function(isStrict, locale) {
                    return locale.weekdaysShortRegex(isStrict);
                });
                addRegexToken("dddd", function(isStrict, locale) {
                    return locale.weekdaysRegex(isStrict);
                });
                addWeekParseToken([ "dd", "ddd", "dddd" ], function(input, week, config, token) {
                    var weekday = config._locale.weekdaysParse(input, token, config._strict);
                    if (weekday != null) {
                        week.d = weekday;
                    } else {
                        getParsingFlags(config).invalidWeekday = input;
                    }
                });
                addWeekParseToken([ "d", "e", "E" ], function(input, week, config, token) {
                    week[token] = toInt(input);
                });
                function parseWeekday(input, locale) {
                    if (typeof input !== "string") {
                        return input;
                    }
                    if (!isNaN(input)) {
                        return parseInt(input, 10);
                    }
                    input = locale.weekdaysParse(input);
                    if (typeof input === "number") {
                        return input;
                    }
                    return null;
                }
                function parseIsoWeekday(input, locale) {
                    if (typeof input === "string") {
                        return locale.weekdaysParse(input) % 7 || 7;
                    }
                    return isNaN(input) ? null : input;
                }
                var defaultLocaleWeekdays = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_");
                function localeWeekdays(m, format) {
                    if (!m) {
                        return isArray(this._weekdays) ? this._weekdays : this._weekdays["standalone"];
                    }
                    return isArray(this._weekdays) ? this._weekdays[m.day()] : this._weekdays[this._weekdays.isFormat.test(format) ? "format" : "standalone"][m.day()];
                }
                var defaultLocaleWeekdaysShort = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_");
                function localeWeekdaysShort(m) {
                    return m ? this._weekdaysShort[m.day()] : this._weekdaysShort;
                }
                var defaultLocaleWeekdaysMin = "Su_Mo_Tu_We_Th_Fr_Sa".split("_");
                function localeWeekdaysMin(m) {
                    return m ? this._weekdaysMin[m.day()] : this._weekdaysMin;
                }
                function handleStrictParse$1(weekdayName, format, strict) {
                    var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
                    if (!this._weekdaysParse) {
                        this._weekdaysParse = [];
                        this._shortWeekdaysParse = [];
                        this._minWeekdaysParse = [];
                        for (i = 0; i < 7; ++i) {
                            mom = createUTC([ 2e3, 1 ]).day(i);
                            this._minWeekdaysParse[i] = this.weekdaysMin(mom, "").toLocaleLowerCase();
                            this._shortWeekdaysParse[i] = this.weekdaysShort(mom, "").toLocaleLowerCase();
                            this._weekdaysParse[i] = this.weekdays(mom, "").toLocaleLowerCase();
                        }
                    }
                    if (strict) {
                        if (format === "dddd") {
                            ii = indexOf.call(this._weekdaysParse, llc);
                            return ii !== -1 ? ii : null;
                        } else if (format === "ddd") {
                            ii = indexOf.call(this._shortWeekdaysParse, llc);
                            return ii !== -1 ? ii : null;
                        } else {
                            ii = indexOf.call(this._minWeekdaysParse, llc);
                            return ii !== -1 ? ii : null;
                        }
                    } else {
                        if (format === "dddd") {
                            ii = indexOf.call(this._weekdaysParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._shortWeekdaysParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._minWeekdaysParse, llc);
                            return ii !== -1 ? ii : null;
                        } else if (format === "ddd") {
                            ii = indexOf.call(this._shortWeekdaysParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._weekdaysParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._minWeekdaysParse, llc);
                            return ii !== -1 ? ii : null;
                        } else {
                            ii = indexOf.call(this._minWeekdaysParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._weekdaysParse, llc);
                            if (ii !== -1) {
                                return ii;
                            }
                            ii = indexOf.call(this._shortWeekdaysParse, llc);
                            return ii !== -1 ? ii : null;
                        }
                    }
                }
                function localeWeekdaysParse(weekdayName, format, strict) {
                    var i, mom, regex;
                    if (this._weekdaysParseExact) {
                        return handleStrictParse$1.call(this, weekdayName, format, strict);
                    }
                    if (!this._weekdaysParse) {
                        this._weekdaysParse = [];
                        this._minWeekdaysParse = [];
                        this._shortWeekdaysParse = [];
                        this._fullWeekdaysParse = [];
                    }
                    for (i = 0; i < 7; i++) {
                        mom = createUTC([ 2e3, 1 ]).day(i);
                        if (strict && !this._fullWeekdaysParse[i]) {
                            this._fullWeekdaysParse[i] = new RegExp("^" + this.weekdays(mom, "").replace(".", ".?") + "$", "i");
                            this._shortWeekdaysParse[i] = new RegExp("^" + this.weekdaysShort(mom, "").replace(".", ".?") + "$", "i");
                            this._minWeekdaysParse[i] = new RegExp("^" + this.weekdaysMin(mom, "").replace(".", ".?") + "$", "i");
                        }
                        if (!this._weekdaysParse[i]) {
                            regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
                            this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
                        }
                        if (strict && format === "dddd" && this._fullWeekdaysParse[i].test(weekdayName)) {
                            return i;
                        } else if (strict && format === "ddd" && this._shortWeekdaysParse[i].test(weekdayName)) {
                            return i;
                        } else if (strict && format === "dd" && this._minWeekdaysParse[i].test(weekdayName)) {
                            return i;
                        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                            return i;
                        }
                    }
                }
                function getSetDayOfWeek(input) {
                    if (!this.isValid()) {
                        return input != null ? this : NaN;
                    }
                    var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
                    if (input != null) {
                        input = parseWeekday(input, this.localeData());
                        return this.add(input - day, "d");
                    } else {
                        return day;
                    }
                }
                function getSetLocaleDayOfWeek(input) {
                    if (!this.isValid()) {
                        return input != null ? this : NaN;
                    }
                    var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
                    return input == null ? weekday : this.add(input - weekday, "d");
                }
                function getSetISODayOfWeek(input) {
                    if (!this.isValid()) {
                        return input != null ? this : NaN;
                    }
                    if (input != null) {
                        var weekday = parseIsoWeekday(input, this.localeData());
                        return this.day(this.day() % 7 ? weekday : weekday - 7);
                    } else {
                        return this.day() || 7;
                    }
                }
                var defaultWeekdaysRegex = matchWord;
                function weekdaysRegex(isStrict) {
                    if (this._weekdaysParseExact) {
                        if (!hasOwnProp(this, "_weekdaysRegex")) {
                            computeWeekdaysParse.call(this);
                        }
                        if (isStrict) {
                            return this._weekdaysStrictRegex;
                        } else {
                            return this._weekdaysRegex;
                        }
                    } else {
                        if (!hasOwnProp(this, "_weekdaysRegex")) {
                            this._weekdaysRegex = defaultWeekdaysRegex;
                        }
                        return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
                    }
                }
                var defaultWeekdaysShortRegex = matchWord;
                function weekdaysShortRegex(isStrict) {
                    if (this._weekdaysParseExact) {
                        if (!hasOwnProp(this, "_weekdaysRegex")) {
                            computeWeekdaysParse.call(this);
                        }
                        if (isStrict) {
                            return this._weekdaysShortStrictRegex;
                        } else {
                            return this._weekdaysShortRegex;
                        }
                    } else {
                        if (!hasOwnProp(this, "_weekdaysShortRegex")) {
                            this._weekdaysShortRegex = defaultWeekdaysShortRegex;
                        }
                        return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
                    }
                }
                var defaultWeekdaysMinRegex = matchWord;
                function weekdaysMinRegex(isStrict) {
                    if (this._weekdaysParseExact) {
                        if (!hasOwnProp(this, "_weekdaysRegex")) {
                            computeWeekdaysParse.call(this);
                        }
                        if (isStrict) {
                            return this._weekdaysMinStrictRegex;
                        } else {
                            return this._weekdaysMinRegex;
                        }
                    } else {
                        if (!hasOwnProp(this, "_weekdaysMinRegex")) {
                            this._weekdaysMinRegex = defaultWeekdaysMinRegex;
                        }
                        return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
                    }
                }
                function computeWeekdaysParse() {
                    function cmpLenRev(a, b) {
                        return b.length - a.length;
                    }
                    var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [], i, mom, minp, shortp, longp;
                    for (i = 0; i < 7; i++) {
                        mom = createUTC([ 2e3, 1 ]).day(i);
                        minp = this.weekdaysMin(mom, "");
                        shortp = this.weekdaysShort(mom, "");
                        longp = this.weekdays(mom, "");
                        minPieces.push(minp);
                        shortPieces.push(shortp);
                        longPieces.push(longp);
                        mixedPieces.push(minp);
                        mixedPieces.push(shortp);
                        mixedPieces.push(longp);
                    }
                    minPieces.sort(cmpLenRev);
                    shortPieces.sort(cmpLenRev);
                    longPieces.sort(cmpLenRev);
                    mixedPieces.sort(cmpLenRev);
                    for (i = 0; i < 7; i++) {
                        shortPieces[i] = regexEscape(shortPieces[i]);
                        longPieces[i] = regexEscape(longPieces[i]);
                        mixedPieces[i] = regexEscape(mixedPieces[i]);
                    }
                    this._weekdaysRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
                    this._weekdaysShortRegex = this._weekdaysRegex;
                    this._weekdaysMinRegex = this._weekdaysRegex;
                    this._weekdaysStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
                    this._weekdaysShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
                    this._weekdaysMinStrictRegex = new RegExp("^(" + minPieces.join("|") + ")", "i");
                }
                function hFormat() {
                    return this.hours() % 12 || 12;
                }
                function kFormat() {
                    return this.hours() || 24;
                }
                addFormatToken("H", [ "HH", 2 ], 0, "hour");
                addFormatToken("h", [ "hh", 2 ], 0, hFormat);
                addFormatToken("k", [ "kk", 2 ], 0, kFormat);
                addFormatToken("hmm", 0, 0, function() {
                    return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2);
                });
                addFormatToken("hmmss", 0, 0, function() {
                    return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
                });
                addFormatToken("Hmm", 0, 0, function() {
                    return "" + this.hours() + zeroFill(this.minutes(), 2);
                });
                addFormatToken("Hmmss", 0, 0, function() {
                    return "" + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
                });
                function meridiem(token, lowercase) {
                    addFormatToken(token, 0, 0, function() {
                        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
                    });
                }
                meridiem("a", true);
                meridiem("A", false);
                addUnitAlias("hour", "h");
                addUnitPriority("hour", 13);
                function matchMeridiem(isStrict, locale) {
                    return locale._meridiemParse;
                }
                addRegexToken("a", matchMeridiem);
                addRegexToken("A", matchMeridiem);
                addRegexToken("H", match1to2);
                addRegexToken("h", match1to2);
                addRegexToken("k", match1to2);
                addRegexToken("HH", match1to2, match2);
                addRegexToken("hh", match1to2, match2);
                addRegexToken("kk", match1to2, match2);
                addRegexToken("hmm", match3to4);
                addRegexToken("hmmss", match5to6);
                addRegexToken("Hmm", match3to4);
                addRegexToken("Hmmss", match5to6);
                addParseToken([ "H", "HH" ], HOUR);
                addParseToken([ "k", "kk" ], function(input, array, config) {
                    var kInput = toInt(input);
                    array[HOUR] = kInput === 24 ? 0 : kInput;
                });
                addParseToken([ "a", "A" ], function(input, array, config) {
                    config._isPm = config._locale.isPM(input);
                    config._meridiem = input;
                });
                addParseToken([ "h", "hh" ], function(input, array, config) {
                    array[HOUR] = toInt(input);
                    getParsingFlags(config).bigHour = true;
                });
                addParseToken("hmm", function(input, array, config) {
                    var pos = input.length - 2;
                    array[HOUR] = toInt(input.substr(0, pos));
                    array[MINUTE] = toInt(input.substr(pos));
                    getParsingFlags(config).bigHour = true;
                });
                addParseToken("hmmss", function(input, array, config) {
                    var pos1 = input.length - 4;
                    var pos2 = input.length - 2;
                    array[HOUR] = toInt(input.substr(0, pos1));
                    array[MINUTE] = toInt(input.substr(pos1, 2));
                    array[SECOND] = toInt(input.substr(pos2));
                    getParsingFlags(config).bigHour = true;
                });
                addParseToken("Hmm", function(input, array, config) {
                    var pos = input.length - 2;
                    array[HOUR] = toInt(input.substr(0, pos));
                    array[MINUTE] = toInt(input.substr(pos));
                });
                addParseToken("Hmmss", function(input, array, config) {
                    var pos1 = input.length - 4;
                    var pos2 = input.length - 2;
                    array[HOUR] = toInt(input.substr(0, pos1));
                    array[MINUTE] = toInt(input.substr(pos1, 2));
                    array[SECOND] = toInt(input.substr(pos2));
                });
                function localeIsPM(input) {
                    return (input + "").toLowerCase().charAt(0) === "p";
                }
                var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
                function localeMeridiem(hours, minutes, isLower) {
                    if (hours > 11) {
                        return isLower ? "pm" : "PM";
                    } else {
                        return isLower ? "am" : "AM";
                    }
                }
                var getSetHour = makeGetSet("Hours", true);
                var baseConfig = {
                    calendar: defaultCalendar,
                    longDateFormat: defaultLongDateFormat,
                    invalidDate: defaultInvalidDate,
                    ordinal: defaultOrdinal,
                    dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
                    relativeTime: defaultRelativeTime,
                    months: defaultLocaleMonths,
                    monthsShort: defaultLocaleMonthsShort,
                    week: defaultLocaleWeek,
                    weekdays: defaultLocaleWeekdays,
                    weekdaysMin: defaultLocaleWeekdaysMin,
                    weekdaysShort: defaultLocaleWeekdaysShort,
                    meridiemParse: defaultLocaleMeridiemParse
                };
                var locales = {};
                var localeFamilies = {};
                var globalLocale;
                function normalizeLocale(key) {
                    return key ? key.toLowerCase().replace("_", "-") : key;
                }
                function chooseLocale(names) {
                    var i = 0, j, next, locale, split;
                    while (i < names.length) {
                        split = normalizeLocale(names[i]).split("-");
                        j = split.length;
                        next = normalizeLocale(names[i + 1]);
                        next = next ? next.split("-") : null;
                        while (j > 0) {
                            locale = loadLocale(split.slice(0, j).join("-"));
                            if (locale) {
                                return locale;
                            }
                            if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                                break;
                            }
                            j--;
                        }
                        i++;
                    }
                    return null;
                }
                function loadLocale(name) {
                    var oldLocale = null;
                    if (!locales[name] && typeof module !== "undefined" && module && module.exports) {
                        try {
                            oldLocale = globalLocale._abbr;
                            var aliasedRequire = require;
                            aliasedRequire("./locale/" + name);
                            getSetGlobalLocale(oldLocale);
                        } catch (e) {}
                    }
                    return locales[name];
                }
                function getSetGlobalLocale(key, values) {
                    var data;
                    if (key) {
                        if (isUndefined(values)) {
                            data = getLocale(key);
                        } else {
                            data = defineLocale(key, values);
                        }
                        if (data) {
                            globalLocale = data;
                        }
                    }
                    return globalLocale._abbr;
                }
                function defineLocale(name, config) {
                    if (config !== null) {
                        var parentConfig = baseConfig;
                        config.abbr = name;
                        if (locales[name] != null) {
                            deprecateSimple("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change " + "an existing locale. moment.defineLocale(localeName, " + "config) should only be used for creating a new locale " + "See http://momentjs.com/guides/#/warnings/define-locale/ for more info.");
                            parentConfig = locales[name]._config;
                        } else if (config.parentLocale != null) {
                            if (locales[config.parentLocale] != null) {
                                parentConfig = locales[config.parentLocale]._config;
                            } else {
                                if (!localeFamilies[config.parentLocale]) {
                                    localeFamilies[config.parentLocale] = [];
                                }
                                localeFamilies[config.parentLocale].push({
                                    name: name,
                                    config: config
                                });
                                return null;
                            }
                        }
                        locales[name] = new Locale(mergeConfigs(parentConfig, config));
                        if (localeFamilies[name]) {
                            localeFamilies[name].forEach(function(x) {
                                defineLocale(x.name, x.config);
                            });
                        }
                        getSetGlobalLocale(name);
                        return locales[name];
                    } else {
                        delete locales[name];
                        return null;
                    }
                }
                function updateLocale(name, config) {
                    if (config != null) {
                        var locale, tmpLocale, parentConfig = baseConfig;
                        tmpLocale = loadLocale(name);
                        if (tmpLocale != null) {
                            parentConfig = tmpLocale._config;
                        }
                        config = mergeConfigs(parentConfig, config);
                        locale = new Locale(config);
                        locale.parentLocale = locales[name];
                        locales[name] = locale;
                        getSetGlobalLocale(name);
                    } else {
                        if (locales[name] != null) {
                            if (locales[name].parentLocale != null) {
                                locales[name] = locales[name].parentLocale;
                            } else if (locales[name] != null) {
                                delete locales[name];
                            }
                        }
                    }
                    return locales[name];
                }
                function getLocale(key) {
                    var locale;
                    if (key && key._locale && key._locale._abbr) {
                        key = key._locale._abbr;
                    }
                    if (!key) {
                        return globalLocale;
                    }
                    if (!isArray(key)) {
                        locale = loadLocale(key);
                        if (locale) {
                            return locale;
                        }
                        key = [ key ];
                    }
                    return chooseLocale(key);
                }
                function listLocales() {
                    return keys(locales);
                }
                function checkOverflow(m) {
                    var overflow;
                    var a = m._a;
                    if (a && getParsingFlags(m).overflow === -2) {
                        overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
                        if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                            overflow = DATE;
                        }
                        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                            overflow = WEEK;
                        }
                        if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                            overflow = WEEKDAY;
                        }
                        getParsingFlags(m).overflow = overflow;
                    }
                    return m;
                }
                function defaults(a, b, c) {
                    if (a != null) {
                        return a;
                    }
                    if (b != null) {
                        return b;
                    }
                    return c;
                }
                function currentDateArray(config) {
                    var nowValue = new Date(hooks.now());
                    if (config._useUTC) {
                        return [ nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate() ];
                    }
                    return [ nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate() ];
                }
                function configFromArray(config) {
                    var i, date, input = [], currentDate, yearToUse;
                    if (config._d) {
                        return;
                    }
                    currentDate = currentDateArray(config);
                    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                        dayOfYearFromWeekInfo(config);
                    }
                    if (config._dayOfYear != null) {
                        yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
                        if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                            getParsingFlags(config)._overflowDayOfYear = true;
                        }
                        date = createUTCDate(yearToUse, 0, config._dayOfYear);
                        config._a[MONTH] = date.getUTCMonth();
                        config._a[DATE] = date.getUTCDate();
                    }
                    for (i = 0; i < 3 && config._a[i] == null; ++i) {
                        config._a[i] = input[i] = currentDate[i];
                    }
                    for (;i < 7; i++) {
                        config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
                    }
                    if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
                        config._nextDay = true;
                        config._a[HOUR] = 0;
                    }
                    config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
                    if (config._tzm != null) {
                        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
                    }
                    if (config._nextDay) {
                        config._a[HOUR] = 24;
                    }
                    if (config._w && typeof config._w.d !== "undefined" && config._w.d !== config._d.getDay()) {
                        getParsingFlags(config).weekdayMismatch = true;
                    }
                }
                function dayOfYearFromWeekInfo(config) {
                    var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;
                    w = config._w;
                    if (w.GG != null || w.W != null || w.E != null) {
                        dow = 1;
                        doy = 4;
                        weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
                        week = defaults(w.W, 1);
                        weekday = defaults(w.E, 1);
                        if (weekday < 1 || weekday > 7) {
                            weekdayOverflow = true;
                        }
                    } else {
                        dow = config._locale._week.dow;
                        doy = config._locale._week.doy;
                        var curWeek = weekOfYear(createLocal(), dow, doy);
                        weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
                        week = defaults(w.w, curWeek.week);
                        if (w.d != null) {
                            weekday = w.d;
                            if (weekday < 0 || weekday > 6) {
                                weekdayOverflow = true;
                            }
                        } else if (w.e != null) {
                            weekday = w.e + dow;
                            if (w.e < 0 || w.e > 6) {
                                weekdayOverflow = true;
                            }
                        } else {
                            weekday = dow;
                        }
                    }
                    if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
                        getParsingFlags(config)._overflowWeeks = true;
                    } else if (weekdayOverflow != null) {
                        getParsingFlags(config)._overflowWeekday = true;
                    } else {
                        temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
                        config._a[YEAR] = temp.year;
                        config._dayOfYear = temp.dayOfYear;
                    }
                }
                var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
                var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
                var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;
                var isoDates = [ [ "YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/ ], [ "YYYY-MM-DD", /\d{4}-\d\d-\d\d/ ], [ "GGGG-[W]WW-E", /\d{4}-W\d\d-\d/ ], [ "GGGG-[W]WW", /\d{4}-W\d\d/, false ], [ "YYYY-DDD", /\d{4}-\d{3}/ ], [ "YYYY-MM", /\d{4}-\d\d/, false ], [ "YYYYYYMMDD", /[+-]\d{10}/ ], [ "YYYYMMDD", /\d{8}/ ], [ "GGGG[W]WWE", /\d{4}W\d{3}/ ], [ "GGGG[W]WW", /\d{4}W\d{2}/, false ], [ "YYYYDDD", /\d{7}/ ] ];
                var isoTimes = [ [ "HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/ ], [ "HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/ ], [ "HH:mm:ss", /\d\d:\d\d:\d\d/ ], [ "HH:mm", /\d\d:\d\d/ ], [ "HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/ ], [ "HHmmss,SSSS", /\d\d\d\d\d\d,\d+/ ], [ "HHmmss", /\d\d\d\d\d\d/ ], [ "HHmm", /\d\d\d\d/ ], [ "HH", /\d\d/ ] ];
                var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
                function configFromISO(config) {
                    var i, l, string = config._i, match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string), allowTime, dateFormat, timeFormat, tzFormat;
                    if (match) {
                        getParsingFlags(config).iso = true;
                        for (i = 0, l = isoDates.length; i < l; i++) {
                            if (isoDates[i][1].exec(match[1])) {
                                dateFormat = isoDates[i][0];
                                allowTime = isoDates[i][2] !== false;
                                break;
                            }
                        }
                        if (dateFormat == null) {
                            config._isValid = false;
                            return;
                        }
                        if (match[3]) {
                            for (i = 0, l = isoTimes.length; i < l; i++) {
                                if (isoTimes[i][1].exec(match[3])) {
                                    timeFormat = (match[2] || " ") + isoTimes[i][0];
                                    break;
                                }
                            }
                            if (timeFormat == null) {
                                config._isValid = false;
                                return;
                            }
                        }
                        if (!allowTime && timeFormat != null) {
                            config._isValid = false;
                            return;
                        }
                        if (match[4]) {
                            if (tzRegex.exec(match[4])) {
                                tzFormat = "Z";
                            } else {
                                config._isValid = false;
                                return;
                            }
                        }
                        config._f = dateFormat + (timeFormat || "") + (tzFormat || "");
                        configFromStringAndFormat(config);
                    } else {
                        config._isValid = false;
                    }
                }
                var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;
                function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
                    var result = [ untruncateYear(yearStr), defaultLocaleMonthsShort.indexOf(monthStr), parseInt(dayStr, 10), parseInt(hourStr, 10), parseInt(minuteStr, 10) ];
                    if (secondStr) {
                        result.push(parseInt(secondStr, 10));
                    }
                    return result;
                }
                function untruncateYear(yearStr) {
                    var year = parseInt(yearStr, 10);
                    if (year <= 49) {
                        return 2e3 + year;
                    } else if (year <= 999) {
                        return 1900 + year;
                    }
                    return year;
                }
                function preprocessRFC2822(s) {
                    return s.replace(/\([^)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
                }
                function checkWeekday(weekdayStr, parsedInput, config) {
                    if (weekdayStr) {
                        var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr), weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
                        if (weekdayProvided !== weekdayActual) {
                            getParsingFlags(config).weekdayMismatch = true;
                            config._isValid = false;
                            return false;
                        }
                    }
                    return true;
                }
                var obsOffsets = {
                    UT: 0,
                    GMT: 0,
                    EDT: -4 * 60,
                    EST: -5 * 60,
                    CDT: -5 * 60,
                    CST: -6 * 60,
                    MDT: -6 * 60,
                    MST: -7 * 60,
                    PDT: -7 * 60,
                    PST: -8 * 60
                };
                function calculateOffset(obsOffset, militaryOffset, numOffset) {
                    if (obsOffset) {
                        return obsOffsets[obsOffset];
                    } else if (militaryOffset) {
                        return 0;
                    } else {
                        var hm = parseInt(numOffset, 10);
                        var m = hm % 100, h = (hm - m) / 100;
                        return h * 60 + m;
                    }
                }
                function configFromRFC2822(config) {
                    var match = rfc2822.exec(preprocessRFC2822(config._i));
                    if (match) {
                        var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
                        if (!checkWeekday(match[1], parsedArray, config)) {
                            return;
                        }
                        config._a = parsedArray;
                        config._tzm = calculateOffset(match[8], match[9], match[10]);
                        config._d = createUTCDate.apply(null, config._a);
                        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
                        getParsingFlags(config).rfc2822 = true;
                    } else {
                        config._isValid = false;
                    }
                }
                function configFromString(config) {
                    var matched = aspNetJsonRegex.exec(config._i);
                    if (matched !== null) {
                        config._d = new Date(+matched[1]);
                        return;
                    }
                    configFromISO(config);
                    if (config._isValid === false) {
                        delete config._isValid;
                    } else {
                        return;
                    }
                    configFromRFC2822(config);
                    if (config._isValid === false) {
                        delete config._isValid;
                    } else {
                        return;
                    }
                    hooks.createFromInputFallback(config);
                }
                hooks.createFromInputFallback = deprecate("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), " + "which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are " + "discouraged and will be removed in an upcoming major release. Please refer to " + "http://momentjs.com/guides/#/warnings/js-date/ for more info.", function(config) {
                    config._d = new Date(config._i + (config._useUTC ? " UTC" : ""));
                });
                hooks.ISO_8601 = function() {};
                hooks.RFC_2822 = function() {};
                function configFromStringAndFormat(config) {
                    if (config._f === hooks.ISO_8601) {
                        configFromISO(config);
                        return;
                    }
                    if (config._f === hooks.RFC_2822) {
                        configFromRFC2822(config);
                        return;
                    }
                    config._a = [];
                    getParsingFlags(config).empty = true;
                    var string = "" + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
                    tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
                    for (i = 0; i < tokens.length; i++) {
                        token = tokens[i];
                        parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
                        if (parsedInput) {
                            skipped = string.substr(0, string.indexOf(parsedInput));
                            if (skipped.length > 0) {
                                getParsingFlags(config).unusedInput.push(skipped);
                            }
                            string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                            totalParsedInputLength += parsedInput.length;
                        }
                        if (formatTokenFunctions[token]) {
                            if (parsedInput) {
                                getParsingFlags(config).empty = false;
                            } else {
                                getParsingFlags(config).unusedTokens.push(token);
                            }
                            addTimeToArrayFromToken(token, parsedInput, config);
                        } else if (config._strict && !parsedInput) {
                            getParsingFlags(config).unusedTokens.push(token);
                        }
                    }
                    getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
                    if (string.length > 0) {
                        getParsingFlags(config).unusedInput.push(string);
                    }
                    if (config._a[HOUR] <= 12 && getParsingFlags(config).bigHour === true && config._a[HOUR] > 0) {
                        getParsingFlags(config).bigHour = undefined;
                    }
                    getParsingFlags(config).parsedDateParts = config._a.slice(0);
                    getParsingFlags(config).meridiem = config._meridiem;
                    config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
                    configFromArray(config);
                    checkOverflow(config);
                }
                function meridiemFixWrap(locale, hour, meridiem) {
                    var isPm;
                    if (meridiem == null) {
                        return hour;
                    }
                    if (locale.meridiemHour != null) {
                        return locale.meridiemHour(hour, meridiem);
                    } else if (locale.isPM != null) {
                        isPm = locale.isPM(meridiem);
                        if (isPm && hour < 12) {
                            hour += 12;
                        }
                        if (!isPm && hour === 12) {
                            hour = 0;
                        }
                        return hour;
                    } else {
                        return hour;
                    }
                }
                function configFromStringAndArray(config) {
                    var tempConfig, bestMoment, scoreToBeat, i, currentScore;
                    if (config._f.length === 0) {
                        getParsingFlags(config).invalidFormat = true;
                        config._d = new Date(NaN);
                        return;
                    }
                    for (i = 0; i < config._f.length; i++) {
                        currentScore = 0;
                        tempConfig = copyConfig({}, config);
                        if (config._useUTC != null) {
                            tempConfig._useUTC = config._useUTC;
                        }
                        tempConfig._f = config._f[i];
                        configFromStringAndFormat(tempConfig);
                        if (!isValid(tempConfig)) {
                            continue;
                        }
                        currentScore += getParsingFlags(tempConfig).charsLeftOver;
                        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
                        getParsingFlags(tempConfig).score = currentScore;
                        if (scoreToBeat == null || currentScore < scoreToBeat) {
                            scoreToBeat = currentScore;
                            bestMoment = tempConfig;
                        }
                    }
                    extend(config, bestMoment || tempConfig);
                }
                function configFromObject(config) {
                    if (config._d) {
                        return;
                    }
                    var i = normalizeObjectUnits(config._i);
                    config._a = map([ i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond ], function(obj) {
                        return obj && parseInt(obj, 10);
                    });
                    configFromArray(config);
                }
                function createFromConfig(config) {
                    var res = new Moment(checkOverflow(prepareConfig(config)));
                    if (res._nextDay) {
                        res.add(1, "d");
                        res._nextDay = undefined;
                    }
                    return res;
                }
                function prepareConfig(config) {
                    var input = config._i, format = config._f;
                    config._locale = config._locale || getLocale(config._l);
                    if (input === null || format === undefined && input === "") {
                        return createInvalid({
                            nullInput: true
                        });
                    }
                    if (typeof input === "string") {
                        config._i = input = config._locale.preparse(input);
                    }
                    if (isMoment(input)) {
                        return new Moment(checkOverflow(input));
                    } else if (isDate(input)) {
                        config._d = input;
                    } else if (isArray(format)) {
                        configFromStringAndArray(config);
                    } else if (format) {
                        configFromStringAndFormat(config);
                    } else {
                        configFromInput(config);
                    }
                    if (!isValid(config)) {
                        config._d = null;
                    }
                    return config;
                }
                function configFromInput(config) {
                    var input = config._i;
                    if (isUndefined(input)) {
                        config._d = new Date(hooks.now());
                    } else if (isDate(input)) {
                        config._d = new Date(input.valueOf());
                    } else if (typeof input === "string") {
                        configFromString(config);
                    } else if (isArray(input)) {
                        config._a = map(input.slice(0), function(obj) {
                            return parseInt(obj, 10);
                        });
                        configFromArray(config);
                    } else if (isObject(input)) {
                        configFromObject(config);
                    } else if (isNumber(input)) {
                        config._d = new Date(input);
                    } else {
                        hooks.createFromInputFallback(config);
                    }
                }
                function createLocalOrUTC(input, format, locale, strict, isUTC) {
                    var c = {};
                    if (locale === true || locale === false) {
                        strict = locale;
                        locale = undefined;
                    }
                    if (isObject(input) && isObjectEmpty(input) || isArray(input) && input.length === 0) {
                        input = undefined;
                    }
                    c._isAMomentObject = true;
                    c._useUTC = c._isUTC = isUTC;
                    c._l = locale;
                    c._i = input;
                    c._f = format;
                    c._strict = strict;
                    return createFromConfig(c);
                }
                function createLocal(input, format, locale, strict) {
                    return createLocalOrUTC(input, format, locale, strict, false);
                }
                var prototypeMin = deprecate("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
                    var other = createLocal.apply(null, arguments);
                    if (this.isValid() && other.isValid()) {
                        return other < this ? this : other;
                    } else {
                        return createInvalid();
                    }
                });
                var prototypeMax = deprecate("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
                    var other = createLocal.apply(null, arguments);
                    if (this.isValid() && other.isValid()) {
                        return other > this ? this : other;
                    } else {
                        return createInvalid();
                    }
                });
                function pickBy(fn, moments) {
                    var res, i;
                    if (moments.length === 1 && isArray(moments[0])) {
                        moments = moments[0];
                    }
                    if (!moments.length) {
                        return createLocal();
                    }
                    res = moments[0];
                    for (i = 1; i < moments.length; ++i) {
                        if (!moments[i].isValid() || moments[i][fn](res)) {
                            res = moments[i];
                        }
                    }
                    return res;
                }
                function min() {
                    var args = [].slice.call(arguments, 0);
                    return pickBy("isBefore", args);
                }
                function max() {
                    var args = [].slice.call(arguments, 0);
                    return pickBy("isAfter", args);
                }
                var now = function() {
                    return Date.now ? Date.now() : +new Date();
                };
                var ordering = [ "year", "quarter", "month", "week", "day", "hour", "minute", "second", "millisecond" ];
                function isDurationValid(m) {
                    for (var key in m) {
                        if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                            return false;
                        }
                    }
                    var unitHasDecimal = false;
                    for (var i = 0; i < ordering.length; ++i) {
                        if (m[ordering[i]]) {
                            if (unitHasDecimal) {
                                return false;
                            }
                            if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                                unitHasDecimal = true;
                            }
                        }
                    }
                    return true;
                }
                function isValid$1() {
                    return this._isValid;
                }
                function createInvalid$1() {
                    return createDuration(NaN);
                }
                function Duration(duration) {
                    var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
                    this._isValid = isDurationValid(normalizedInput);
                    this._milliseconds = +milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 1e3 * 60 * 60;
                    this._days = +days + weeks * 7;
                    this._months = +months + quarters * 3 + years * 12;
                    this._data = {};
                    this._locale = getLocale();
                    this._bubble();
                }
                function isDuration(obj) {
                    return obj instanceof Duration;
                }
                function absRound(number) {
                    if (number < 0) {
                        return Math.round(-1 * number) * -1;
                    } else {
                        return Math.round(number);
                    }
                }
                function offset(token, separator) {
                    addFormatToken(token, 0, 0, function() {
                        var offset = this.utcOffset();
                        var sign = "+";
                        if (offset < 0) {
                            offset = -offset;
                            sign = "-";
                        }
                        return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~offset % 60, 2);
                    });
                }
                offset("Z", ":");
                offset("ZZ", "");
                addRegexToken("Z", matchShortOffset);
                addRegexToken("ZZ", matchShortOffset);
                addParseToken([ "Z", "ZZ" ], function(input, array, config) {
                    config._useUTC = true;
                    config._tzm = offsetFromString(matchShortOffset, input);
                });
                var chunkOffset = /([\+\-]|\d\d)/gi;
                function offsetFromString(matcher, string) {
                    var matches = (string || "").match(matcher);
                    if (matches === null) {
                        return null;
                    }
                    var chunk = matches[matches.length - 1] || [];
                    var parts = (chunk + "").match(chunkOffset) || [ "-", 0, 0 ];
                    var minutes = +(parts[1] * 60) + toInt(parts[2]);
                    return minutes === 0 ? 0 : parts[0] === "+" ? minutes : -minutes;
                }
                function cloneWithOffset(input, model) {
                    var res, diff;
                    if (model._isUTC) {
                        res = model.clone();
                        diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
                        res._d.setTime(res._d.valueOf() + diff);
                        hooks.updateOffset(res, false);
                        return res;
                    } else {
                        return createLocal(input).local();
                    }
                }
                function getDateOffset(m) {
                    return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
                }
                hooks.updateOffset = function() {};
                function getSetOffset(input, keepLocalTime, keepMinutes) {
                    var offset = this._offset || 0, localAdjust;
                    if (!this.isValid()) {
                        return input != null ? this : NaN;
                    }
                    if (input != null) {
                        if (typeof input === "string") {
                            input = offsetFromString(matchShortOffset, input);
                            if (input === null) {
                                return this;
                            }
                        } else if (Math.abs(input) < 16 && !keepMinutes) {
                            input = input * 60;
                        }
                        if (!this._isUTC && keepLocalTime) {
                            localAdjust = getDateOffset(this);
                        }
                        this._offset = input;
                        this._isUTC = true;
                        if (localAdjust != null) {
                            this.add(localAdjust, "m");
                        }
                        if (offset !== input) {
                            if (!keepLocalTime || this._changeInProgress) {
                                addSubtract(this, createDuration(input - offset, "m"), 1, false);
                            } else if (!this._changeInProgress) {
                                this._changeInProgress = true;
                                hooks.updateOffset(this, true);
                                this._changeInProgress = null;
                            }
                        }
                        return this;
                    } else {
                        return this._isUTC ? offset : getDateOffset(this);
                    }
                }
                function getSetZone(input, keepLocalTime) {
                    if (input != null) {
                        if (typeof input !== "string") {
                            input = -input;
                        }
                        this.utcOffset(input, keepLocalTime);
                        return this;
                    } else {
                        return -this.utcOffset();
                    }
                }
                function setOffsetToUTC(keepLocalTime) {
                    return this.utcOffset(0, keepLocalTime);
                }
                function setOffsetToLocal(keepLocalTime) {
                    if (this._isUTC) {
                        this.utcOffset(0, keepLocalTime);
                        this._isUTC = false;
                        if (keepLocalTime) {
                            this.subtract(getDateOffset(this), "m");
                        }
                    }
                    return this;
                }
                function setOffsetToParsedOffset() {
                    if (this._tzm != null) {
                        this.utcOffset(this._tzm, false, true);
                    } else if (typeof this._i === "string") {
                        var tZone = offsetFromString(matchOffset, this._i);
                        if (tZone != null) {
                            this.utcOffset(tZone);
                        } else {
                            this.utcOffset(0, true);
                        }
                    }
                    return this;
                }
                function hasAlignedHourOffset(input) {
                    if (!this.isValid()) {
                        return false;
                    }
                    input = input ? createLocal(input).utcOffset() : 0;
                    return (this.utcOffset() - input) % 60 === 0;
                }
                function isDaylightSavingTime() {
                    return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
                }
                function isDaylightSavingTimeShifted() {
                    if (!isUndefined(this._isDSTShifted)) {
                        return this._isDSTShifted;
                    }
                    var c = {};
                    copyConfig(c, this);
                    c = prepareConfig(c);
                    if (c._a) {
                        var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
                        this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
                    } else {
                        this._isDSTShifted = false;
                    }
                    return this._isDSTShifted;
                }
                function isLocal() {
                    return this.isValid() ? !this._isUTC : false;
                }
                function isUtcOffset() {
                    return this.isValid() ? this._isUTC : false;
                }
                function isUtc() {
                    return this.isValid() ? this._isUTC && this._offset === 0 : false;
                }
                var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;
                var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
                function createDuration(input, key) {
                    var duration = input, match = null, sign, ret, diffRes;
                    if (isDuration(input)) {
                        duration = {
                            ms: input._milliseconds,
                            d: input._days,
                            M: input._months
                        };
                    } else if (isNumber(input)) {
                        duration = {};
                        if (key) {
                            duration[key] = input;
                        } else {
                            duration.milliseconds = input;
                        }
                    } else if (!!(match = aspNetRegex.exec(input))) {
                        sign = match[1] === "-" ? -1 : 1;
                        duration = {
                            y: 0,
                            d: toInt(match[DATE]) * sign,
                            h: toInt(match[HOUR]) * sign,
                            m: toInt(match[MINUTE]) * sign,
                            s: toInt(match[SECOND]) * sign,
                            ms: toInt(absRound(match[MILLISECOND] * 1e3)) * sign
                        };
                    } else if (!!(match = isoRegex.exec(input))) {
                        sign = match[1] === "-" ? -1 : match[1] === "+" ? 1 : 1;
                        duration = {
                            y: parseIso(match[2], sign),
                            M: parseIso(match[3], sign),
                            w: parseIso(match[4], sign),
                            d: parseIso(match[5], sign),
                            h: parseIso(match[6], sign),
                            m: parseIso(match[7], sign),
                            s: parseIso(match[8], sign)
                        };
                    } else if (duration == null) {
                        duration = {};
                    } else if (typeof duration === "object" && ("from" in duration || "to" in duration)) {
                        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
                        duration = {};
                        duration.ms = diffRes.milliseconds;
                        duration.M = diffRes.months;
                    }
                    ret = new Duration(duration);
                    if (isDuration(input) && hasOwnProp(input, "_locale")) {
                        ret._locale = input._locale;
                    }
                    return ret;
                }
                createDuration.fn = Duration.prototype;
                createDuration.invalid = createInvalid$1;
                function parseIso(inp, sign) {
                    var res = inp && parseFloat(inp.replace(",", "."));
                    return (isNaN(res) ? 0 : res) * sign;
                }
                function positiveMomentsDifference(base, other) {
                    var res = {
                        milliseconds: 0,
                        months: 0
                    };
                    res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
                    if (base.clone().add(res.months, "M").isAfter(other)) {
                        --res.months;
                    }
                    res.milliseconds = +other - +base.clone().add(res.months, "M");
                    return res;
                }
                function momentsDifference(base, other) {
                    var res;
                    if (!(base.isValid() && other.isValid())) {
                        return {
                            milliseconds: 0,
                            months: 0
                        };
                    }
                    other = cloneWithOffset(other, base);
                    if (base.isBefore(other)) {
                        res = positiveMomentsDifference(base, other);
                    } else {
                        res = positiveMomentsDifference(other, base);
                        res.milliseconds = -res.milliseconds;
                        res.months = -res.months;
                    }
                    return res;
                }
                function createAdder(direction, name) {
                    return function(val, period) {
                        var dur, tmp;
                        if (period !== null && !isNaN(+period)) {
                            deprecateSimple(name, "moment()." + name + "(period, number) is deprecated. Please use moment()." + name + "(number, period). " + "See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.");
                            tmp = val;
                            val = period;
                            period = tmp;
                        }
                        val = typeof val === "string" ? +val : val;
                        dur = createDuration(val, period);
                        addSubtract(this, dur, direction);
                        return this;
                    };
                }
                function addSubtract(mom, duration, isAdding, updateOffset) {
                    var milliseconds = duration._milliseconds, days = absRound(duration._days), months = absRound(duration._months);
                    if (!mom.isValid()) {
                        return;
                    }
                    updateOffset = updateOffset == null ? true : updateOffset;
                    if (months) {
                        setMonth(mom, get(mom, "Month") + months * isAdding);
                    }
                    if (days) {
                        set$1(mom, "Date", get(mom, "Date") + days * isAdding);
                    }
                    if (milliseconds) {
                        mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
                    }
                    if (updateOffset) {
                        hooks.updateOffset(mom, days || months);
                    }
                }
                var add = createAdder(1, "add");
                var subtract = createAdder(-1, "subtract");
                function getCalendarFormat(myMoment, now) {
                    var diff = myMoment.diff(now, "days", true);
                    return diff < -6 ? "sameElse" : diff < -1 ? "lastWeek" : diff < 0 ? "lastDay" : diff < 1 ? "sameDay" : diff < 2 ? "nextDay" : diff < 7 ? "nextWeek" : "sameElse";
                }
                function calendar$1(time, formats) {
                    var now = time || createLocal(), sod = cloneWithOffset(now, this).startOf("day"), format = hooks.calendarFormat(this, sod) || "sameElse";
                    var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);
                    return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
                }
                function clone() {
                    return new Moment(this);
                }
                function isAfter(input, units) {
                    var localInput = isMoment(input) ? input : createLocal(input);
                    if (!(this.isValid() && localInput.isValid())) {
                        return false;
                    }
                    units = normalizeUnits(!isUndefined(units) ? units : "millisecond");
                    if (units === "millisecond") {
                        return this.valueOf() > localInput.valueOf();
                    } else {
                        return localInput.valueOf() < this.clone().startOf(units).valueOf();
                    }
                }
                function isBefore(input, units) {
                    var localInput = isMoment(input) ? input : createLocal(input);
                    if (!(this.isValid() && localInput.isValid())) {
                        return false;
                    }
                    units = normalizeUnits(!isUndefined(units) ? units : "millisecond");
                    if (units === "millisecond") {
                        return this.valueOf() < localInput.valueOf();
                    } else {
                        return this.clone().endOf(units).valueOf() < localInput.valueOf();
                    }
                }
                function isBetween(from, to, units, inclusivity) {
                    inclusivity = inclusivity || "()";
                    return (inclusivity[0] === "(" ? this.isAfter(from, units) : !this.isBefore(from, units)) && (inclusivity[1] === ")" ? this.isBefore(to, units) : !this.isAfter(to, units));
                }
                function isSame(input, units) {
                    var localInput = isMoment(input) ? input : createLocal(input), inputMs;
                    if (!(this.isValid() && localInput.isValid())) {
                        return false;
                    }
                    units = normalizeUnits(units || "millisecond");
                    if (units === "millisecond") {
                        return this.valueOf() === localInput.valueOf();
                    } else {
                        inputMs = localInput.valueOf();
                        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
                    }
                }
                function isSameOrAfter(input, units) {
                    return this.isSame(input, units) || this.isAfter(input, units);
                }
                function isSameOrBefore(input, units) {
                    return this.isSame(input, units) || this.isBefore(input, units);
                }
                function diff(input, units, asFloat) {
                    var that, zoneDelta, delta, output;
                    if (!this.isValid()) {
                        return NaN;
                    }
                    that = cloneWithOffset(input, this);
                    if (!that.isValid()) {
                        return NaN;
                    }
                    zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;
                    units = normalizeUnits(units);
                    switch (units) {
                      case "year":
                        output = monthDiff(this, that) / 12;
                        break;

                      case "month":
                        output = monthDiff(this, that);
                        break;

                      case "quarter":
                        output = monthDiff(this, that) / 3;
                        break;

                      case "second":
                        output = (this - that) / 1e3;
                        break;

                      case "minute":
                        output = (this - that) / 6e4;
                        break;

                      case "hour":
                        output = (this - that) / 36e5;
                        break;

                      case "day":
                        output = (this - that - zoneDelta) / 864e5;
                        break;

                      case "week":
                        output = (this - that - zoneDelta) / 6048e5;
                        break;

                      default:
                        output = this - that;
                    }
                    return asFloat ? output : absFloor(output);
                }
                function monthDiff(a, b) {
                    var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()), anchor = a.clone().add(wholeMonthDiff, "months"), anchor2, adjust;
                    if (b - anchor < 0) {
                        anchor2 = a.clone().add(wholeMonthDiff - 1, "months");
                        adjust = (b - anchor) / (anchor - anchor2);
                    } else {
                        anchor2 = a.clone().add(wholeMonthDiff + 1, "months");
                        adjust = (b - anchor) / (anchor2 - anchor);
                    }
                    return -(wholeMonthDiff + adjust) || 0;
                }
                hooks.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
                hooks.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
                function toString() {
                    return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
                }
                function toISOString() {
                    if (!this.isValid()) {
                        return null;
                    }
                    var m = this.clone().utc();
                    if (m.year() < 0 || m.year() > 9999) {
                        return formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
                    }
                    if (isFunction(Date.prototype.toISOString)) {
                        return this.toDate().toISOString();
                    }
                    return formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
                }
                function inspect() {
                    if (!this.isValid()) {
                        return "moment.invalid(/* " + this._i + " */)";
                    }
                    var func = "moment";
                    var zone = "";
                    if (!this.isLocal()) {
                        func = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone";
                        zone = "Z";
                    }
                    var prefix = "[" + func + '("]';
                    var year = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY";
                    var datetime = "-MM-DD[T]HH:mm:ss.SSS";
                    var suffix = zone + '[")]';
                    return this.format(prefix + year + datetime + suffix);
                }
                function format(inputString) {
                    if (!inputString) {
                        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
                    }
                    var output = formatMoment(this, inputString);
                    return this.localeData().postformat(output);
                }
                function from(time, withoutSuffix) {
                    if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
                        return createDuration({
                            to: this,
                            from: time
                        }).locale(this.locale()).humanize(!withoutSuffix);
                    } else {
                        return this.localeData().invalidDate();
                    }
                }
                function fromNow(withoutSuffix) {
                    return this.from(createLocal(), withoutSuffix);
                }
                function to(time, withoutSuffix) {
                    if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
                        return createDuration({
                            from: this,
                            to: time
                        }).locale(this.locale()).humanize(!withoutSuffix);
                    } else {
                        return this.localeData().invalidDate();
                    }
                }
                function toNow(withoutSuffix) {
                    return this.to(createLocal(), withoutSuffix);
                }
                function locale(key) {
                    var newLocaleData;
                    if (key === undefined) {
                        return this._locale._abbr;
                    } else {
                        newLocaleData = getLocale(key);
                        if (newLocaleData != null) {
                            this._locale = newLocaleData;
                        }
                        return this;
                    }
                }
                var lang = deprecate("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(key) {
                    if (key === undefined) {
                        return this.localeData();
                    } else {
                        return this.locale(key);
                    }
                });
                function localeData() {
                    return this._locale;
                }
                function startOf(units) {
                    units = normalizeUnits(units);
                    switch (units) {
                      case "year":
                        this.month(0);

                      case "quarter":
                      case "month":
                        this.date(1);

                      case "week":
                      case "isoWeek":
                      case "day":
                      case "date":
                        this.hours(0);

                      case "hour":
                        this.minutes(0);

                      case "minute":
                        this.seconds(0);

                      case "second":
                        this.milliseconds(0);
                    }
                    if (units === "week") {
                        this.weekday(0);
                    }
                    if (units === "isoWeek") {
                        this.isoWeekday(1);
                    }
                    if (units === "quarter") {
                        this.month(Math.floor(this.month() / 3) * 3);
                    }
                    return this;
                }
                function endOf(units) {
                    units = normalizeUnits(units);
                    if (units === undefined || units === "millisecond") {
                        return this;
                    }
                    if (units === "date") {
                        units = "day";
                    }
                    return this.startOf(units).add(1, units === "isoWeek" ? "week" : units).subtract(1, "ms");
                }
                function valueOf() {
                    return this._d.valueOf() - (this._offset || 0) * 6e4;
                }
                function unix() {
                    return Math.floor(this.valueOf() / 1e3);
                }
                function toDate() {
                    return new Date(this.valueOf());
                }
                function toArray() {
                    var m = this;
                    return [ m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond() ];
                }
                function toObject() {
                    var m = this;
                    return {
                        years: m.year(),
                        months: m.month(),
                        date: m.date(),
                        hours: m.hours(),
                        minutes: m.minutes(),
                        seconds: m.seconds(),
                        milliseconds: m.milliseconds()
                    };
                }
                function toJSON() {
                    return this.isValid() ? this.toISOString() : null;
                }
                function isValid$2() {
                    return isValid(this);
                }
                function parsingFlags() {
                    return extend({}, getParsingFlags(this));
                }
                function invalidAt() {
                    return getParsingFlags(this).overflow;
                }
                function creationData() {
                    return {
                        input: this._i,
                        format: this._f,
                        locale: this._locale,
                        isUTC: this._isUTC,
                        strict: this._strict
                    };
                }
                addFormatToken(0, [ "gg", 2 ], 0, function() {
                    return this.weekYear() % 100;
                });
                addFormatToken(0, [ "GG", 2 ], 0, function() {
                    return this.isoWeekYear() % 100;
                });
                function addWeekYearFormatToken(token, getter) {
                    addFormatToken(0, [ token, token.length ], 0, getter);
                }
                addWeekYearFormatToken("gggg", "weekYear");
                addWeekYearFormatToken("ggggg", "weekYear");
                addWeekYearFormatToken("GGGG", "isoWeekYear");
                addWeekYearFormatToken("GGGGG", "isoWeekYear");
                addUnitAlias("weekYear", "gg");
                addUnitAlias("isoWeekYear", "GG");
                addUnitPriority("weekYear", 1);
                addUnitPriority("isoWeekYear", 1);
                addRegexToken("G", matchSigned);
                addRegexToken("g", matchSigned);
                addRegexToken("GG", match1to2, match2);
                addRegexToken("gg", match1to2, match2);
                addRegexToken("GGGG", match1to4, match4);
                addRegexToken("gggg", match1to4, match4);
                addRegexToken("GGGGG", match1to6, match6);
                addRegexToken("ggggg", match1to6, match6);
                addWeekParseToken([ "gggg", "ggggg", "GGGG", "GGGGG" ], function(input, week, config, token) {
                    week[token.substr(0, 2)] = toInt(input);
                });
                addWeekParseToken([ "gg", "GG" ], function(input, week, config, token) {
                    week[token] = hooks.parseTwoDigitYear(input);
                });
                function getSetWeekYear(input) {
                    return getSetWeekYearHelper.call(this, input, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
                }
                function getSetISOWeekYear(input) {
                    return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
                }
                function getISOWeeksInYear() {
                    return weeksInYear(this.year(), 1, 4);
                }
                function getWeeksInYear() {
                    var weekInfo = this.localeData()._week;
                    return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
                }
                function getSetWeekYearHelper(input, week, weekday, dow, doy) {
                    var weeksTarget;
                    if (input == null) {
                        return weekOfYear(this, dow, doy).year;
                    } else {
                        weeksTarget = weeksInYear(input, dow, doy);
                        if (week > weeksTarget) {
                            week = weeksTarget;
                        }
                        return setWeekAll.call(this, input, week, weekday, dow, doy);
                    }
                }
                function setWeekAll(weekYear, week, weekday, dow, doy) {
                    var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy), date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
                    this.year(date.getUTCFullYear());
                    this.month(date.getUTCMonth());
                    this.date(date.getUTCDate());
                    return this;
                }
                addFormatToken("Q", 0, "Qo", "quarter");
                addUnitAlias("quarter", "Q");
                addUnitPriority("quarter", 7);
                addRegexToken("Q", match1);
                addParseToken("Q", function(input, array) {
                    array[MONTH] = (toInt(input) - 1) * 3;
                });
                function getSetQuarter(input) {
                    return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
                }
                addFormatToken("D", [ "DD", 2 ], "Do", "date");
                addUnitAlias("date", "D");
                addUnitPriority("date", 9);
                addRegexToken("D", match1to2);
                addRegexToken("DD", match1to2, match2);
                addRegexToken("Do", function(isStrict, locale) {
                    return isStrict ? locale._dayOfMonthOrdinalParse || locale._ordinalParse : locale._dayOfMonthOrdinalParseLenient;
                });
                addParseToken([ "D", "DD" ], DATE);
                addParseToken("Do", function(input, array) {
                    array[DATE] = toInt(input.match(match1to2)[0], 10);
                });
                var getSetDayOfMonth = makeGetSet("Date", true);
                addFormatToken("DDD", [ "DDDD", 3 ], "DDDo", "dayOfYear");
                addUnitAlias("dayOfYear", "DDD");
                addUnitPriority("dayOfYear", 4);
                addRegexToken("DDD", match1to3);
                addRegexToken("DDDD", match3);
                addParseToken([ "DDD", "DDDD" ], function(input, array, config) {
                    config._dayOfYear = toInt(input);
                });
                function getSetDayOfYear(input) {
                    var dayOfYear = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
                    return input == null ? dayOfYear : this.add(input - dayOfYear, "d");
                }
                addFormatToken("m", [ "mm", 2 ], 0, "minute");
                addUnitAlias("minute", "m");
                addUnitPriority("minute", 14);
                addRegexToken("m", match1to2);
                addRegexToken("mm", match1to2, match2);
                addParseToken([ "m", "mm" ], MINUTE);
                var getSetMinute = makeGetSet("Minutes", false);
                addFormatToken("s", [ "ss", 2 ], 0, "second");
                addUnitAlias("second", "s");
                addUnitPriority("second", 15);
                addRegexToken("s", match1to2);
                addRegexToken("ss", match1to2, match2);
                addParseToken([ "s", "ss" ], SECOND);
                var getSetSecond = makeGetSet("Seconds", false);
                addFormatToken("S", 0, 0, function() {
                    return ~~(this.millisecond() / 100);
                });
                addFormatToken(0, [ "SS", 2 ], 0, function() {
                    return ~~(this.millisecond() / 10);
                });
                addFormatToken(0, [ "SSS", 3 ], 0, "millisecond");
                addFormatToken(0, [ "SSSS", 4 ], 0, function() {
                    return this.millisecond() * 10;
                });
                addFormatToken(0, [ "SSSSS", 5 ], 0, function() {
                    return this.millisecond() * 100;
                });
                addFormatToken(0, [ "SSSSSS", 6 ], 0, function() {
                    return this.millisecond() * 1e3;
                });
                addFormatToken(0, [ "SSSSSSS", 7 ], 0, function() {
                    return this.millisecond() * 1e4;
                });
                addFormatToken(0, [ "SSSSSSSS", 8 ], 0, function() {
                    return this.millisecond() * 1e5;
                });
                addFormatToken(0, [ "SSSSSSSSS", 9 ], 0, function() {
                    return this.millisecond() * 1e6;
                });
                addUnitAlias("millisecond", "ms");
                addUnitPriority("millisecond", 16);
                addRegexToken("S", match1to3, match1);
                addRegexToken("SS", match1to3, match2);
                addRegexToken("SSS", match1to3, match3);
                var token;
                for (token = "SSSS"; token.length <= 9; token += "S") {
                    addRegexToken(token, matchUnsigned);
                }
                function parseMs(input, array) {
                    array[MILLISECOND] = toInt(("0." + input) * 1e3);
                }
                for (token = "S"; token.length <= 9; token += "S") {
                    addParseToken(token, parseMs);
                }
                var getSetMillisecond = makeGetSet("Milliseconds", false);
                addFormatToken("z", 0, 0, "zoneAbbr");
                addFormatToken("zz", 0, 0, "zoneName");
                function getZoneAbbr() {
                    return this._isUTC ? "UTC" : "";
                }
                function getZoneName() {
                    return this._isUTC ? "Coordinated Universal Time" : "";
                }
                var proto = Moment.prototype;
                proto.add = add;
                proto.calendar = calendar$1;
                proto.clone = clone;
                proto.diff = diff;
                proto.endOf = endOf;
                proto.format = format;
                proto.from = from;
                proto.fromNow = fromNow;
                proto.to = to;
                proto.toNow = toNow;
                proto.get = stringGet;
                proto.invalidAt = invalidAt;
                proto.isAfter = isAfter;
                proto.isBefore = isBefore;
                proto.isBetween = isBetween;
                proto.isSame = isSame;
                proto.isSameOrAfter = isSameOrAfter;
                proto.isSameOrBefore = isSameOrBefore;
                proto.isValid = isValid$2;
                proto.lang = lang;
                proto.locale = locale;
                proto.localeData = localeData;
                proto.max = prototypeMax;
                proto.min = prototypeMin;
                proto.parsingFlags = parsingFlags;
                proto.set = stringSet;
                proto.startOf = startOf;
                proto.subtract = subtract;
                proto.toArray = toArray;
                proto.toObject = toObject;
                proto.toDate = toDate;
                proto.toISOString = toISOString;
                proto.inspect = inspect;
                proto.toJSON = toJSON;
                proto.toString = toString;
                proto.unix = unix;
                proto.valueOf = valueOf;
                proto.creationData = creationData;
                proto.year = getSetYear;
                proto.isLeapYear = getIsLeapYear;
                proto.weekYear = getSetWeekYear;
                proto.isoWeekYear = getSetISOWeekYear;
                proto.quarter = proto.quarters = getSetQuarter;
                proto.month = getSetMonth;
                proto.daysInMonth = getDaysInMonth;
                proto.week = proto.weeks = getSetWeek;
                proto.isoWeek = proto.isoWeeks = getSetISOWeek;
                proto.weeksInYear = getWeeksInYear;
                proto.isoWeeksInYear = getISOWeeksInYear;
                proto.date = getSetDayOfMonth;
                proto.day = proto.days = getSetDayOfWeek;
                proto.weekday = getSetLocaleDayOfWeek;
                proto.isoWeekday = getSetISODayOfWeek;
                proto.dayOfYear = getSetDayOfYear;
                proto.hour = proto.hours = getSetHour;
                proto.minute = proto.minutes = getSetMinute;
                proto.second = proto.seconds = getSetSecond;
                proto.millisecond = proto.milliseconds = getSetMillisecond;
                proto.utcOffset = getSetOffset;
                proto.utc = setOffsetToUTC;
                proto.local = setOffsetToLocal;
                proto.parseZone = setOffsetToParsedOffset;
                proto.hasAlignedHourOffset = hasAlignedHourOffset;
                proto.isDST = isDaylightSavingTime;
                proto.isLocal = isLocal;
                proto.isUtcOffset = isUtcOffset;
                proto.isUtc = isUtc;
                proto.isUTC = isUtc;
                proto.zoneAbbr = getZoneAbbr;
                proto.zoneName = getZoneName;
                proto.dates = deprecate("dates accessor is deprecated. Use date instead.", getSetDayOfMonth);
                proto.months = deprecate("months accessor is deprecated. Use month instead", getSetMonth);
                proto.years = deprecate("years accessor is deprecated. Use year instead", getSetYear);
                proto.zone = deprecate("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", getSetZone);
                proto.isDSTShifted = deprecate("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", isDaylightSavingTimeShifted);
                function createUnix(input) {
                    return createLocal(input * 1e3);
                }
                function createInZone() {
                    return createLocal.apply(null, arguments).parseZone();
                }
                function preParsePostFormat(string) {
                    return string;
                }
                var proto$1 = Locale.prototype;
                proto$1.calendar = calendar;
                proto$1.longDateFormat = longDateFormat;
                proto$1.invalidDate = invalidDate;
                proto$1.ordinal = ordinal;
                proto$1.preparse = preParsePostFormat;
                proto$1.postformat = preParsePostFormat;
                proto$1.relativeTime = relativeTime;
                proto$1.pastFuture = pastFuture;
                proto$1.set = set;
                proto$1.months = localeMonths;
                proto$1.monthsShort = localeMonthsShort;
                proto$1.monthsParse = localeMonthsParse;
                proto$1.monthsRegex = monthsRegex;
                proto$1.monthsShortRegex = monthsShortRegex;
                proto$1.week = localeWeek;
                proto$1.firstDayOfYear = localeFirstDayOfYear;
                proto$1.firstDayOfWeek = localeFirstDayOfWeek;
                proto$1.weekdays = localeWeekdays;
                proto$1.weekdaysMin = localeWeekdaysMin;
                proto$1.weekdaysShort = localeWeekdaysShort;
                proto$1.weekdaysParse = localeWeekdaysParse;
                proto$1.weekdaysRegex = weekdaysRegex;
                proto$1.weekdaysShortRegex = weekdaysShortRegex;
                proto$1.weekdaysMinRegex = weekdaysMinRegex;
                proto$1.isPM = localeIsPM;
                proto$1.meridiem = localeMeridiem;
                function get$1(format, index, field, setter) {
                    var locale = getLocale();
                    var utc = createUTC().set(setter, index);
                    return locale[field](utc, format);
                }
                function listMonthsImpl(format, index, field) {
                    if (isNumber(format)) {
                        index = format;
                        format = undefined;
                    }
                    format = format || "";
                    if (index != null) {
                        return get$1(format, index, field, "month");
                    }
                    var i;
                    var out = [];
                    for (i = 0; i < 12; i++) {
                        out[i] = get$1(format, i, field, "month");
                    }
                    return out;
                }
                function listWeekdaysImpl(localeSorted, format, index, field) {
                    if (typeof localeSorted === "boolean") {
                        if (isNumber(format)) {
                            index = format;
                            format = undefined;
                        }
                        format = format || "";
                    } else {
                        format = localeSorted;
                        index = format;
                        localeSorted = false;
                        if (isNumber(format)) {
                            index = format;
                            format = undefined;
                        }
                        format = format || "";
                    }
                    var locale = getLocale(), shift = localeSorted ? locale._week.dow : 0;
                    if (index != null) {
                        return get$1(format, (index + shift) % 7, field, "day");
                    }
                    var i;
                    var out = [];
                    for (i = 0; i < 7; i++) {
                        out[i] = get$1(format, (i + shift) % 7, field, "day");
                    }
                    return out;
                }
                function listMonths(format, index) {
                    return listMonthsImpl(format, index, "months");
                }
                function listMonthsShort(format, index) {
                    return listMonthsImpl(format, index, "monthsShort");
                }
                function listWeekdays(localeSorted, format, index) {
                    return listWeekdaysImpl(localeSorted, format, index, "weekdays");
                }
                function listWeekdaysShort(localeSorted, format, index) {
                    return listWeekdaysImpl(localeSorted, format, index, "weekdaysShort");
                }
                function listWeekdaysMin(localeSorted, format, index) {
                    return listWeekdaysImpl(localeSorted, format, index, "weekdaysMin");
                }
                getSetGlobalLocale("en", {
                    dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
                    ordinal: function(number) {
                        var b = number % 10, output = toInt(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
                        return number + output;
                    }
                });
                hooks.lang = deprecate("moment.lang is deprecated. Use moment.locale instead.", getSetGlobalLocale);
                hooks.langData = deprecate("moment.langData is deprecated. Use moment.localeData instead.", getLocale);
                var mathAbs = Math.abs;
                function abs() {
                    var data = this._data;
                    this._milliseconds = mathAbs(this._milliseconds);
                    this._days = mathAbs(this._days);
                    this._months = mathAbs(this._months);
                    data.milliseconds = mathAbs(data.milliseconds);
                    data.seconds = mathAbs(data.seconds);
                    data.minutes = mathAbs(data.minutes);
                    data.hours = mathAbs(data.hours);
                    data.months = mathAbs(data.months);
                    data.years = mathAbs(data.years);
                    return this;
                }
                function addSubtract$1(duration, input, value, direction) {
                    var other = createDuration(input, value);
                    duration._milliseconds += direction * other._milliseconds;
                    duration._days += direction * other._days;
                    duration._months += direction * other._months;
                    return duration._bubble();
                }
                function add$1(input, value) {
                    return addSubtract$1(this, input, value, 1);
                }
                function subtract$1(input, value) {
                    return addSubtract$1(this, input, value, -1);
                }
                function absCeil(number) {
                    if (number < 0) {
                        return Math.floor(number);
                    } else {
                        return Math.ceil(number);
                    }
                }
                function bubble() {
                    var milliseconds = this._milliseconds;
                    var days = this._days;
                    var months = this._months;
                    var data = this._data;
                    var seconds, minutes, hours, years, monthsFromDays;
                    if (!(milliseconds >= 0 && days >= 0 && months >= 0 || milliseconds <= 0 && days <= 0 && months <= 0)) {
                        milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
                        days = 0;
                        months = 0;
                    }
                    data.milliseconds = milliseconds % 1e3;
                    seconds = absFloor(milliseconds / 1e3);
                    data.seconds = seconds % 60;
                    minutes = absFloor(seconds / 60);
                    data.minutes = minutes % 60;
                    hours = absFloor(minutes / 60);
                    data.hours = hours % 24;
                    days += absFloor(hours / 24);
                    monthsFromDays = absFloor(daysToMonths(days));
                    months += monthsFromDays;
                    days -= absCeil(monthsToDays(monthsFromDays));
                    years = absFloor(months / 12);
                    months %= 12;
                    data.days = days;
                    data.months = months;
                    data.years = years;
                    return this;
                }
                function daysToMonths(days) {
                    return days * 4800 / 146097;
                }
                function monthsToDays(months) {
                    return months * 146097 / 4800;
                }
                function as(units) {
                    if (!this.isValid()) {
                        return NaN;
                    }
                    var days;
                    var months;
                    var milliseconds = this._milliseconds;
                    units = normalizeUnits(units);
                    if (units === "month" || units === "year") {
                        days = this._days + milliseconds / 864e5;
                        months = this._months + daysToMonths(days);
                        return units === "month" ? months : months / 12;
                    } else {
                        days = this._days + Math.round(monthsToDays(this._months));
                        switch (units) {
                          case "week":
                            return days / 7 + milliseconds / 6048e5;

                          case "day":
                            return days + milliseconds / 864e5;

                          case "hour":
                            return days * 24 + milliseconds / 36e5;

                          case "minute":
                            return days * 1440 + milliseconds / 6e4;

                          case "second":
                            return days * 86400 + milliseconds / 1e3;

                          case "millisecond":
                            return Math.floor(days * 864e5) + milliseconds;

                          default:
                            throw new Error("Unknown unit " + units);
                        }
                    }
                }
                function valueOf$1() {
                    if (!this.isValid()) {
                        return NaN;
                    }
                    return this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + toInt(this._months / 12) * 31536e6;
                }
                function makeAs(alias) {
                    return function() {
                        return this.as(alias);
                    };
                }
                var asMilliseconds = makeAs("ms");
                var asSeconds = makeAs("s");
                var asMinutes = makeAs("m");
                var asHours = makeAs("h");
                var asDays = makeAs("d");
                var asWeeks = makeAs("w");
                var asMonths = makeAs("M");
                var asYears = makeAs("y");
                function clone$1() {
                    return createDuration(this);
                }
                function get$2(units) {
                    units = normalizeUnits(units);
                    return this.isValid() ? this[units + "s"]() : NaN;
                }
                function makeGetter(name) {
                    return function() {
                        return this.isValid() ? this._data[name] : NaN;
                    };
                }
                var milliseconds = makeGetter("milliseconds");
                var seconds = makeGetter("seconds");
                var minutes = makeGetter("minutes");
                var hours = makeGetter("hours");
                var days = makeGetter("days");
                var months = makeGetter("months");
                var years = makeGetter("years");
                function weeks() {
                    return absFloor(this.days() / 7);
                }
                var round = Math.round;
                var thresholds = {
                    ss: 44,
                    s: 45,
                    m: 45,
                    h: 22,
                    d: 26,
                    M: 11
                };
                function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
                    return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
                }
                function relativeTime$1(posNegDuration, withoutSuffix, locale) {
                    var duration = createDuration(posNegDuration).abs();
                    var seconds = round(duration.as("s"));
                    var minutes = round(duration.as("m"));
                    var hours = round(duration.as("h"));
                    var days = round(duration.as("d"));
                    var months = round(duration.as("M"));
                    var years = round(duration.as("y"));
                    var a = seconds <= thresholds.ss && [ "s", seconds ] || seconds < thresholds.s && [ "ss", seconds ] || minutes <= 1 && [ "m" ] || minutes < thresholds.m && [ "mm", minutes ] || hours <= 1 && [ "h" ] || hours < thresholds.h && [ "hh", hours ] || days <= 1 && [ "d" ] || days < thresholds.d && [ "dd", days ] || months <= 1 && [ "M" ] || months < thresholds.M && [ "MM", months ] || years <= 1 && [ "y" ] || [ "yy", years ];
                    a[2] = withoutSuffix;
                    a[3] = +posNegDuration > 0;
                    a[4] = locale;
                    return substituteTimeAgo.apply(null, a);
                }
                function getSetRelativeTimeRounding(roundingFunction) {
                    if (roundingFunction === undefined) {
                        return round;
                    }
                    if (typeof roundingFunction === "function") {
                        round = roundingFunction;
                        return true;
                    }
                    return false;
                }
                function getSetRelativeTimeThreshold(threshold, limit) {
                    if (thresholds[threshold] === undefined) {
                        return false;
                    }
                    if (limit === undefined) {
                        return thresholds[threshold];
                    }
                    thresholds[threshold] = limit;
                    if (threshold === "s") {
                        thresholds.ss = limit - 1;
                    }
                    return true;
                }
                function humanize(withSuffix) {
                    if (!this.isValid()) {
                        return this.localeData().invalidDate();
                    }
                    var locale = this.localeData();
                    var output = relativeTime$1(this, !withSuffix, locale);
                    if (withSuffix) {
                        output = locale.pastFuture(+this, output);
                    }
                    return locale.postformat(output);
                }
                var abs$1 = Math.abs;
                function sign(x) {
                    return (x > 0) - (x < 0) || +x;
                }
                function toISOString$1() {
                    if (!this.isValid()) {
                        return this.localeData().invalidDate();
                    }
                    var seconds = abs$1(this._milliseconds) / 1e3;
                    var days = abs$1(this._days);
                    var months = abs$1(this._months);
                    var minutes, hours, years;
                    minutes = absFloor(seconds / 60);
                    hours = absFloor(minutes / 60);
                    seconds %= 60;
                    minutes %= 60;
                    years = absFloor(months / 12);
                    months %= 12;
                    var Y = years;
                    var M = months;
                    var D = days;
                    var h = hours;
                    var m = minutes;
                    var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, "") : "";
                    var total = this.asSeconds();
                    if (!total) {
                        return "P0D";
                    }
                    var totalSign = total < 0 ? "-" : "";
                    var ymSign = sign(this._months) !== sign(total) ? "-" : "";
                    var daysSign = sign(this._days) !== sign(total) ? "-" : "";
                    var hmsSign = sign(this._milliseconds) !== sign(total) ? "-" : "";
                    return totalSign + "P" + (Y ? ymSign + Y + "Y" : "") + (M ? ymSign + M + "M" : "") + (D ? daysSign + D + "D" : "") + (h || m || s ? "T" : "") + (h ? hmsSign + h + "H" : "") + (m ? hmsSign + m + "M" : "") + (s ? hmsSign + s + "S" : "");
                }
                var proto$2 = Duration.prototype;
                proto$2.isValid = isValid$1;
                proto$2.abs = abs;
                proto$2.add = add$1;
                proto$2.subtract = subtract$1;
                proto$2.as = as;
                proto$2.asMilliseconds = asMilliseconds;
                proto$2.asSeconds = asSeconds;
                proto$2.asMinutes = asMinutes;
                proto$2.asHours = asHours;
                proto$2.asDays = asDays;
                proto$2.asWeeks = asWeeks;
                proto$2.asMonths = asMonths;
                proto$2.asYears = asYears;
                proto$2.valueOf = valueOf$1;
                proto$2._bubble = bubble;
                proto$2.clone = clone$1;
                proto$2.get = get$2;
                proto$2.milliseconds = milliseconds;
                proto$2.seconds = seconds;
                proto$2.minutes = minutes;
                proto$2.hours = hours;
                proto$2.days = days;
                proto$2.weeks = weeks;
                proto$2.months = months;
                proto$2.years = years;
                proto$2.humanize = humanize;
                proto$2.toISOString = toISOString$1;
                proto$2.toString = toISOString$1;
                proto$2.toJSON = toISOString$1;
                proto$2.locale = locale;
                proto$2.localeData = localeData;
                proto$2.toIsoString = deprecate("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", toISOString$1);
                proto$2.lang = lang;
                addFormatToken("X", 0, 0, "unix");
                addFormatToken("x", 0, 0, "valueOf");
                addRegexToken("x", matchSigned);
                addRegexToken("X", matchTimestamp);
                addParseToken("X", function(input, array, config) {
                    config._d = new Date(parseFloat(input, 10) * 1e3);
                });
                addParseToken("x", function(input, array, config) {
                    config._d = new Date(toInt(input));
                });
                hooks.version = "2.19.2";
                setHookCallback(createLocal);
                hooks.fn = proto;
                hooks.min = min;
                hooks.max = max;
                hooks.now = now;
                hooks.utc = createUTC;
                hooks.unix = createUnix;
                hooks.months = listMonths;
                hooks.isDate = isDate;
                hooks.locale = getSetGlobalLocale;
                hooks.invalid = createInvalid;
                hooks.duration = createDuration;
                hooks.isMoment = isMoment;
                hooks.weekdays = listWeekdays;
                hooks.parseZone = createInZone;
                hooks.localeData = getLocale;
                hooks.isDuration = isDuration;
                hooks.monthsShort = listMonthsShort;
                hooks.weekdaysMin = listWeekdaysMin;
                hooks.defineLocale = defineLocale;
                hooks.updateLocale = updateLocale;
                hooks.locales = listLocales;
                hooks.weekdaysShort = listWeekdaysShort;
                hooks.normalizeUnits = normalizeUnits;
                hooks.relativeTimeRounding = getSetRelativeTimeRounding;
                hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
                hooks.calendarFormat = getCalendarFormat;
                hooks.prototype = proto;
                return hooks;
            });
        }, {} ],
        76: [ function(require, module, exports) {
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
            "performance-now": 77
        } ],
        77: [ function(require, module, exports) {
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
            _process: 8
        } ],
        78: [ function(require, module, exports) {
            "use strict";
            var ejson = require("mongodb-extended-json");
            module.exports = ejson;
        }, {
            "mongodb-extended-json": 33
        } ]
    }, {}, [ 78 ])(78);
});