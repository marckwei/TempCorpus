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

//@ if $buildType == "release" && !$memoryLimited then runDefault else skip end

function temp(i) {
    let a1 = [{}];
    a1.foo = 20;
    a1.foo1 = 20;
    a1.foo2 = 20;
    a1.foo3 = 20;
    a1.foo4 = 20;
    a1.foo5 = 20;
    a1.foo6 = 20;
    a1.foo8 = 20;
    a1.foo10 = 20;
    a1.foo11 = 20;
    delete a1[0];
    $vm.ensureArrayStorage(a1);
    try {
        let args = [-15, 1, 'foo', 20, 'bar'];
        for (let j = 0; j < i; ++j)
            args.push(j);
        for (let i = 0; i < 2**31 - 1; ++i) {
            Array.prototype.splice.apply(a1, args);
        }
    } catch(e) { }
}
let i = 62;
temp(i);
