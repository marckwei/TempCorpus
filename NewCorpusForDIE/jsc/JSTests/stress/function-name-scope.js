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

function foo() {
    return function bar(str) {
        var barBefore = bar;
        var result = eval(str);
        return [
            barBefore,
            bar,
            function () {
                return bar;
            },
            result
        ];
    }
}

function check() {
    var bar = foo();
    
    function verify(result, barAfter, evalResult) {
        if (result[0] !== bar)
            throw "Error: bad first entry: " + result[0];
        if (result[1] !== barAfter)
            throw "Error: bad first entry: " + result[1];
        var subResult = result[2]();
        if (subResult !== barAfter)
            throw "Error: bad second entry: " + result[2] + "; returned: " + subResult;
        if (result[3] !== evalResult)
            throw "Error: bad third entry: " + result[3] + "; expected: " + evalResult;
    }
    
    verify(bar("42"), bar, 42);
    verify(bar("bar"), bar, bar);
    verify(bar("var bar = 42; function fuzz() { return bar; }; fuzz()"), 42, 42);
}

// Execute check() more than once. At the time that we wrote this regression test, trunk would fail on
// the second execution. Executing 100 times would also gives us some optimizing JIT coverage.
for (var i = 0; i < 100; ++i)
    check();

