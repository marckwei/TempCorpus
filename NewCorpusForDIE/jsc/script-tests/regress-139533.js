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

description(
"Regression test for https://webkit.org/b/139533. This test should not crash."
);

function outer(index, obj)
{
    function inner(arg)
    {
        return arg + obj.addend;
    }

    return inner(index);
}

obj = { addend : 1 };

// Create an object that will require calling defaultValue which is a native function call
function MyNumber()
{
}
MyNumber.prototype.toString = function() { return ""; };

var limit = 1000;
var result = 0;

for (var i = 0; i < limit; ++i) {
    // The problem fixed in bug 139533 was that the ScopeChain slot of the call frame header
    // is not being restored by OSR exit handler (nor should it).  In some cases, especially
    // when we inline we end up overwriting the memory with some other value.
    // After tiering up into the DFG, change the "addend" of obj.  This will do two things:
    // 1) We should OSR exit with a BadType (addend is no longer an integer)
    // 2) In the next call to inner, we will call jsAddSlowCase which will make a 
    //    native call to get the default value of obj.addend.
    // The OSR exit handler will not restore the ScopeChain slot in the header therefore
    // the value might be anything.  The native call will copy the ScopeChain slot from
    // inner to the frame for the native call.
    if (i == limit - 10)
        obj.addend = new MyNumber();

    result = outer(i, obj);
}
