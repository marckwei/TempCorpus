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

// Using full number + null for math.
function addArgsNumberAndNull(a, b) {
    return a + b;
}
noInline(addArgsNumberAndNull);

for (var i = 0; i < 1e4; ++i) {
    var value = addArgsNumberAndNull(i, 1);
    if (value !== (i + 1))
        throw "addArgsNumberAndNull(i, 1) failed with i = " + i + " returned value = " + value;

    var value = addArgsNumberAndNull(0.5, i);
    if (value !== (i + 0.5))
        throw "addArgsNumberAndNull(0.5, i) failed with i = " + i + " returned value = " + value;

    var value = addArgsNumberAndNull(null, i);
    if (value !== i)
        throw "addArgsNumberAndNull(null, i) failed with i = " + i + " returned value = " + value;

    var value = addArgsNumberAndNull(i, null);
    if (value !== i)
        throw "addArgsNumberAndNull(i, null) failed with i = " + i + " returned value = " + value;

    var value = addArgsNumberAndNull(null, null);
    if (value !== 0)
        throw "addArgsNumberAndNull(null, null) failed with i = " + i + " returned value = " + value;
}


// Using int32 + null for math.
function addArgsInt32AndNull(a, b) {
    return a + b;
}
noInline(addArgsInt32AndNull);

for (var i = 0; i < 1e4; ++i) {
    var value = addArgsInt32AndNull(i, 1);
    if (value !== (i + 1))
        throw "addArgsInt32AndNull(i, 1) failed with i = " + i + " returned value = " + value;

    var value = addArgsInt32AndNull(null, i);
    if (value !== i)
        throw "addArgsInt32AndNull(null, i) failed with i = " + i + " returned value = " + value;

    var value = addArgsInt32AndNull(i, null);
    if (value !== i)
        throw "addArgsInt32AndNull(i, null) failed with i = " + i + " returned value = " + value;

    var value = addArgsInt32AndNull(null, null);
    if (value !== 0)
        throw "addArgsInt32AndNull(null, null) failed with i = " + i + " returned value = " + value;
}

function testFallbackWithDouble() {
    var value = addArgsNumberAndNull(Math.PI, Math.PI);
    if (value !== 2 * Math.PI)
        throw "addArgsNumberAndNull(Math.PI, Math.PI) failed with i = " + i + " returned value = " + value;
}
testFallbackWithDouble();


// Using full number + null for math.
function addArgsDoubleAndNull(a, b) {
    return a + b;
}
noInline(addArgsDoubleAndNull);

for (var i = 0; i < 1e4; ++i) {
    var value = addArgsDoubleAndNull(0.5, i);
    if (value !== (i + 0.5))
        throw "addArgsDoubleAndNull(0.5, i) failed with i = " + i + " returned value = " + value;

    var value = addArgsDoubleAndNull(null, 0.1);
    if (value !== 0.1)
        throw "addArgsDoubleAndNull(null, i) failed with i = " + i + " returned value = " + value;

    var value = addArgsDoubleAndNull(0.6, null);
    if (value !== 0.6)
        throw "addArgsDoubleAndNull(i, null) failed with i = " + i + " returned value = " + value;
}

function testFallbackWithObject() {
    var value = addArgsDoubleAndNull(Math.PI, { valueOf: function() { return 5; }});
    if (value !== 5 + Math.PI)
        throw "addArgsDoubleAndNull(Math.PI, { valueOf: function() { return 5; }}) failed with i = " + i + " returned value = " + value;
}
testFallbackWithObject();


// Using only null
function addArgsOnlyNull(a, b) {
    return a + b;
}
noInline(addArgsOnlyNull);

for (var i = 0; i < 1e4; ++i) {
    var value = addArgsOnlyNull(null, null);
    if (value !== 0)
        throw "addArgsOnlyNull(null, null) failed with i = " + i + " returned value = " + value;
}

function testFallbackWithString() {
    var value = addArgsOnlyNull("foo", "bar");
    if (value !== "foobar")
        throw "addArgsOnlyNull(\"foo\", \"bar\") failed with i = " + i + " returned value = " + value;
}
testFallbackWithString();