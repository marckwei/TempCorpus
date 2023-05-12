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

//@ runDefault("--collectContinuously=1", "--usePolyvariantDevirtualization=0", "--forceDebuggerBytecodeGeneration=1", "--verifyGC=1")
// UsePolyvariantDevirtualization gives us a PutPrivateName (not byID) while still letting us generate an IC with only one AccessCase
// DebuggerBytecodeGeneration seems to give the GC more time to interrupt the put because it forces reads from the stack 

function PutPrivateNameIC() {
    let leak = []

    class A {
        constructor() {
            this.a = 0
        }
    }
    noInline(A)

    class B extends A {
        #b
        #c
    }
    noInline(B)

    for (let i = 0; i < 100000; ++i) {
        let b1 = new B
        let b2 = new B
        let b3 = new B
        leak.push(b1, b2, b3)
    }
}
noInline(PutPrivateNameIC)
PutPrivateNameIC()
