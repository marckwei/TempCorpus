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

function assert(a) {
    if (!a)
        throw Error("Bad assertion!");
}

function tryChangeNonConfigurableDescriptor(x) {
    Object.defineProperty(arguments, 0, {configurable: false});
    try {
        Object.defineProperty(arguments, 0, x);
        assert(false);
    } catch(e) {
        assert(e instanceof TypeError);
    }
}

tryChangeNonConfigurableDescriptor({get: () => {return 50;} });
tryChangeNonConfigurableDescriptor({set: (x) => {}});
tryChangeNonConfigurableDescriptor({writable: true, enumerable: false});

function tryChangeWritableOfNonConfigurableDescriptor(x) {
    Object.defineProperty(arguments, 0, {configurable: false});
    Object.defineProperty(arguments, 0, {writable: true});
    assert(Object.defineProperty(arguments, 0, {writable: false}));
}

tryChangeWritableOfNonConfigurableDescriptor("foo");

