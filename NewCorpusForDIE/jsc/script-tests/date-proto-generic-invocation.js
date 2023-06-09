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

description("This test verifies that the functions of the Date prototype object are not generic, and the prototype is a plain object, as documented in ECMA-262 rev6 section 20.3.4 Properties of the Date Prototype Object.");

var functionNames = [
        "Date.prototype.toString",
        "Date.prototype.toDateString",
        "Date.prototype.toTimeString",
        "Date.prototype.toGMTString",
        "Date.prototype.toUTCString",
        "Date.prototype.toLocaleString",
        "Date.prototype.toLocaleDateString",
        "Date.prototype.toLocaleTimeString",
//        "Date.prototype.valueOf",           --> This line seems to confuse JavaScriptCore
        "Date.prototype.getTime",
        "Date.prototype.getYear",
        "Date.prototype.getFullYear",
        "Date.prototype.getMonth",
        "Date.prototype.getDate",
        "Date.prototype.getDay",
        "Date.prototype.getHours",
        "Date.prototype.getMinutes",
        "Date.prototype.getSeconds",
        "Date.prototype.getMilliseconds",
        "Date.prototype.getTimezoneOffset",
        "Date.prototype.setTime",
        "Date.prototype.setMilliseconds",
        "Date.prototype.setSeconds",
        "Date.prototype.setMinutes",
        "Date.prototype.setHours",
        "Date.prototype.setDate",
        "Date.prototype.setMonth",
        "Date.prototype.setFullYear",
        "Date.prototype.setYear"
    ];

var o = new Object();
for (var i = 0; i < functionNames.length; i++) {
    var testFunctionName = "o.__proto__." + functionNames[i].split('.')[2];
    eval(testFunctionName + " = " + functionNames[i]);
    shouldThrow(testFunctionName + "()", '"TypeError: Type error"');
}
for (var i = 0; i < functionNames.length; i++) {
    shouldThrow(functionNames[i] + "()", '"TypeError: Type error"');
}

shouldBeTrue("new Date instanceof Date");
shouldBe("(new Date).__proto__", "Date.prototype");
shouldBeFalse("(new Date).__proto__ instanceof Date");
shouldBeFalse("Date.prototype instanceof Date");
