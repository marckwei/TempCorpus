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

//@ slow!
//@ runDefault("--usePolymorphicCallInliningForNonStubStatus=1", "--jitPolicyScale=0")

var code = `
function foo(o, p) {
    try {
        o.f = null;
    } catch (e) {
        return;
    }
}

for (var i = 0; i < 81; ++i) {
    var o = {};
    o.__defineSetter__('f', function (value) {
        this._f = value;
    });
    if (i & 1) {
        o['i' + i] = {};
    }
    foo(o);
}

var o = {};
o.__defineSetter__('f', function () {
    throw new Error();
});

foo(o);
`;

// Increasing 400 to 1e4 and spawning 100 jsc process can improve reproducibility.
for (let i=0; i < 400; i++)
    runString(code);
