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

var count = 0;

function setter(value) {
    Object.defineProperty(
        this, "f", {
        enumerable: true,
                configurable: true,
                writable: true,
                value: 32
                });
    var o = Object.create(this);
    var currentCount = count++;
    var str = "for (var i = " + currentCount + "; i < " + (100 + currentCount) + "; ++i)\n"
            + "    o.f\n";
    eval(str);
}

function foo(o) {
    o.f = 42;
}

noInline(foo);

for (var i = 0; i < 1000; ++i) {
    var o = {};
    o.__defineSetter__("f", setter);

    foo(o);
    if (o.f != 32)
        throw ("Error 1: "+o.f);

    foo(o);
    if (o.f != 42)
        throw ("Error 2: "+o.f);
}