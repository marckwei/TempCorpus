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


function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}


function inner(value) {
    switch (value + "Statement") {
    case "ExpressionStatement":
        return 0;
    case "BreakStatement":
        return 1;
    case "ThrowStatement":
        return 2;
    case "IfStatement":
        return 3;
    case "WhileStatement":
        return 4;
    case "DoWhileStatement":
        return 5;
    case "ForStatement":
        return 6;
    default:
        return 7;
    }
}

function outer(value) {
    switch (value) {
    case "Expression":
        return 0 + inner(value);
    case "Break":
        return 1 + inner(value);
    case "Throw":
        return 2 + inner(value);
    case "If":
        return 3 + inner(value);
    case "While":
        return 4 + inner(value);
    case "DoWhile":
        return 5 + inner(value);
    case "For":
        return 6 + inner(value);
    default:
        return 7 + inner(value);
    }
}
noInline(outer);

for (var i = 0; i < 3e5; ++i) {
    shouldBe(outer("Do" + "While"), 10);
    shouldBe(outer("F" + "or"), 12);
    shouldBe(outer(""), 14);
    shouldBe(outer("TEST"), 14);
}
