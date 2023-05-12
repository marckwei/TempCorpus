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

description(
"This attempts to test that inlining preserves basic function.arguments functionality when said functionality is used from inside and outside getters and from inlined code, all at once; but it fails at this and instead finds other bugs particularly in the DFG stack layout machinery."
);

function foo(o,b,c) {
    return [foo.arguments, bar.arguments].concat(o.f);
}

function fuzz(a, b) {
    return [foo.arguments, bar.arguments, getter.arguments, fuzz.arguments];
}

function getter() {
    return [foo.arguments, bar.arguments, getter.arguments].concat(fuzz(42, 56));
}

o = {}
o.__defineGetter__("f", getter);

function bar(o,b,c) {
    return [bar.arguments].concat(foo(o,b,c));
}

function argsToStr(args) {
    if (args.length === void 0 || args.charAt !== void 0)
        return "" + args
    var str = "[" + args + ": ";
    for (var i = 0; i < args.length; ++i) {
        if (i)
            str += ", ";
        str += argsToStr(args[i]);
    }
    return str + "]";
}

for (var __i = 0; __i < 200; ++__i)
    shouldThrow("argsToStr(bar(\"a\" + __i, \"b\" + __i, \"c\" + __i))");

