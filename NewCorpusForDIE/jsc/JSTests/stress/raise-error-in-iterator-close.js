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


function createIterator(callback) {
    var array = [0,1,2,3,4,5];
    var iterator = array[Symbol.iterator]();
    iterator.return = function () {
        iterator.returned = true;
        if (callback)
            return callback(this);
        return { done: true, value: undefined };
    };
    iterator.returned = false;
    return iterator;
}

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator(function () {
        throw new Error("Inner return called.");
    });
    var error = null;
    try {
        outer: for (var e1 of outerIterator) {
            inner: for (var e2 of innerIterator) {
                break;
            }
        }
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("no error");
    if (String(error) !== "Error: Inner return called.")
        throw new Error("bad error: " + String(error));
    if (!innerIterator.returned)
        throw new Error("bad value: " + innerIterator.returned);
    if (!outerIterator.returned)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator(function () {
        throw new Error("Outer return called.");
    });
    var innerIterator = createIterator(function () {
        throw new Error("Inner return called.");
    });
    var error = null;
    try {
        outer: for (var e1 of outerIterator) {
            inner: for (var e2 of innerIterator) {
                break;
            }
        }
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("no error");
    if (String(error) !== "Error: Inner return called.")
        throw new Error("bad error: " + String(error));
    if (!innerIterator.returned)
        throw new Error("bad value: " + innerIterator.returned);
    if (!outerIterator.returned)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator(function () {
        throw new Error("Outer return called.");
    });
    var innerIterator = createIterator();
    var error = null;
    try {
        outer: for (var e1 of outerIterator) {
            inner: for (var e2 of innerIterator) {
                break outer;
            }
        }
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("no error");
    if (String(error) !== "Error: Outer return called.")
        throw new Error("bad error: " + String(error));
    if (!innerIterator.returned)
        throw new Error("bad value: " + innerIterator.returned);
    if (!outerIterator.returned)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator(function () {
        throw new Error("Outer return called.");
    });
    var innerIterator = createIterator(function () {
        throw new Error("Inner return called.");
    });
    var error = null;
    try {
        outer: for (var e1 of outerIterator) {
            inner: for (var e2 of innerIterator) {
                throw new Error("Loop raises error.");
            }
        }
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("no error");
    if (String(error) !== "Error: Loop raises error.")
        throw new Error("bad error: " + String(error));
    if (!innerIterator.returned)
        throw new Error("bad value: " + innerIterator.returned);
    if (!outerIterator.returned)
        throw new Error("bad value: " + outerIterator.returned);
}());

