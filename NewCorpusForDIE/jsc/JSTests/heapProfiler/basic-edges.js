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

function excludeStructure(edges) {
    return edges.filter((x) => x.to.className !== "Structure");
}

let simpleObject1NodeId;
let simpleObject2NodeId;

let simpleObject1 = new SimpleObject;
let simpleObject2 = new SimpleObject;

(function() {
    let snapshot = createCheapHeapSnapshot();
    let nodes = snapshot.nodesWithClassName("SimpleObject");
    assert(nodes.length === 2, "Snapshot should contain 2 'SimpleObject' instances");
    let simpleObject1Node = nodes[0].outgoingEdges.length === 2 ? nodes[0] : nodes[1];
    let simpleObject2Node = nodes[0].outgoingEdges.length === 1 ? nodes[0] : nodes[1];
    assert(simpleObject1Node.outgoingEdges.length === 1, "'simpleObject1' should reference only its structure");
    assert(simpleObject2Node.outgoingEdges.length === 1, "'simpleObject2' should reference only its structure");
})();

setHiddenValue(simpleObject1, simpleObject2);

(function() {
    let snapshot = createCheapHeapSnapshot();
    let nodes = snapshot.nodesWithClassName("SimpleObject");
    assert(nodes.length === 2, "Snapshot should contain 2 'SimpleObject' instances");
    let simpleObject1Node = nodes[0].outgoingEdges.length === 2 ? nodes[0] : nodes[1];
    let simpleObject2Node = nodes[0].outgoingEdges.length === 1 ? nodes[0] : nodes[1];
    assert(simpleObject1Node.outgoingEdges.length === 2, "'simpleObject1' should reference its structure and hidden value");
    assert(simpleObject2Node.outgoingEdges.length === 1, "'simpleObject2' should reference only its structure");
    assert(excludeStructure(simpleObject1Node.outgoingEdges)[0].to.id === simpleObject2Node.id, "'simpleObject1' should reference 'simpleObject2'");
    simpleObject1NodeId = simpleObject1Node.id;
    simpleObject2NodeId = simpleObject2Node.id;
})();

simpleObject2 = null;

(function() {
    let snapshot = createCheapHeapSnapshot();
    let nodes = snapshot.nodesWithClassName("SimpleObject");
    assert(nodes.length === 2, "Snapshot should contain 2 'SimpleObject' instances");
    let simpleObject1Node = nodes[0].id === simpleObject1NodeId ? nodes[0] : nodes[1];
    let simpleObject2Node = nodes[0].id === simpleObject2NodeId ? nodes[0] : nodes[1];
    assert(simpleObject1Node.id === simpleObject1NodeId && simpleObject2Node.id === simpleObject2NodeId, "node identifiers were maintained");
    assert(simpleObject1Node.outgoingEdges.length === 2, "'simpleObject1' should reference its structure and hidden value");
    assert(simpleObject2Node.outgoingEdges.length === 1, "'simpleObject2' should reference only its structure");
    assert(excludeStructure(simpleObject1Node.outgoingEdges)[0].to.id === simpleObject2NodeId, "'simpleObject1' should reference 'simpleObject2'");
})();

simpleObject1 = null;

(function() {
    let snapshot = createCheapHeapSnapshot();
    let nodes = snapshot.nodesWithClassName("SimpleObject");
    assert(nodes.length === 0, "Snapshot should not contain a 'SimpleObject' instance");
})();
