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

//@ skip

// This test checks that the pow function returns coherent results:
// (a) Across different compilation tiers
// (b) With integer exponents represented as int32 or as double

function pow42() {
    return { value: Math.pow(2.1, 42), ftl: isFinalTier() };
}

function build42AsDouble() {
    function opaqueAdd(x, y) { return x + y; }
    return opaqueAdd(42 - 0.123, 0.123);
}

var double42 = build42AsDouble();

if (double42 !== 42)
    throw new Error("42 (as double) should be === to 42 (as int)");

function powDouble42() {
    return { value: Math.pow(2.1, double42), ftl: isFinalTier() };
}

function clobber() { }
noInline(clobber);

function pow42NoConstantFolding() {
    var obj = { x: 2.1, y: 42 };
    clobber(obj);
    return { value: Math.pow(obj.x, obj.y), ftl: isFinalTier() };
}

function powDouble42NoConstantFolding() {
    var obj = { x: 2.1, y: double42 };
    clobber(obj);
    return { value: Math.pow(obj.x, obj.y), ftl: isFinalTier() };
}

var results = { 'jit': {}, 'dfg': {}, 'ftl': {} };
var funs = [
    [ 'pow42', pow42 ],
    [ 'powDouble42', powDouble42 ],
    [ 'pow42NoConstantFolding', pow42NoConstantFolding ],
    [ 'powDouble42NoConstantFolding', powDouble42NoConstantFolding ]
];
var tiers = ['jit', 'dfg', 'ftl'];

for (var i = 0; i < 100000; ++i) {
    for (var j in funs) {
        var name = funs[j][0];
        var fun = funs[j][1];
        var result = fun();
        if (result.ftl)
            results['ftl'][name] = result.value;
        else if (numberOfDFGCompiles(fun) > 0)
            results['dfg'][name] = result.value;
        else
            results['jit'][name] = result.value;
    }
}

var errors = [];
var valuesFor = {};
for (var i in tiers) {
    var tier = tiers[i];
    var result = results[tier];
    // We don't have this tier
    if (Object.keys(result).length === 0)
        continue;

    for (var j in funs) {
        var name = funs[j][0];
        if (!(name in result))
            errors.push(name + " was not compiled to " + tier);
        else if (!(name in valuesFor))
            valuesFor[name] = { value: result[name], tiers: [tier] };
        else if (result[name] !== valuesFor[name].value)
            errors.push(name + " has different results in " + tier + " (" + result[name] + ") and " + valuesFor[name].tiers + " (" + valuesFor[name].value + ")");
        else
            valuesFor[name].tiers.push(tier);
    }
}

var reference = funs[0][0];
var result = valuesFor[reference].value;

for (var j in funs) {
    var name = funs[j][0];
    if (valuesFor[name].value !== result)
        errors.push(name + " (" + valuesFor[name].value + ") and " + reference + " (" + result + ") have different results");
}

if (errors.length > 0)
    throw new Error(errors.join('\n'));
