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

function foo (x, y, z, newX, checkZ, errorMessage) {
    with(z) {
        x = y;
    }
    if (x !== newX || !checkZ(z)) {
        throw errorMessage;
    }
}

for (var i = 0; i < 10000; ++i) {
    foo(1, 2, {a:42}, 2, z => z.a === 42, "Error: bad result for non-overlapping case, i = " + i);
    foo(1, 2, {x:42}, 1, z => z.x === 2, "Error: bad result for setter case, i = " + i);
    foo(1, 2, {y:42}, 42, z => z.y === 42, "Error: bad result for getter case, i = " + i);
    foo(1, 2, {x:42, y:13}, 1, z => z.x === 13 && z.y === 13, "Error: bad result for setter/getter case, i = " + i);
    foo(1, 2, "toto", 2, z => z === "toto", "Error: bad result for string case, i = " + i);
    try {
        foo(1, 2, null, 2, z =>
                {throw "Error: missing type error, i = " + i}, "Unreachable");
    } catch (e) {
        if (!(e instanceof TypeError)) {
            throw e;
        }
    }
}
