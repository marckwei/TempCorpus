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
"This tests that we can correctly call Function.prototype.call"
);

var myObject = { call: function() { return [myObject, "myObject.call"] } };
var myFunction = function (arg1) { return [this, "myFunction", arg1] };
var myFunctionWithCall = function (arg1) { return [this, "myFunctionWithCall", arg1] };
myFunctionWithCall.call = function (arg1) { return [this, "myFunctionWithCall.call", arg1] };
Function.prototype.aliasedCall = Function.prototype.call;

shouldBe("myObject.call()", '[myObject, "myObject.call"]');
shouldBe("myFunction('arg1')", '[this, "myFunction", "arg1"]');
shouldBe("myFunction.call(myObject, 'arg1')", '[myObject, "myFunction", "arg1"]');
shouldBe("myFunction.call()", '[this, "myFunction", undefined]');
shouldBe("myFunction.call(null)", '[this, "myFunction", undefined]');
shouldBe("myFunction.call(undefined)", '[this, "myFunction", undefined]');
shouldBe("myFunction.aliasedCall(myObject, 'arg1')", '[myObject, "myFunction", "arg1"]');
shouldBe("myFunction.aliasedCall()", '[this, "myFunction", undefined]');
shouldBe("myFunction.aliasedCall(null)", '[this, "myFunction", undefined]');
shouldBe("myFunction.aliasedCall(undefined)", '[this, "myFunction", undefined]');
shouldBe("myFunctionWithCall.call(myObject, 'arg1')", '[myFunctionWithCall, "myFunctionWithCall.call", myObject]');
shouldBe("myFunctionWithCall.aliasedCall(myObject, 'arg1')", '[myObject, "myFunctionWithCall", "arg1"]');
