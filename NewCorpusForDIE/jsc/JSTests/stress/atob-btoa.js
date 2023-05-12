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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

let strs = [
    "",
    "3OBQwMDuz29xSLpfDZ3BZpoSmOp5uqpC1AvdUeO4Mj",
    "U5qFQTeWHPtyLAfFpf0DzgNiCXr17LsZxEHRlRoE3S",
    "97tJorct1Pc1IhFuMNCb2XWQ01cVbZF6dQCzcH3QRn",
    "zIom9GE2x1xr6VS6kM8iRoco34an8FVfZ6EvT2kd5EHZ2YxkL91hLhjsmRRsmT6GiOdkSFhOdGJF4GEC42gUosLLNxBmspVl",
    "G8YxPonzURIHs5SOURZnYeASifuSbifqyFoWPexDuxTN3x84Uti00fCUS9DgbqKMIySK4wt9TCeecyr2rD55QDzIlOgmiPUC",
    "rcivMmo7ECcfITpH3uB2FXHfOJH5ILdXoXHbZ4FuzFiPBcTUUfcpSFZlaopWtGSa7YP4Gb9embV2cBsS5vFV6mo7HqCyGAyG",
];

for (let str in strs)
    assert(atob(btoa(str)) === str);

assert(atob(null) === '\x9Eée');
shouldThrow(() => { atob(undefined); }, "Error: Invalid character in argument for atob.");
shouldThrow(() => { atob('好'); }, "Error: Invalid character in argument for atob.");
shouldThrow(() => { atob(); }, "Error: Missing input for atob.");

assert(atob(btoa(null)) === "null");
assert(atob(btoa(undefined)) === "undefined");
shouldThrow(() => { btoa("嗨"); }, "Error: Invalid character in argument for btoa.");
shouldThrow(() => { btoa(); }, "Error: Missing input for btoa.");
