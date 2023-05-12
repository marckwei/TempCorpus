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

load("./driver/driver.js");

function MyES5ClassUgly() {};
MyES5ClassUgly.displayName = "MyES5ClassDisplayName";
MyES5ClassUgly.prototype = { constructor: MyES5ClassUgly };

class MyES6Class {};
class MyES6Subclass extends MyES6Class {};

let classInstances = [];
for (let i = 0; i < 5; ++i)
    classInstances.push(new MyES5ClassUgly);
for (let i = 0; i < 10; ++i)
    classInstances.push(new MyES6Class);
for (let i = 0; i < 20; ++i)
    classInstances.push(new MyES6Subclass);

let myFunction = function() {};
let myMap = new Map;

(function() {
    let nodes;
    let snapshot = createCheapHeapSnapshot();

    nodes = snapshot.nodesWithClassName("MyES5ClassDisplayName");
    assert(nodes.length === 5, "Snapshot should contain 5 'MyES5ClassDisplayName' (MyES5ClassUgly) instances");
    assert(nodes.every((x) => x.isObjectType), "Every MyES5Class instance should have had its ObjectType flag set");

    nodes = snapshot.nodesWithClassName("MyES6Class");
    assert(nodes.length === 10, "Snapshot should contain 10 'MyES6Class' instances");
    assert(nodes.every((x) => x.isObjectType), "Every MyES6Class instance should have had its ObjectType flag set");

    nodes = snapshot.nodesWithClassName("MyES6Subclass");
    assert(nodes.length === 20, "Snapshot should contain 20 'MyES6Subclass' instances");
    assert(nodes.every((x) => x.isObjectType), "Every MyES6Subclass instance should have its ObjectType flag set");

    nodes = snapshot.nodesWithClassName("Function");
    assert(nodes.length > 0, "Should be at least 1 Function instance");
    assert(nodes.every((x) => !x.isObjectType), "No Function instance should have its ObjectType flag set");

    nodes = snapshot.nodesWithClassName("Map");
    assert(nodes.length > 0, "Should be at least 1 Map instance");
    assert(nodes.every((x) => !x.isObjectType), "No Map instance should have its ObjectType flag set");

    nodes = snapshot.nodesWithClassName("Object");
    assert(nodes.every((x) => x.isObjectType), "Every Object should also have its ObjectType flag set");
})();
