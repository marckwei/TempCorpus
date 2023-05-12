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

(function() {
    // Iterate when the base object's properties shadow properties in the prototype chain.
    var foo = function() {
        var A = function() { };
        A.prototype.x = 42;
        var o = new A();
        o.x = 43;
        var result = "";
        for (var p in o)
            result += o[p];
        return result;
    };
    for (var i = 0; i < 10000; ++i) {
        if (foo() !== "43")
            throw new Error("bad result");
    }
    foo(null);
})();
(function() {
    // Iterate when the prototype has the same range of indexed properties as the base object.
    var foo = function() {
        var A = function() {};
        A.prototype[0] = 42;
        var a = new A();
        a[0] = 43;
        var result = "";
        for (var p in a)
            result += a[p];
        return result;
    };
    noInline(foo);
    for (var i = 0; i < 10000; ++i) {
        if (foo() !== "43")
            throw new Error("bad result");
    }
    foo(null);
})();
(function() {
    // Iterate when the prototype has indexed properties beyond the range of the base object.
    var foo = function() {
        var A = function() {};
        A.prototype[0] = 42;
        A.prototype[1] = 3;
        var a = new A();
        a[0] = 43;
        var result = "";
        for (var p in a)
            result += a[p];
        return result;
    };
    noInline(foo);
    for (var i = 0; i < 10000; ++i) {
        if (foo() !== "433")
            throw new Error("bad result");
    }
    foo(null);
})();
