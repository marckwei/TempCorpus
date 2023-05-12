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
"This tests that if a variable is dead on OSR exit, it will at least contain a valid JS value."
);

var array = [];

for (var i = 0; i < 9; ++i) {
    var code = "";
    code += "(function(";
    for (var j = 0; j < i; ++j) {
        if (j)
            code += ", ";
        code += "arg" + j;
    }
    code += ") {\n";
    code += "    return ";
    if (i) {
        for (var j = 0; j < i; ++j) {
            if (j)
                code += " + ";
            code += "arg" + j;
        }
    } else
        code += "void 0";
    code += ";\n";
    code += "})";
    array[i] = eval(code);
}

function foo(a, b) {
    var x = 0;
    if (a.f < b.f) {
        var result = b.g - a.g;
        x = !x;
        return result;
    } else {
        var result = a.g - b.g;
        x = [x];
        return result;
    }
}

var firstArg = {f:2, g:3};
var secondArg = {f:3, g:4};

var myFunctions = array.concat(foo);
for (var i = 0; i < myFunctions.length; ++i)
    noInline(myFunctions[i]);

silentTestPass = true;

for (var i = 0; i < 300; i = dfgIncrement({f:myFunctions, i:i + 1, n:100})) {
    var code = "";
    code += "array[" + (((i / 2) | 0) % array.length) + "](";
    for (var j = 0; j < (((i / 2) | 0) % array.length); ++j) {
        if (j)
            code += ", ";
        code += i + j;
    }
    if (i == 150) {
        firstArg = {f:2, g:2.5};
        secondArg = {f:3, g:3.5};
    }
    var tmp = firstArg;
    firstArg = secondArg;
    secondArg = tmp;
    code += "); foo(firstArg, secondArg)";
    shouldBe(code, "1");
}

