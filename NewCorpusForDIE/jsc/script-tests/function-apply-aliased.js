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
"This tests that we can correctly call Function.prototype.apply"
);

var myObject = { apply: function() { return [myObject, "myObject.apply"] } };
var myFunction = function (arg1) {
    return [this, "myFunction", arg1];
};
var myFunctionWithApply = function (arg1) { 
    return [this, "myFunctionWithApply", arg1];
};

function forwarder(f, thisValue, args) {
    function g() {
        return f.apply(thisValue, arguments);
    }
    return g.apply(null, args);
}
function recurseArguments() {
    recurseArguments.apply(null, arguments);
}

myFunctionWithApply.apply = function (arg1) { return [this, "myFunctionWithApply.apply", arg1] };
Function.prototype.aliasedApply = Function.prototype.apply;
var arg1Array = ['arg1'];

shouldBe("myObject.apply()", '[myObject, "myObject.apply"]');
shouldBe("forwarder(myObject)", '[myObject, "myObject.apply"]');
shouldBe("myFunction('arg1')", '[this, "myFunction", "arg1"]');
shouldBe("forwarder(myFunction, null, ['arg1'])", '[this, "myFunction", "arg1"]');
shouldBe("myFunction.apply(myObject, ['arg1'])", '[myObject, "myFunction", "arg1"]');
shouldBe("myFunction.apply(myObject, arg1Array)", '[myObject, "myFunction", "arg1"]');
shouldBe("forwarder(myFunction, myObject, arg1Array)", '[myObject, "myFunction", "arg1"]');
shouldBe("myFunction.apply()", '[this, "myFunction", undefined]');
shouldBe("myFunction.apply(null)", '[this, "myFunction", undefined]');
shouldBe("myFunction.apply(undefined)", '[this, "myFunction", undefined]');
shouldBe("myFunction.aliasedApply(myObject, ['arg1'])", '[myObject, "myFunction", "arg1"]');
shouldBe("myFunction.aliasedApply()", '[this, "myFunction", undefined]');
shouldBe("myFunction.aliasedApply(null)", '[this, "myFunction", undefined]');
shouldBe("myFunction.aliasedApply(undefined)", '[this, "myFunction", undefined]');
shouldBe("myFunctionWithApply.apply(myObject, ['arg1'])", '[myFunctionWithApply, "myFunctionWithApply.apply", myObject]');
shouldBe("myFunctionWithApply.aliasedApply(myObject, ['arg1'])", '[myObject, "myFunctionWithApply", "arg1"]');
shouldBe("myFunctionWithApply.apply(myObject, arg1Array)", '[myFunctionWithApply, "myFunctionWithApply.apply", myObject]');
shouldBe("forwarder(myFunctionWithApply, myObject, arg1Array)", '[myFunctionWithApply, "myFunctionWithApply.apply", myObject]');
shouldBe("myFunctionWithApply.aliasedApply(myObject, arg1Array)", '[myObject, "myFunctionWithApply", "arg1"]');

// Let's make sure that shouldThrow() is compiled before we do crazy.
shouldThrow("throw 42");

function stackOverflowTest() {
    try {
        var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z;
        stackOverflowTest();
    } catch(e) {
        // Blow the stack with a sparse array
        shouldThrow("myFunction.apply(null, new Array(5000000))");
        // Blow the stack with a sparse array that is sufficiently large to cause int overflow
        shouldThrow("myFunction.apply(null, new Array(1 << 30))");
    }
}
stackOverflowTest();

// Blow the stack recursing with arguments
shouldThrow("recurseArguments.apply(null, new Array(50000))");
