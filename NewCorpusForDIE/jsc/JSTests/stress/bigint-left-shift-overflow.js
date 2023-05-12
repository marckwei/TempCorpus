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

let max = 0x7fffffff;
let min = -0x7fffffff - 1;
let bigIntMax = BigInt(max);
let bigIntMin = BigInt(min);

function leftShift(a, b)
{
    return a << b;
}
noInline(leftShift);

{
    let results = [
        [ 2147483647n, -2147483648n ],
        [ 2147483646n, -2147483648n ],
        [ 2147483644n, -2147483648n ],
        [ 2147483640n, -2147483648n ],
        [ 2147483632n, -2147483648n ],
        [ 2147483616n, -2147483648n ],
        [ 2147483584n, -2147483648n ],
        [ 2147483520n, -2147483648n ],
        [ 2147483392n, -2147483648n ],
        [ 2147483136n, -2147483648n ],
        [ 2147482624n, -2147483648n ],
        [ 2147481600n, -2147483648n ],
        [ 2147479552n, -2147483648n ],
        [ 2147475456n, -2147483648n ],
        [ 2147467264n, -2147483648n ],
        [ 2147450880n, -2147483648n ],
        [ 2147418112n, -2147483648n ],
        [ 2147352576n, -2147483648n ],
        [ 2147221504n, -2147483648n ],
        [ 2146959360n, -2147483648n ],
        [ 2146435072n, -2147483648n ],
        [ 2145386496n, -2147483648n ],
        [ 2143289344n, -2147483648n ],
        [ 2139095040n, -2147483648n ],
        [ 2130706432n, -2147483648n ],
        [ 2113929216n, -2147483648n ],
        [ 2080374784n, -2147483648n ],
        [ 2013265920n, -2147483648n ],
        [ 1879048192n, -2147483648n ],
        [ 1610612736n, -2147483648n ],
        [ 1073741824n, -2147483648n ],
        [ 0n, -2147483648n ],
    ];

    let index = 0;
    for (let i = 0; i < 32; ++i) {
        let bigIntShift = BigInt(i);
        shouldBe(leftShift(bigIntMax >> bigIntShift, bigIntShift), results[index][0]);
        shouldBe(leftShift(bigIntMin >> bigIntShift, bigIntShift), results[index][1]);
        ++index;
    }
}

{
    let results = [
        [2147483648n, -2147483649n],
        [2147483648n, -2147483650n],
        [2147483648n, -2147483652n],
        [2147483648n, -2147483656n],
        [2147483648n, -2147483664n],
        [2147483648n, -2147483680n],
        [2147483648n, -2147483712n],
        [2147483648n, -2147483776n],
        [2147483648n, -2147483904n],
        [2147483648n, -2147484160n],
        [2147483648n, -2147484672n],
        [2147483648n, -2147485696n],
        [2147483648n, -2147487744n],
        [2147483648n, -2147491840n],
        [2147483648n, -2147500032n],
        [2147483648n, -2147516416n],
        [2147483648n, -2147549184n],
        [2147483648n, -2147614720n],
        [2147483648n, -2147745792n],
        [2147483648n, -2148007936n],
        [2147483648n, -2148532224n],
        [2147483648n, -2149580800n],
        [2147483648n, -2151677952n],
        [2147483648n, -2155872256n],
        [2147483648n, -2164260864n],
        [2147483648n, -2181038080n],
        [2147483648n, -2214592512n],
        [2147483648n, -2281701376n],
        [2147483648n, -2415919104n],
        [2147483648n, -2684354560n],
        [2147483648n, -3221225472n],
        [2147483648n, -4294967296n],
    ];
    let index = 0;
    for (let i = 0; i < 32; ++i) {
        let bigIntShift = BigInt(i);
        shouldBe(leftShift((bigIntMax >> bigIntShift) + 1n, bigIntShift), results[index][0]);
        shouldBe(leftShift((bigIntMin >> bigIntShift) - 1n, bigIntShift), results[index][1]);
        ++index;
    }
}
