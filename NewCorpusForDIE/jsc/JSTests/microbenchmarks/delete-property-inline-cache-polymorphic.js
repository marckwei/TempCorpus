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

//@ skip if $model =~ /^Apple Watch/

function C(prop) {
    this[prop] = 4
    delete this[prop]
}
noInline(C)

function foo(o, prop) {
    delete o[prop]
}
noInline(foo)

function F(prop) {
    this[prop] = 4
    foo(this, prop)
}
noInline(F)

for (let i = 0; i < 100000; ++i) {
    new C("foo1")
    new F("foo1")
    new C("foo2")
    new F("foo2")
    new C("foo3")
    new F("foo3")
    new C("foo4")
    new F("foo4")
    new C("foo5")
    new F("foo5")
    new C("foo6")
    new F("foo6")
    new C("foo7")
    new F("foo7")
    new C("foo8")
    new F("foo8")
    new C("foo9")
    new F("foo9")
    new C("foo10")
    new F("foo10")
}
