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

// This test should not crash.
function truthiness(x) {
    return !!x;
}

function compare(a, b) {
    for (var i in a.desc) {
        let propA = a.desc[i];
        let propB = b.desc[i];
        if (propA == propB)
            continue;
        if (typeof propA == "boolean" && truthiness(propA) == truthiness(propB))
            continue;
        throw Error(a.name + "[" + i + "] : " + propA + " != " + b.name + "[" + i + "] : " + propB);
    }
}

function shouldBe(actualDesc, expectedDesc) {
    compare({ name: "actual", desc: actualDesc }, { name: "expected", desc: expectedDesc });
    compare({ name: "expected", desc: expectedDesc }, { name: "actual", desc: actualDesc });
}

function test(expectedDesc) {
    var desc = Object.getOwnPropertyDescriptor(new Proxy({a:0}, {
            getOwnPropertyDescriptor(t,pk) {
                return expectedDesc
            }
        }), "");
    shouldBe(desc, expectedDesc);
}

test({ configurable:true });
test({ writable:true, configurable:true });
test({ writable:true, enumerable:true, configurable:true });
test({ enumerable:true, configurable:true, get: function() {} });
test({ enumerable:true, configurable:true, set: function() {} });
