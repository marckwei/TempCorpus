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
"Tests that DFG inlining does not brak function.arguments.caller."
);

var callCount = 0;

var resultArray = []

function throwError() {
   throw {};
}
var object = {
   nonInlineable : function nonInlineable() {
       if (0) return [arguments, function(){}];
       if (++callCount == 999999) {
           var f = nonInlineable;
           while (f) {
               resultArray.push(f.name);
               f=f.arguments.callee.caller;
           }
       }
   },
   inlineable : function inlineable() {
       this.nonInlineable();
   }
}
function makeInlinableCall(o) {
   for (var i = 0; i < 1000; i++)
       o.inlineable();
}

function g() {
    var j = 0;
    for (var i = 0; i < 1000; i++) {
        j++;
        makeInlinableCall(object);
    }
}
g();

shouldBe("resultArray.length", "4");
shouldBe("resultArray[3]", "\"g\"");
shouldBe("resultArray[2]", "\"makeInlinableCall\"");
shouldBe("resultArray[1]", "\"inlineable\"");
shouldBe("resultArray[0]", "\"nonInlineable\"");

