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

//@ if $jitTests then runNoCJIT("--useDFGJIT=false", "--useLLInt=false") else skip end

function foo(o) {
    return o.f;
}

var p1 = {};
p1.f = 42;

var crazy = {};
crazy.f = 1;
crazy.g = 2;

var p2 = Object.create(p1);

var crazy = Object.create(p1);
crazy.f = 1;
crazy.g = 2;

function make() {
    return Object.create(p2);
}

for (var i = 0; i < 100; ++i)
    foo(make());

for (var i = 0; i < 10000; ++i)
    p2["i" + i] = i;
p2.f = 43;

for (var i = 0; i < 100; ++i)
    foo({f:24});

var result = foo(make());
if (result != 43)
    throw "Error: bad result: " + result;
