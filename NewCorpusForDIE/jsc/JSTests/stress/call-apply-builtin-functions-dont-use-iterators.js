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

(function(){
    "use strict";
    var it = [][Symbol.iterator]();
    while (it) {
        if (it.hasOwnProperty('next'))
            delete it.next;
        it = Object.getPrototypeOf(it);
    }

    var bind = Function.prototype.bind;
    var uncurryThis = bind.bind(bind.call);

    var bindFn = uncurryThis(bind);
    var applyFn = uncurryThis(bind.apply);
    function test() { print("here"); }
    var sliceFn = uncurryThis([].slice);
    function addAll(var_args) {
        var args = sliceFn(arguments, 0);
        var result = this;
        for (var i = 0; i < args.length; i++)
            result += args[i];
        return result;
    }
    if (applyFn(addAll, 3, [4, 5, 6]) !== 18)
        throw "incorrect result";

})();
