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

function Foo(g) {
    this.g_ = g;
}
Foo.prototype.__defineGetter__("f", function() { return this.g_ + 32; });
Foo.prototype.__defineGetter__("g", function() { return this.g_ + 33; });
Foo.prototype.__defineGetter__("h", function() { return this.g_ + 34; });
Foo.prototype.__defineGetter__("i", function() { return this.g_ + 35; });
Foo.prototype.__defineGetter__("j", function() { return this.g_ + 36; });
Foo.prototype.__defineGetter__("k", function() { return this.g_ + 37; });

function foo(o) {
    return o.f + o.k * 1000;
}

noInline(foo);

for (var i = 0; i < 100; ++i) {
    var result = foo(new Foo(5));
    if (result != (32 + 5) + (37 + 5) * 1000)
        throw "Error: bad result: " + result;
}
