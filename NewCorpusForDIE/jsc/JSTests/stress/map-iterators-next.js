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

// This test checks the behavior of the iterator.next methods on Map objects

var testArray = [1,2,3,4,5,6]
var testMap = new Map();
for (var [key, value] of testArray.entries()) {
    testMap.set(key, value);
}
var keys = testMap.keys();
var i = 0;
while (true) {
    var {done, value: key} = keys.next();
    if (done)
        break;
    if (key >= testArray.length)
        throw "Error: bad value: " + key;
    i++;
}

if (testMap.size !== i)
    throw "Error: bad value: " + i;

var value = keys.next().value;
if (value !== undefined)
    throw "Error: bad value: " + value;

var values = testMap.values();
var i = 0;
while (true) {
    var {done, value} = values.next();
    if (done)
        break;
    i++;
    if (testArray.indexOf(value) === -1)
        throw "Error: bad value: " + value;
}

if (testMap.size !== i)
    throw "Error: bad value: " + i;

var value = values.next().value;
if (value !== undefined)
    throw "Error: bad value: " + value;

var entries = testMap.entries();
var i = 0;
do {
    var {done, value: entry} = entries.next();
    if (done)
        break;
    var [key, value] = entry;
    if (value !== testMap.get(key))
        throw "Error: bad value: " + value + " " + testMap.get(key);
    if (key >= testArray.length)
        throw "Error: bad value: " + key;
    i++;
    if (testArray.indexOf(value) === -1)
        throw "Error: bad value: " + value + " " + i;
} while (!done);

if (testMap.size !== i)
    throw "Error: bad value: " + i;

var value = entries.next().value;
if (value !== undefined)
    throw "Error: bad value: " + value;

var entries = testMap.entries();
var i = 0;
do {
    var {done, value: entry} = entries.next();
    if (done)
        break;
    var [key, value] = entry;
    if (value !== testMap.get(key))
        throw "Error: bad value: " + value + " " + testMap.get(key);
    i++;
    if (i % 4 === 0)
        testMap.set(100000 + i, i);
} while (!done);

if (testMap.size !== i)
    throw "Error: bad value: " + i;

var value = entries.next().value;
if (value !== undefined)
    throw "Error: bad value: " + value;

function otherKey(key) {
    return (key + 1) % testArray.length;
}

var entries = testMap.entries();
var i = 0;
do {
    var {done, value: entry} = entries.next();
    if (done)
        break;
    var [key, value] = entry;
    if (value !== testMap.get(key))
        throw "Error: bad value: " + value + " " + testMap.get(key);
    i++;
    if (i % 4 === 0)
        testMap.delete(otherKey(key));
} while (!done);

if (testMap.size !== i)
    throw "Error: bad value: " + i;

var value = entries.next().value;
if (value !== undefined)
    throw "Error: bad value: " + value;
