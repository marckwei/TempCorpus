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

load("./driver/driver.js");

let globalScopeVariable = "globalScopeVariableValue";
let simpleObject = new SimpleObject;

(function() {
    let closureVariable = {};
    simpleObject.f = function() { closureVariable.x = 0; }
})();

// ----------

let snapshot = createHeapSnapshot();

// Global Scope => "globalScopeVariable"
let nodes = snapshot.nodesWithClassName("JSGlobalLexicalEnvironment");
assert(nodes.length === 1, "Should be only 1 'JSGlobalLexicalEnvironment' instance");
let globalScopeNode = nodes[0];

let seenGlobalScopeVariable = false;
let seenSimpleObjectVariable = false;

for (let edge of globalScopeNode.outgoingEdges) {
    switch (edge.type) {
    case "Variable":
        if (edge.data === "globalScopeVariable")
            seenGlobalScopeVariable = true;
        else if (edge.data === "simpleObject")
            seenSimpleObjectVariable = true;
        else
            assert(false, "Unexpected variable name: " + edge.data);
        break;
    case "Index":
    case "Property":
        assert(false, "Unexpected edge type");
        break;
    case "Internal":
        break;
    }
}

assert(seenGlobalScopeVariable, "Should see Variable edge for variable 'globalScopeVariable'");
assert(seenSimpleObjectVariable, "Should see Variable edge for variable 'simpleObject'");

// Function Scope => "closureVariable"
nodes = snapshot.nodesWithClassName("SimpleObject");
assert(nodes.length === 1, "Should be only 1 'SimpleObject' instance");
let scopeNode = followPath(nodes[0], [{edge: "f"}, {node: "JSLexicalEnvironment"}]);

let seenClosureVariable = false;

for (let edge of scopeNode.outgoingEdges) {
    switch (edge.type) {
    case "Variable":
        if (edge.data === "closureVariable")
            seenClosureVariable = true;
        else
            assert(false, "Unexpected variable name: " + edge.data);
        break;
    case "Index":
    case "Property":
        assert(false, "Unexpected edge type");
        break;
    case "Internal":
        break;
    }
}

assert(seenClosureVariable, "Should see Variable edge for closure variable 'closureVariable'");
