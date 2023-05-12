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

// Verify that DFG TryGetById nodes properly save live registers.  This test should not crash.

var createBuiltin = $vm.createBuiltin;

function tryMultipleGetByIds() { return '(function (base) { return @tryGetById(base, "value1") + @tryGetById(base, "value2") + @tryGetById(base, "value3"); })'; } 


let get = createBuiltin(tryMultipleGetByIds());
noInline(get);

function test() {
    let obj1 = {
        value1: "Testing, ",
        value2: "testing, ",
        value3: "123",
        expected: "Testing, testing, 123"
    };
    let obj2 = {
        extraFieldToMakeThisObjectDifferentThanObj1: 42,
        value1: 20,
        value2: 10,
        value3: 12,
        expected: 42
    };

    let objects = [obj1, obj2];

    for (let i = 0; i < 200000; i++) {
        let obj = objects[i % 2];
        if (get(obj) !== obj.expected)
            throw new Error("wrong on iteration: " + i);
    }
}

test();
