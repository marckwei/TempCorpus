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

var SimpleObject = $vm.SimpleObject;
var setHiddenValue = $vm.setHiddenValue;

load("./driver/driver.js");

let simpleObject = new SimpleObject;
setHiddenValue(simpleObject, "hiddenValue"); // Internal
simpleObject.propertyName1 = "propertyValue1"; // Property
simpleObject["propertyName2"] = "propertyValue2"; // Property
simpleObject[100] = "indexedValue"; // Index
simpleObject[0xffffffff + 100] = "largeIndexValueBecomingProperty"; // Property
simpleObject.point = {x:"x1", y:"y1"}; // Property => object with 2 inline properties.

// ----------

function excludeStructure(edges) {
    return edges.filter((x) => x.to.className !== "Structure");
}

let snapshot = createHeapSnapshot();

// Internal, Property, and Index edges on an Object.
let nodes = snapshot.nodesWithClassName("SimpleObject");
assert(nodes.length === 1, "Snapshot should contain 1 'SimpleObject' instance");
let simpleObjectNode = nodes[0];
let edges = excludeStructure(simpleObjectNode.outgoingEdges);
let pointNode = null;

let seenHiddenValue = false;
let seenPropertyName1 = false;
let seenPropertyName2 = false;
let seenIndex100 = false;
let seenLargeIndex = false;
let seenObjectWithInlineStorage = false;
let largeIndexName = (0xffffffff + 100).toString();

for (let edge of edges) {
    switch (edge.type) {
    case "Internal":
        assert(!seenHiddenValue);
        seenHiddenValue = true;
        break;
    case "Property":
        if (edge.data === "propertyName1")
            seenPropertyName1 = true;
        else if (edge.data === "propertyName2")
            seenPropertyName2 = true;
        else if (edge.data === largeIndexName)
            seenLargeIndex = true;
        else if (edge.data === "point") {
            seenPoint = true;
            pointNode = edge.to;
        } else
            assert(false, "Unexpected property name");
        break;
    case "Index":
        if (edge.data === 100)
            seenIndex100 = true;
        break;
    case "Variable":
        assert(false, "Should not see a variable edge for SimpleObject instance");
        break;
    default:
        assert(false, "Unexpected edge type");
        break;
    }
}

assert(seenHiddenValue, "Should see Internal edge for hidden value");
assert(seenPropertyName1, "Should see Property edge for propertyName1");
assert(seenPropertyName2, "Should see Property edge for propertyName2");
assert(seenIndex100, "Should see Index edge for index 100");
assert(seenLargeIndex, "Should see Property edge for index " + largeIndexName);


// Property on an Object's inline storage.
let pointEdges = excludeStructure(pointNode.outgoingEdges);

let seenPropertyX = false;
let seenPropertyY = false;

for (let edge of pointEdges) {
    switch (edge.type) {
    case "Property":
        if (edge.data === "x")
            seenPropertyX = true;
        else if (edge.data === "y")
            seenPropertyY = true;
        else
            assert(false, "Unexpected property name");
        break;
    case "Index":
    case "Variable":
    case "Internal":
        assert(false, "Unexpected edge type");
        break;
    }
}

assert(seenPropertyX, "Should see Property edge for x");
assert(seenPropertyY, "Should see Property edge for y");
