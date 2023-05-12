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

function throwFunction() {
    throw 2;
}

let a = [0.1];

// --------- try catch with throw function ---------
function foo1(i) {
    let x = a[1];
    try {
        throwFunction();
    } catch { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

function foo2(i) {
    let x = a[1];
    try {
        throwFunction();
    } catch {
        if (x !== undefined) {
            throw new Error(`x is ${x} at iteration ${i}`);
        }
    }
}

function foo3(i) {
    let x = a[1];
    try {
        if (i % 2)
            throwFunction();
    } catch { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

// --------- try catch with throw ---------
function foo4(i) {
    let x = a[1];
    try {
        throw new Error();
    } catch { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

function foo5(i) {
    let x = a[1];
    try {
        throw new Error();
    } catch {
        if (x !== undefined) {
            throw new Error(`x is ${x} at iteration ${i}`);
        }
    }
}

function foo6(i) {
    let x = a[1];
    try {
        if (i % 2)
            throw new Error();
    } catch { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

// --------- try catch finally with throw function ---------
function foo7(i) {
    let x = a[1];
    try {
        throw new Error();
    } catch {
    } finally { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

function foo8(i) {
    let x = a[1];
    try {
        throw new Error();
    } catch {
    } finally {
        if (x !== undefined) {
            throw new Error(`x is ${x} at iteration ${i}`);
        }
    }
}

function foo9(i) {
    let x = a[1];
    try {
        if (i % 2)
            throw new Error();
    } catch {
    } finally { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

// --------- try catch finally with throw function ---------
function foo10(i) {
    let x = a[1];
    try {
        throwFunction();
    } catch {
    } finally { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

function foo11(i) {
    let x = a[1];
    try {
        throwFunction();
    } catch {
    } finally {
        if (x !== undefined) {
            throw new Error(`x is ${x} at iteration ${i}`);
        }
    }
}

function foo12(i) {
    let x = a[1];
    try {
        if (i % 2)
            throwFunction();
    } catch {
    } finally { }
    if (x !== undefined) {
        throw new Error(`x is ${x} at iteration ${i}`);
    }
}

function opt() {
    var b = false;
    var c = -b;
    try {
        throw "";
    } catch (e) {
    }
    return c;
}

for (let i = 0; i < 100000; i++) {
    foo1(i);
    foo2(i);
    foo3(i);
    foo4(i);
    foo5(i);
    foo6(i);
    foo7(i);
    foo8(i);
    foo9(i);
    foo10(i);
    foo11(i);
    foo12(i);

    if (1 / opt() === Infinity)
        throw Error(`Should be -Infinity`);
}
