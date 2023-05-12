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

function f() {
    {
        var error;
        try {
            class c extends(d = function() {
                return {};
            }, d) {}
        } catch (e) {
            error = e;
        }

        if (!error || error.message != "Can't find variable: d")
            throw new Error("Test should have thrown a reference error");
    }

    {
        var error;
        var obj = {};
        Object.defineProperty(obj, 'x', { configurable: false, value: 1 });
        try {
            class c extends(delete obj.x, ()=>{}) {}
        } catch (e) {
            error = e;
        }

        if (!error || error.message != "Unable to delete property.")
            throw new Error("Test should have thrown a type error");
    }

    {
        var error;
        var obj = {};
        Object.defineProperty(obj, 'x', { configurable: false, value: 1 });
        try {
            class c extends(eval('delete obj.x'), class{}) {}
        } catch (e) {
            error = e;
        }

        if (!error || error.message != "Unable to delete property.")
            throw new Error("Test should have thrown a type error");
    }

    {
        var o = {};
        o.__defineGetter__("x", function () { return 42; });
        try {
            class c extends (o.x = 13, class { }) { }
        } catch (e) {
            error = e;
        }

        if (!error || error.message != "Attempted to assign to readonly property.")
            throw new Error("Test should have thrown a type error");
    }
}

 for (var i = 0; i < 10000; i++)
    f();
