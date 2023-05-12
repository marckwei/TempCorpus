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


// Consider the following scenario:
// - On OS X, WTF::pageSize() is 4*1024 bytes.
// - JSEnvironmentRecord::allocationSizeForScopeSize(6621) == 53000
// - sizeof(MarkedBlock) == 248
// - (248 + 53000) is a multiple of 4*1024.
// - (248 + 53000)/(4*1024) == 13

// We will allocate a chunk of memory of size 53248 bytes that looks like this:
// 0            248       256                       53248       53256
// [Marked Block | 8 bytes |  payload     ......      ]  8 bytes  |
//                         ^                                      ^
//                    Our Environment record starts here.         ^
//                                                                ^
//                                                        Our last JSValue in the environment record will go from byte 53248 to 53256. But, we don't own this memory.

var numberOfCapturedVariables = 6621;
function use() { }
function makeFunction() { 
    var varName;
    var outerFunction = "";
    var innerFunction = "";

    for (var i = 0; i < numberOfCapturedVariables; i++) {
        varName = "_" + i;
        outerFunction += "var " + varName + ";";
        innerFunction += "use(" + varName + ");";
    }
    outerFunction += "function foo() {" + innerFunction + "}";
    var functionString = "(function() { " + outerFunction + "})";
    var result = eval(functionString);
    return result;
}

var arr = [];
for (var i = 0; i < 50; i++) {
    var f = makeFunction();
    f();
    fullGC();
}

