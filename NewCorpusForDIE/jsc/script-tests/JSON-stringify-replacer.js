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

description("Test to ensure correct behaviour of replacer functions in JSON.stringify");

var object = {0:0, 1:1, 2:2, 3:undefined};
var array = [0, 1, 2, undefined];
function returnUndefined(){}
function returnObjectFor1(k, v) {
    if (k == "1")
        return {};
    return v;
}
function returnArrayFor1(k, v) {
    if (k == "1")
        return [];
    return v;
}
function returnUndefinedFor1(k, v) {
    if (k == "1")
        return undefined;
    return v;
}
function returnNullFor1(k, v) {
    if (k == "1")
        return null;
    return v;
}
function returnCycleObjectFor1(k, v) {
    if (k == "1")
        return object;
    return v;
}
function returnCycleArrayFor1(k, v) {
    if (k == "1")
        return array;
    return v;
}
function returnFunctionFor1(k, v) {
    if (k == "1")
        return function(){};
    return v;
}
function returnStringForUndefined(k, v) {
    if (v === undefined)
        return "undefined value";
    return v;
}

shouldBeUndefined("JSON.stringify(object, returnUndefined)");
shouldBeUndefined("JSON.stringify(array, returnUndefined)");

shouldBe("JSON.stringify(object, returnObjectFor1)", '\'{"0":0,"1":{},"2":2}\'');
shouldBe("JSON.stringify(array, returnObjectFor1)", '\'[0,{},2,null]\'');

shouldBe("JSON.stringify(object, returnArrayFor1)", '\'{"0":0,"1":[],"2":2}\'');
shouldBe("JSON.stringify(array, returnArrayFor1)", '\'[0,[],2,null]\'');

shouldBe("JSON.stringify(object, returnUndefinedFor1)", '\'{"0":0,"2":2}\'');
shouldBe("JSON.stringify(array, returnUndefinedFor1)", '\'[0,null,2,null]\'');

shouldBe("JSON.stringify(object, returnFunctionFor1)", '\'{"0":0,"2":2}\'');
shouldBe("JSON.stringify(array, returnFunctionFor1)", '\'[0,null,2,null]\'');

shouldBe("JSON.stringify(object, returnNullFor1)", '\'{"0":0,"1":null,"2":2}\'');
shouldBe("JSON.stringify(array, returnNullFor1)", '\'[0,null,2,null]\'');

shouldBe("JSON.stringify(object, returnStringForUndefined)", '\'{"0":0,"1":1,"2":2,"3":"undefined value"}\'');
shouldBe("JSON.stringify(array, returnStringForUndefined)", '\'[0,1,2,"undefined value"]\'');

shouldThrow("JSON.stringify(object, returnCycleObjectFor1)");
shouldThrow("JSON.stringify(array, returnCycleObjectFor1)");

shouldThrow("JSON.stringify(object, returnCycleArrayFor1)");
shouldThrow("JSON.stringify(array, returnCycleArrayFor1)");
