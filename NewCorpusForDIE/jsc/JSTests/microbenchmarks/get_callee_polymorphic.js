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
var Class = {
    create: function() {
        return function() { 
            this.initialize.apply(this, arguments);
        };
    }
};

var sum = 0;

var init = function(a, b) { sum += a + b; };

var Class1 = Class.create();
Class1.prototype = {
    initialize: init
};
var Class2 = Class.create();
Class2.prototype = {
    initialize: init
};
var Class3 = Class.create();
Class3.prototype = {
    initialize: init
};

for (var i = 0; i < 1000; i++) {
    for (var j = 0; j < 100; j++) {
        var newObject;
        if (j % 3 == 0)
            newObject = new Class1(2, 3);
        else if (j % 3 == 1)
            newObject = new Class2(2, 3);
        else
            newObject = new Class3(2, 3);
    }
}

if (sum != 5 * 100 * 1000)
    throw "Error: incorrect sum. Expected " + (5 * 100 * 1000) + " but got " + sum + ".";
