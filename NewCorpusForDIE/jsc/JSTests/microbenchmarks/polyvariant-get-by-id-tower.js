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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
(function() {
    var globalO;
    
    function polyvariant()
    {
        return globalO.func();
    }
    
    class Foo {
        func()
        {
            return 42;
        }
    }
    
    var fooO = new Foo();
    
    function foo()
    {
        globalO = fooO;
        return polyvariant();
    }
    
    class Bar {
        func()
        {
            return foo();
        }
    }
    
    var barO = new Bar();
    
    function bar()
    {
        globalO = barO;
        return polyvariant();
    }
    
    class Baz {
        func()
        {
            return bar();
        }
    }
    
    var bazO = new Baz();
    
    function baz()
    {
        globalO = bazO;
        return polyvariant();
    }
    
    var count = 1000000;
    var result = 0;
    for (var i = 0; i < count; ++i)
        result += baz();
    
    if (result != count * 42)
        throw "Error: bad result: " + result;
})();
