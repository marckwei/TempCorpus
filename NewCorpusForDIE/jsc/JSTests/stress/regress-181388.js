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

function assert(x) {
    if (!x)
        throw "FAIL";
}

(function() {
    var trace = [];

    var foo = {
        value: 5,
        get bar() {
            trace.push("get");
            return this.value;
        },
        set bar(x) {
            throw "Should not be reached";
        },
        set bar(x) {
            trace.push("set2");
            this.value = x + 10000;
            return this.value;
        }
    }

    assert(foo.value == 5);
    assert(trace == "");
    assert(foo.bar == 5);
    assert(trace == "get");

    foo.bar = 20;
    assert(trace == "get,set2");

    assert(foo.value == 10020);
    assert(trace == "get,set2");
    assert(foo.bar == 10020);
    assert(trace == "get,set2,get");
})();

(function() {
    var trace = [];

    var foo = {
        value: 5,
        set bar(x) {
            trace.push("set");
            this.value = x;
            return this.value;
        },
        get bar() {
            throw "Should not be reached";
        },
        get bar() {
            trace.push("get2");
            this.value += 10000;
            return this.value;
        },
    }

    assert(foo.value == 5);
    assert(trace == "");
    assert(foo.bar == 10005);
    assert(trace == "get2");

    foo.bar = 20;
    assert(trace == "get2,set");

    assert(foo.value == 20);
    assert(trace == "get2,set");
    assert(foo.bar == 10020);
    assert(trace == "get2,set,get2");
})();
