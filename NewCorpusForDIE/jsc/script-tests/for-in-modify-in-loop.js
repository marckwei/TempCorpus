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

description("Check for ... in will properly enumerate elements added or deleted during the loop");

function haveSameProperties(a, b) {
    var p;

    for (p in a) {
        if (!b.hasOwnProperty(p))
            return false;
    }

    for (p in b) {
        if (!a.hasOwnProperty(p))
            return false;
    }

    return true;
}

function each(o, callback) {
    var result = {};

    for (var property in o) {
        callback(property, o);
        if (result.hasOwnProperty(property))
            throw "Duplicate property \"" + property + "\" enumerated";
        result[property] = 1;
    }

    return result;
}

function testAdd()
{
    var obj = { a : "First" };
    obj["m"] = "Second";
    obj["z"] = "Third";

    var elementsToAdd = [ "c", "t", "k" ];
    var addIndex = 0;

    var result = {};

    return each(obj, function(p, o) {
        if (addIndex < elementsToAdd.length)
            o[elementsToAdd[addIndex++]] = "Added #" + addIndex;
    });
}

function testDelete()
{
    var obj = { a : "First" };
    obj["b"] = "Second";
    obj["c"] = "Third";
    obj["d"] = "Fourth";

    var elementsToDelete = [ "c" ];
    var deleteIndex = 0;

    return each(obj, function(p, o) {
        if (deleteIndex < elementsToDelete.length)
            delete o[elementsToDelete[deleteIndex++]];
   });
}

function testAddDelete()
{
    var obj = { a : "First", b : "Second", c : "Third", j : "Fourth", z : "Fifth", lastOne : "The End" };

    elementsToAdd = [ "d", "p" ];
    elementsToDelete = [ "z", "lastOne", "c" ];
    var loopIndex = 0;

    return each(obj, function(p, o) {
        if (loopIndex++ == 1) {
            for (var i = 0; i < elementsToAdd.length; i++)
                o[elementsToAdd[i]] = "Added #" + i;
            for (var i = 0; i < elementsToDelete.length; i++)
                delete o[elementsToDelete[i]];
        }
   });
}

shouldBeTrue("haveSameProperties(testAdd(), { a: 1, m : 1, z : 1 })");
shouldBeTrue("haveSameProperties(testDelete(), { a: 1, b : 1, d : 1 })");
shouldBeTrue("haveSameProperties(testAddDelete(), { a: 1, b : 1, j : 1 })");

for (var i = 0; i < 10000; i++) {
    if (!haveSameProperties(testAdd(), { a: 1, m : 1, z : 1 }))
        shouldBeTrue("haveSameProperties(testAdd(), { a: 1, m : 1, z : 1 })");

    if (!haveSameProperties(testDelete(), { a: 1, b : 1, d : 1 }))
        shouldBeTrue("haveSameProperties(testDelete(), { a: 1, b : 1, d : 1 })");

    if (!haveSameProperties(testAddDelete(), { a: 1, b : 1, j : 1 }))
        shouldBeTrue("haveSameProperties(testAddDelete(), { a: 1, b : 1, j : 1 })");
}

