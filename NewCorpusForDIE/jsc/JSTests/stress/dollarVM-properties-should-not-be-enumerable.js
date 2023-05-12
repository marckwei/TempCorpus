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

//@ runDefault

const descriptors = Object.getOwnPropertyDescriptors($vm);

var success = true;

for (prop in descriptors) {
    let descriptor = descriptors[prop];
    var expected = !descriptor.configurable && !descriptor.enumerable && !descriptor.writable;
    if (!expected) {
        print(" --- " + prop + " --- ", descriptors[prop]);
        if (descriptor.configurable)
            print("    $vm." + prop + " should not be configurable.");
        if (descriptor.enumerable)
            print("    $vm." + prop + " should not be enumerable.");
        if (descriptor.writable)
            print("    $vm." + prop + " should not be writable.");
    }
    success = success && !descriptor.configurable && !descriptor.enumerable && !descriptor.writable;
}

for (prop in $vm) {
    print("$vm." + prop + " should not be enumerable.");
    success = false;
}
    
if (!success)
    throw "FAILED";
