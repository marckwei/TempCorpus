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
    // Remove a yet-to-be-visited indexed property during iteration.
    var foo = function() {
        var a = [1, 2, 3, 4, 5];
        var result = "";
        for (var p in a) {
            if (p == 2)
                delete a[3];
            result += a[p];
        }
        return result;
    };
    noInline(foo);
    for (var i = 0; i < 10000; ++i) {
        var result = foo();
        if (result !== "1235")
            throw new Error("bad result got: " + result);
    }
    foo(null);
})();
(function() {
    // Remove a yet-to-be-visited non-indexed property during iteration.
    var foo = function() {
        var o = {};
        o.x = "x";
        o.y = "y";
        o.z = "z";
        var result = "";
        for (var p in o) {
            if (p == "x") {
                delete o.y;
                o.a = "a";
            }
            result += o[p];
        }
        return result;
    };
    noInline(foo);
    for (var i = 0; i < 10000; ++i) {
        var result = foo();
        if (result !== "xz")
            throw new Error("bad result: " + result);
    }
})();
(function() {
    // Remove then re-add a property during iteration.
    var foo = function() {
        var A = function() {};
        A.prototype.x = "A.x";
        A.prototype.y = "A.y";
        var o = new A();
        o.z = "o.z";
        o.y = "o.y";
        o.x = "o.x";
        var result = "";
        for (var p in o) {
            if (p == "z")
                delete o.x;
            if (p == "y")
                o.x = "o.x";
            result += o[p];
        }
        return result;
    };
    noInline(foo);
    for (var i = 0; i < 10000; ++i) {
        if (foo() !== "o.zo.yo.x")
            throw new Error("bad result");
    }
    foo(null);
})();
