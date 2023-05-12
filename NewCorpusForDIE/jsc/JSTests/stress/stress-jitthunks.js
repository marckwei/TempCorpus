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

{
    let functions = [];
    for (var i = 0; i < 1e5; ++i)
        functions.push($vm.createEmptyFunctionWithName(i));
    let newGlobal = $vm.createGlobalObject();
    newGlobal.WeakMap.prototype.set;
    newGlobal.WeakMap.prototype.set = null; // Remove reference!
    $vm.gcSweepAsynchronously(); // Mark WeakMap#set dead, but since we have so many NativeExecutables, it is dead, but still in JITThunks.
    newGlobal = $vm.createGlobalObject();
    let set = newGlobal.WeakMap.prototype.set; // Accessing to HashTable, which found a dead previous NativeExecutable, and replace it with new one.
    $vm.gc(); // This does not invoke finalizer for WeakMap#set since we already replaced it. And previous one is finally destroyed.
    try {
        set(); // Of course, it works. It is using a new NativeExecutable for WeakMap#set, not using dead one.
    } catch { };
    for (var i = 0; i < 1e3; ++i)
        functions.push($vm.createEmptyFunctionWithName(i));
    try {
        set();
    } catch { };
}
