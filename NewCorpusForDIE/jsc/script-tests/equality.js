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
'Test for equality of many combinations types.'
);

var values = [ '0', '1', '0.1', '2', '3', '4', '5', '6', '7', '-0', '"0"', '"1"', '"0.1"', '"-0"', 'null', 'undefined', 'false', 'true', 'new String("0")', 'new Object' ];

var exceptions = [
    '"-0" == false',
    '"0" == false',
    '"0" == new String("0")',
    '"1" == true',
    '-0 == "-0"',
    '-0 == "0"',
    '-0 == false',
    '-0 == new String("0")',
    '0 == "-0"',
    '0 == "0"',
    '0 == -0',
    '0 == false',
    '0 == new String("0")',
    '0 === -0',
    '0.1 == "0.1"',
    '1 == "1"',
    '1 == true',
    'new Object == new Object',
    'new Object === new Object',
    'new String("0") == false',
    'new String("0") == new String("0")',
    'new String("0") === new String("0")',
    'null == undefined',
];

var exceptionMap = new Object;

var i, j;

for (i = 0; i < exceptions.length; ++i)
    exceptionMap[exceptions[i]] = 1;

for (i = 0; i < values.length; ++i) {
    for (j = 0; j < values.length; ++j) {
        var expression = values[i] + " == " + values[j];
        var reversed = values[j] + " == " + values[i];
        shouldBe(expression, ((i == j) ^ (exceptionMap[expression] || exceptionMap[reversed])) ? "true" : "false");
    }
}

for (i = 0; i < values.length; ++i) {
    for (j = 0; j < values.length; ++j) {
        var expression = values[i] + " === " + values[j];
        var reversed = values[j] + " === " + values[i];
        shouldBe(expression, ((i == j) ^ (exceptionMap[expression] || exceptionMap[reversed])) ? "true" : "false");
    }
}
