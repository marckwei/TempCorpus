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

//@ skip if $model == "Apple Watch Series 3" # Takes very long time to reproduce failure.
//@ $skipModes << :lockdown if $buildType == "debug"

function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}
noInline(assert);

function identity(a) { return a; }
noInline(identity);

function bar(...args) {
    return args;
}
noInline(bar);

function foo(a, ...args) {
    let arg = identity(a);
    try {
        let r = bar(...args, ...args);
        return r;
    } catch(e) {
        return arg;
    }
}
noInline(foo);

for (let i = 0; i < 40000; i++) {
    let args = [];
    for (let i = 0; i < 400; i++) {
        args.push(i);
    }

    let o = {};
    let r = foo(o, ...args);
    let i = 0;
    for (let arg of args) {
        assert(r[i] === arg);
        i++;
    }
    for (let arg of args) {
        assert(r[i] === arg);
        i++;
    }
}

for (let i = 0; i < 20; i++) {
    let threw = false;
    let o = {};
    let args = [];
    let argCount = maxArguments() * (2/3);
    argCount = argCount | 0;
    for (let i = 0; i < argCount; i++) {
        args.push(i);
    }

    let r = foo(o, ...args);
    assert(r === o);
}
