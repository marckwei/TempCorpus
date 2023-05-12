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

var createBuiltin = $vm.createBuiltin;

count = createBuiltin("(function () { return @argumentCount(); })");
countNoInline = createBuiltin("(function () { return @argumentCount(); })");
noInline(countNoInline);


function inlineCount() { return count(); }
noInline(inlineCount);

function inlineCount1() { return count(1); }
noInline(inlineCount1);

function inlineCount2() { return count(1,2); }
noInline(inlineCount2);

function inlineCountVarArgs(list) { return count(...list); }
noInline(inlineCountVarArgs);

function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}

for (i = 0; i < 1000000; i++) {
    assert(count(1,1,2) === 3, i);
    assert(count() === 0, i);
    assert(count(1) === 1, i);
    assert(count(...[1,2,3,4,5]) === 5, i);
    assert(count(...[]) === 0, i);
    assert(inlineCount() === 0, i);
    assert(inlineCount1() === 1, i);
    assert(inlineCount2() === 2, i);
    assert(inlineCountVarArgs([1,2,3,4]) === 4, i);
    assert(inlineCountVarArgs([]) === 0, i);
    // Insert extra junk so that inlineCountVarArgs.arguments.length !== count.arguments.length
    assert(inlineCountVarArgs([1], 2, 4) === 1, i);
    assert(countNoInline(4) === 1, i)
    assert(countNoInline() === 0, i);
}
