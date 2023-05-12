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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
// Test tryGetById's value profiling feedback after it's too polymorphic.

var createBuiltin = $vm.createBuiltin;

var it = 1e5;

const check = (got, expect) => { if (got != expect) throw "Error: bad result got " + got + " expected " + expect; };

fooPlusBar = createBuiltin(`(function (o) { return @tryGetById(o, "foo") + @tryGetById(o, "bar"); })`);
noInline(fooPlusBar);

const bench = f => { f(); }
noInline(bench);

// Non bool int32.
o = { foo: 42, bar: 1337 };
bench(() => { var res = 0; for (var i = 0; i < it; ++i) res += fooPlusBar(o);  check(res, (o.foo + o.bar) * it); });

// Non int double.
p = { foo: Math.PI, bar: Math.E };
bench(() => { var res = 0.; for (var i = 0; i < it; ++i) res += fooPlusBar(p); check(Math.round(res), Math.round((p.foo + p.bar) * it)); });

// String ident.
// This gets too polymorphic for the engine's taste.
s = { foo: "", bar: "⌽" };
bench(() => { var res = ""; for (var i = 0; i < it; ++i) res += fooPlusBar(s); check(res.length, (s.foo.length + s.bar.length) * it); });

// Again: non bool int32.
bench(() => { var res = 0; for (var i = 0; i < it; ++i) res += fooPlusBar(o); check(res, (o.foo + o.bar) * it); });
