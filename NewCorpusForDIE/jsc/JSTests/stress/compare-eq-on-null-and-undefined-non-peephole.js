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

"use strict"

function useForMath(undefinedArgument, nullArgument, polymorphicArgument) {
    var a = (null == undefinedArgument) + (undefinedArgument == null) + (undefined == undefinedArgument) + (undefinedArgument == undefined);
    var b = (null == nullArgument) + (nullArgument == null) + (undefined == nullArgument) + (nullArgument == undefined);
    var c = (null == polymorphicArgument) + (polymorphicArgument == null) + (undefined == polymorphicArgument) + (polymorphicArgument == undefined);
    var d = (5 == null) + (null == true) + (undefined == Math.LN2) + ("const" == undefined);
    var e = (5 == undefinedArgument) + (nullArgument == true) + (nullArgument == Math.LN2) + ("const" == undefinedArgument);

    return a + b - c + d - e;
}
noInline(useForMath);

function testUseForMath() {
    for (let i = 0; i < 1e4; ++i) {
        var value = useForMath(undefined, null, 5);
        if (value != 8)
            throw "Failed useForMath(undefined, null, 5), value = " + value + " with i = " + i;

        var value = useForMath(undefined, null, null);
        if (value != 4)
            throw "Failed useForMath(undefined, null, null), value = " + value + " with i = " + i;

        var value = useForMath(undefined, null, undefined);
        if (value != 4)
            throw "Failed useForMath(undefined, null, undefined), value = " + value + " with i = " + i;

        var value = useForMath(undefined, null, { foo: "bar" });
        if (value != 8)
            throw "Failed useForMath(undefined, null, { foo: \"bar\" }), value = " + value + " with i = " + i;

        var value = useForMath(undefined, null, true);
        if (value != 8)
            throw "Failed useForMath(undefined, null, true), value = " + value + " with i = " + i;

        var value = useForMath(undefined, null, [1, 2, 3]);
        if (value != 8)
            throw "Failed useForMath(undefined, null, true), value = " + value + " with i = " + i;

        var value = useForMath(undefined, null, "WebKit!");
        if (value != 8)
            throw "Failed useForMath(undefined, null, true), value = " + value + " with i = " + i;
    }
}
testUseForMath();