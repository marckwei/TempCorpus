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

description("Verify that we do not recurse infinitely through one of the Array->string conversion.");

// Array that only contains itself.
shouldBeEqualToString(`var arrayDirectlyContainingItself = [];
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.toString();`, "");
shouldBeEqualToString(`var arrayDirectlyContainingItself = [];
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.toLocaleString();`, "");
shouldBeEqualToString(`var arrayDirectlyContainingItself = [];
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.join(",");`, "");

// Array containing itself and a bunch of other objects.
shouldBeEqualToString(`var arrayDirectlyContainingItself = [];
    arrayDirectlyContainingItself.push(1);
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.push("WebKit!");
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.toString();`, "1,,WebKit!,");
shouldBeEqualToString(`var arrayDirectlyContainingItself = [];
    arrayDirectlyContainingItself.push(1);
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.push("WebKit!");
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.toLocaleString();`, "1,,WebKit!,");
shouldBeEqualToString(`var arrayDirectlyContainingItself = [];
    arrayDirectlyContainingItself.push(1);
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.push("WebKit!");
    arrayDirectlyContainingItself.push(arrayDirectlyContainingItself);
    arrayDirectlyContainingItself.join("-");`, "1--WebKit!-");

// Array indirectly containing itself.
shouldBeEqualToString(`var arrayIndirectlyContainingItself = [];
    arrayIndirectlyContainingItself.push(1);
    arrayIndirectlyContainingItself.push([1, 2, [5, 6, [arrayIndirectlyContainingItself]]]);
    arrayIndirectlyContainingItself.push("WebKit!");
    arrayIndirectlyContainingItself.toString();`, "1,1,2,5,6,,WebKit!");
shouldBeEqualToString(`var arrayIndirectlyContainingItself = [];
    arrayIndirectlyContainingItself.push(1);
    arrayIndirectlyContainingItself.push([1, 2, [5, 6, [arrayIndirectlyContainingItself]]]);
    arrayIndirectlyContainingItself.push("WebKit!");
    arrayIndirectlyContainingItself.toLocaleString();`, "1,1,2,5,6,,WebKit!");
shouldBeEqualToString(`var arrayIndirectlyContainingItself = [];
    arrayIndirectlyContainingItself.push(1);
    arrayIndirectlyContainingItself.push([1, 2, [5, 6, [arrayIndirectlyContainingItself]]]);
    arrayIndirectlyContainingItself.push("WebKit!");
    arrayIndirectlyContainingItself.join("=");`, "1=1,2,5,6,=WebKit!");

// Array containing another array with recursion.
shouldBeEqualToString(`var arrayIndirectlyContainingItself = [];
    arrayIndirectlyContainingItself.push(1);
    arrayIndirectlyContainingItself.push([1, 2, [5, 6, [arrayIndirectlyContainingItself]]]);
    arrayIndirectlyContainingItself.push("WebKit!");
    ["z", arrayIndirectlyContainingItself, 9].toString();`, "z,1,1,2,5,6,,WebKit!,9");
shouldBeEqualToString(`var arrayIndirectlyContainingItself = [];
    arrayIndirectlyContainingItself.push(1);
    arrayIndirectlyContainingItself.push([1, 2, [5, 6, [arrayIndirectlyContainingItself]]]);
    arrayIndirectlyContainingItself.push("WebKit!");
    ["z", arrayIndirectlyContainingItself, 9].toLocaleString();`, "z,1,1,2,5,6,,WebKit!,9");
shouldBeEqualToString(`var arrayIndirectlyContainingItself = [];
    arrayIndirectlyContainingItself.push(1);
    arrayIndirectlyContainingItself.push([1, 2, [5, 6, [arrayIndirectlyContainingItself]]]);
    arrayIndirectlyContainingItself.push("WebKit!");
    ["z", arrayIndirectlyContainingItself, 9].join("&");`, "z&1,1,2,5,6,,WebKit!&9");

// Indirectly recurse to an other of the functions. The object do not contains itself, but contains object that recursively call
// an array to string conversion.
shouldBeEqualToString(`var arrayIndirectlyConvertingItself = ["a"];
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.toString() } });
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.toLocaleString() } });
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.join("~") } });
    arrayIndirectlyConvertingItself.push("WebKit!");
    ["z", arrayIndirectlyConvertingItself, 9].toString();`, "z,a,,,,WebKit!,9");
shouldBeEqualToString(`var arrayIndirectlyConvertingItself = ["a"];
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.toString() } });
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.toLocaleString() } });
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.join("~") } });
    arrayIndirectlyConvertingItself.push("WebKit!");
    ["z", arrayIndirectlyConvertingItself, 9].toLocaleString();`, "z,a,,,,WebKit!,9");
shouldBeEqualToString(`var arrayIndirectlyConvertingItself = ["a"];
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.toString() } });
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.toLocaleString() } });
    arrayIndirectlyConvertingItself.push({ array: arrayIndirectlyConvertingItself, toString: function() { return this.array.join("~") } });
    arrayIndirectlyConvertingItself.push("WebKit!");
    ["z", arrayIndirectlyConvertingItself, 9].join("*");`, "z*a,,,,WebKit!*9");
