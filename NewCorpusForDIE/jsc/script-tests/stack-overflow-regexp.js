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

//@ skip if $memoryLimited
//  &&&&
description('Test that we do not overflow the stack while handling regular expressions');

// Base case.
shouldThrow('new RegExp(Array(500000).join("(") + "a" + Array(500000).join(")"))', '"RangeError: Out of memory: Invalid regular expression: too many nested disjunctions"');

{ // Verify that a deep JS stack does not help avoiding the error.
    function recursiveCall(depth) {
        if (!(depth % 10)) {
            debug("Creating RegExp at depth " + depth);
            shouldThrow('new RegExp(Array(500000).join("(") + "a" + Array(500000).join(")"))', '"RangeError: Out of memory: Invalid regular expression: too many nested disjunctions"');
        }
        if (depth < 100) {
            recursiveCall(depth + 1);
        }
    }
    recursiveCall(0);
}

{ // Have the deepest nested subpattern surrounded by other expressions.
    var expression = "";
    for (let i = 0; i < 500000; ++i) {
        expression += "((a)(";
    }
    expression += "b";
    for (let i = 0; i < 500000; ++i) {
        expression += ")(c))";
    }
    shouldThrow('new RegExp(expression)', '"SyntaxError: Invalid regular expression: regular expression too large"');
}
