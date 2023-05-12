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
        ++iterator.returned;
        if (callback)
            return callback(this);
        return { done: true, value: undefined };
    };
    iterator.returned = 0;
    return iterator;
}

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    outer: for (var e1 of outerIterator) {
        inner: for (var e2 of innerIterator) {
            break outer;
        }
    }
    if (innerIterator.returned !== 1)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 1)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    outer: for (var e1 of outerIterator) {
        inner: for (var e2 of innerIterator) {
            break inner;
        }
    }
    if (innerIterator.returned !== 6)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 0)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    outer: for (var e1 of outerIterator) {
        inner: for (var e2 of innerIterator) {
            break;
        }
    }
    if (innerIterator.returned !== 6)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 0)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    outer: for (var e1 of outerIterator) {
        inner: for (var e2 of innerIterator) {
            break;
        }
    }
    if (innerIterator.returned !== 6)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 0)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    outer: for (var e1 of outerIterator) {
        inner: for (var e2 of innerIterator) {
            continue;
        }
    }
    if (innerIterator.returned !== 0)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 0)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    outer: for (var e1 of outerIterator) {
        inner: for (var e2 of innerIterator) {
            continue inner;
        }
    }
    if (innerIterator.returned !== 0)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 0)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    outer: for (var e1 of outerIterator) {
        inner: for (var e2 of innerIterator) {
            continue outer;
        }
    }
    if (innerIterator.returned !== 6)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 0)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    (function () {
        outer: for (var e1 of outerIterator) {
            inner: for (var e2 of innerIterator) {
                return;
            }
        }
    }());
    if (innerIterator.returned !== 1)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 1)
        throw new Error("bad value: " + outerIterator.returned);
}());

(function test() {
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    (function () {
        outer: for (var e1 of outerIterator) {
            inner: for (var e2 of innerIterator) {
            }
            return;
        }
    }());
    if (innerIterator.returned !== 0)
        throw new Error("bad value: " + innerIterator.returned);
    if (outerIterator.returned !== 1)
        throw new Error("bad value: " + outerIterator.returned);
}());


(function test() {
    function raiseError() {
        throw new Error("Cocoa");
    }
    var outerIterator = createIterator();
    var innerIterator = createIterator();
    (function () {
        var error = null;
        try {
            outer: for (var e1 of outerIterator) {
                inner: for (var e2 of innerIterator) {
                    raiseError();
                }
            }
        } catch (e) {
            error = e;
        }
        if (innerIterator.returned !== 1)
            throw new Error("bad value: " + innerIterator.returned);
        if (outerIterator.returned !== 1)
            throw new Error("bad value: " + outerIterator.returned);
        if (!error)
            throw new Error("not thrown");
        if (String(error) !== "Error: Cocoa")
            throw new Error("bad error: " + String(error));
    }());
}());
