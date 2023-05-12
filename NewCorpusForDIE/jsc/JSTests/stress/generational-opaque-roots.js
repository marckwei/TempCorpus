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

// Tests that opaque roots behave correctly during young generation collections

var Element = $vm.Element;
var Root = $vm.Root;
var getElement = $vm.getElement;

try {
    // regression test for bug 160773.  This should not crash.
    new (Element.bind());
} catch(e) {
}

// Create the primary Root.
var root = new Root();
// This secondary root is for allocating a second Element without overriding 
// the primary Root's Element.
var otherRoot = new Root();

// Run an Eden collection so that the Root will be in the old gen (and won't be rescanned).
edenGC();

// Create a new Element and set a custom property on it.
var elem = new Element(root);
elem.customProperty = "hello";

// Make the Element unreachable except through the ephemeron with the Root.
elem = null;

// Create another Element so that we process the weak handles in block of the original Element.
var test = new Element(otherRoot);

// Run another Eden collection to process the weak handles in the Element's block. If opaque roots
// are cleared then we'll think that the original Element is dead because the Root won't be in the 
// set of opaque roots.
edenGC();

// Check if the primary Root's Element exists and has our custom property.
var elem = getElement(root);
if (elem.customProperty != "hello")
    throw new Error("bad value of customProperty: " + elem.customProperty);
