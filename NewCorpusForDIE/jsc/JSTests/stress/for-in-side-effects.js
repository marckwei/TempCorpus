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

// Regression test for bug 179212

var p = { "a": {} };

var flag = 0;
var data = [];
var copy = [];

var z = new Proxy({}, {
    getPrototypeOf: function() {
        if (flag == 2) {
            data[0] = { "x": "I changed" };
        }

        if (flag == 1) {
            flag = 2;
        }

        return {"a": 1, "b": 2}
    }
});

p.__proto__ = z;

function reset()
{
    flag = 0;
    data = [1.1, 2.2, 3.3];
    copy = [];
}

function runTest(func)
{
    reset();

    for (var i = 0; i < 0x10000; i++)
        func();

    flag = 1;
    func();

    if (copy[0].x != "I changed")
        throw "Expected updated value for copy[0]";
}

function testWithoutFTL()
{
    function f()
    {
        data[0] = 2.2;
        for(var d in p) {
            copy[0] = data[0];
            copy[1] = data[1];
            copy[2] = data[2];
        }
    }

    noFTL(f);

    runTest(f);
}

function testWithFTL()
{
    function f()
    {
        data[0] = 2.2;
        for(var d in p) {
            copy[0] = data[0];
            copy[1] = data[1];
            copy[2] = data[2];
        }
    }

    runTest(f);
}

testWithoutFTL();
testWithFTL();
