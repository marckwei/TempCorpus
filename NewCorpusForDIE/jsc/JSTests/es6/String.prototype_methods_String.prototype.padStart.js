function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

function shouldBe(expected, actual, msg) {
    if (msg === void 0)
        msg = '';
    else
        msg = ' for ' + msg;
    if (actual !== expected)
        throw new Error('bad value' + msg + ': ' + actual + '. Expected ' + expected);
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

(function TestMeta() {
    shouldBe(1, String.prototype.padEnd.length);
    shouldBe("function", typeof String.prototype.padStart);
    shouldBe(Object.getPrototypeOf(Function), Object.getPrototypeOf(String.prototype.padStart));
    shouldBe("padStart", String.prototype.padStart.name);

    var descriptor = Object.getOwnPropertyDescriptor(String.prototype, "padStart");
    shouldBe(undefined, descriptor.get);
    shouldBe(undefined, descriptor.set);
    shouldBe(true, descriptor.configurable);
    shouldBe(false, descriptor.enumerable);
    shouldBe(true, descriptor.writable);
    shouldBe(String.prototype.padStart, descriptor.value);

    shouldThrow(() => new Function(`${String.prototype.padStart}`), "SyntaxError: Unexpected identifier 'code'. Expected either a closing ']' or a ',' following an array element.");
})();

(function TestRequireObjectCoercible() {
    var padStart = String.prototype.padStart;
    shouldThrow(() => padStart.call(null, 4, "test"), "TypeError: String.prototype.padStart requires that |this| not be null or undefined");
    shouldThrow(() => padStart.call(undefined, 4, "test"), "TypeError: String.prototype.padStart requires that |this| not be null or undefined");
    shouldBe("   123", padStart.call({
        __proto__: null,
        valueOf() { return 123; }
    }, 6, " "));

    var proxy = new Proxy({}, {
        get(t, name) {
            if (name === Symbol.toPrimitive || name === "toString") return;
            if (name === "valueOf") return () => 6.7;
            throw new Error("unreachable code");
        }
    });
    shouldBe("   6.7", padStart.call(proxy, 6, " "));

    proxy = new Proxy({}, {
        get(t, name) {
            if (name === Symbol.toPrimitive || name === "valueOf") return;
            if (name === "toString") return () => 6.7;
            throw new Error("unreachable code");
        }
    });
    shouldBe("   6.7", padStart.call(proxy, 6, " "));
})();

(function TestToLength() {
    shouldThrow(() => "123".padStart(Symbol("16")), "TypeError: Cannot convert a symbol to a number");
    shouldBe("123", "123".padStart(-1));
    shouldBe("123", "123".padStart({ toString() { return -1; } }));
    shouldBe("123", "123".padStart(-0));
    shouldBe("123", "123".padStart({ toString() { return -0; } }));
    shouldBe("123", "123".padStart(+0));
    shouldBe("123", "123".padStart({ toString() { return +0; } }));
    shouldBe("123", "123".padStart(NaN));
    shouldBe("123", "123".padStart({ toString() { return NaN; } }));
})();

(function TestFillerToString() {
    shouldBe("         .", ".".padStart(10));
    shouldBe("         .", ".".padStart(10, undefined));
    shouldBe("XXXXXXXXX.", ".".padStart(10, { toString() { return "X"; } }));
    shouldBe("111111111.", ".".padStart(10, { toString: undefined, valueOf() { return 1; } }));
    shouldBe("nullnulln.", ".".padStart(10, null));
})();

(function TestFillerEmptyString() {
    shouldBe(".", ".".padStart(10000, ""));
    shouldBe(".", ".".padStart(10000, { toString() { return ""; } }));
    shouldBe(".", ".".padStart(10000, { toString: undefined, valueOf() { return ""; } }));
})();

(function TestSingleCharacterFiller() {
    shouldBe("!!!!!!!!!.", ".".padStart(10, "!"));
    shouldBe("!!!!!!!!!.", ".".padStart(10, { toString() { return "!"; } }));
    shouldBe("!!!!!!!!!.", ".".padStart(10, "" + "!" + ""));
    shouldBe("!!!!!!!!!.", ".".padStart(10, { toString() { return "" + "!" + ""; } }));
})();

(function TestMemoryLimits() {
    shouldThrow(() => ".".padStart(0x80000000, "o"), "RangeError: Out of memory");
    shouldThrow(() => ".".padStart({ valueOf() { return 0x80000000; } }, "o"), "RangeError: Out of memory");
    shouldThrow(() => ".".padStart("0x80000000", "o"), "RangeError: Out of memory");
})();

(function TestFillerRepetition() {
    for (var i = 2000; i > 0; --i) {
        var expected = "xoxo".repeat(i / 4).slice(0, i - 3) + "123";
        var actual = "123".padStart(i, "xoxo");
        shouldBe(expected, actual);
        shouldBe(i > "123".length ? i : 3, actual.length);
        actual = "123".padStart(i, "xo" + "" + "xo");
        shouldBe(expected, actual);
        shouldBe(i > "123".length ? i : 3, actual.length);
    }
})();
