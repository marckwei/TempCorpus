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

// This test verifies that we don't crash in FTL generated code due to lack of a store barrier
// for a put-by-val when we don't know when the value was allocated.

class MyNumber
{
    constructor(v)
    {
        this._v = v;
    }

    plusOne()
    {
        return this._v + 1;
    }
}

noDFG(MyNumber.plusOne);

let count = 0;
let bogus = null;

function bar()
{
    count++;

    if (!(count % 100))
        fullGC();
    return new MyNumber(count);
}

noDFG(bar);
noInline(bar);

function foo(index, arg)
{
    var result = [arg[0]];
    if (arg.length > 1)
        result[1] = bar();
    return result;
}

noInline(foo);

function test()
{
    for (let i = 0; i < 50000; i++)
    {
        let a = [1, i];
        let x = foo(i, a);

        if (!(count % 100))
            edenGC();

        for (let j = 0; j < 100; j++)
            bogus = new MyNumber(-1);
        
        if ((count + 1) != x[1].plusOne())
            throw("Wrong value for count");
    }
}

test();
