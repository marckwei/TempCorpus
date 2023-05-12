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

let allRegExpFlags = "dgimsuy";
let allRegExpProperties = [ 'hasIndices', 'global', 'ignoreCase', 'multiline', 'dotAll', 'unicode', 'sticky'];
const numFlags = allRegExpFlags.length;
const numVariations = 2 ** numFlags;

function flagsFromVariation(variation)
{
    let flags = "";

    for (let i = 0; i < numFlags; i++)
        if (variation & (2 ** i))
            flags = flags + allRegExpFlags[i];

    return flags;
}

function setPropertiesForVariation(variation, o)
{
    for (let i = 0; i < numFlags; i++)
        if (variation & (2 ** i))
            o[allRegExpProperties[i]] = true;

    return o;
}

function missingPropertiesForVariation(variation, o)
{
    let missingProperties = [];

    for (let i = 0; i < numFlags; i++)
        if (variation & (2 ** i) && !o[allRegExpProperties[i]])
            missingProperties.push(allRegExpProperties[i]);

    return missingProperties;
}

var get = Object.getOwnPropertyDescriptor(RegExp.prototype, "flags").get

function test()
{
    for (let variation = 0; variation < numVariations; ++variation) {
        let flags = flagsFromVariation(variation);

        let r = new RegExp("foo", flags);

        let missingProperties = missingPropertiesForVariation(variation, r);
        if (missingProperties.length)
            throw "RegExp " + r.toString() + " missing properties: " + missingProperties;

        r = setPropertiesForVariation(variation, {});

        let flagsSet = get.call(r);

        if (flagsSet != flags)
            throw "RegExp with flags: \"" + flags + "\" should have properties: " + missingPropertiesForVariation(variation, {});
    }
}

test();

