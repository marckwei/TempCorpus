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

function assert(assertion) {
    if (typeof assertion != "string")
        throw new Error("Invalid assertion.");

    let result = eval(assertion);

    if (!result)
        throw new Error("Bad assertion: " + assertion);
}

let calls = 0;
let getSet = [];

function resetTracking()
{
    calls = 0;
    getSet = [];
}

let getSetProxyReplace = new Proxy(
    {
        replace: function(string, search, replaceWith)
        {
            calls++;
            return string.replace(search, replaceWith);
        }
    }, {
        get: function(o, k)
        {
            getSet.push(k);
            return o[k];
        },
        set: function(o, k, v)
        {
            getSet.push(k);
            o[k] = v;
        }
    });

resetTracking();
let replaceResult = getSetProxyReplace.replace("This is a test", / /g, "_");
assert('replaceResult == "This_is_a_test"');
assert('calls === 1')
assert('getSet == "replace"');

resetTracking();
replaceResult = getSetProxyReplace.replace("This is a test", " ", "_");
assert('replaceResult == "This_is a test"');
assert('calls === 1')
assert('getSet == "replace"');
