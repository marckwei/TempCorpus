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

//@ requireOptions("--jitPolicyScale=0", "--useDFGJIT=0")

{
    var obj1 = this
    function foo1() {
        for (let i = 0; i < 5; ++i)
            delete obj1.x
    }
    noInline(foo1)

    foo1()
    Object.defineProperty(obj1, "x", {})
    foo1()
}

{
    var obj2 = new Proxy({}, {})
    function foo2() {
        for (let i = 0; i < 5; ++i)
            delete obj2.x
    }
    noInline(foo2)

    foo2()
    Object.defineProperty(obj2, "x", {})
    foo2()
}

{
    var global = $vm.createGlobalObject();
    var obj3 = $vm.createGlobalProxy(global)
    function foo3() {
        for (let i = 0; i < 5; ++i)
            delete obj3.x
    }
    noInline(foo3)

    foo3()
    Object.defineProperty(obj3, "x", {})
    foo3()
}
