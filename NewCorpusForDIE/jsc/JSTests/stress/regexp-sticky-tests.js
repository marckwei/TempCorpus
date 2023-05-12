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

// Verify sticky RegExp matching.

function assert(b)
{
    if (!b)
        throw new Error("Bad assertion");
}

let re = new RegExp("a|aa", "y");
let s1 = "_aaba";
let m = null;

// First character, '_', shouldn't match.
assert(re.exec(s1) === null);
assert(re.lastIndex === 0);

// Second character, 'a', should match and we'll advance to the next character.
re.lastIndex = 1;
m = re.exec(s1);
assert(m[0] === 'a');
assert(re.lastIndex === 2);

// Third character, 'a', should match and we'll advance to the next character.
m = re.exec(s1);
assert(m[0] === 'a');
assert(re.lastIndex === 3);

// Fourth character, 'b', shouldn't match.
m = re.exec(s1);
assert(m === null);
assert(re.lastIndex === 0);

// Fifth character, 'a', should match and we'll advance past the last character.
re.lastIndex = 4;
m = re.exec(s1);
assert(m[0] === 'a');
assert(re.lastIndex === 5);

// We shoudn't match starting past the last character.
m = re.exec(s1);
assert(m === null);

re = new RegExp("ax|a", "y");
// First character, '_', shouldn't match.
assert(re.exec(s1) === null);
assert(re.lastIndex === 0);

// Second character, 'a', should match and we'll advance to the next character.
re.lastIndex = 1;
m = re.exec(s1);
assert(m[0] === 'a');
assert(re.lastIndex === 2);

// Third character, 'a', should match and we'll advance to the next character.
m = re.exec(s1);
assert(m[0] === 'a');
assert(re.lastIndex === 3);

// Fourth character, 'b', shouldn't match.
m = re.exec(s1);
assert(m === null);
assert(re.lastIndex === 0);

// Fifth character, 'a', should match and we'll advance past the last character.
re.lastIndex = 4;
m = re.exec(s1);
assert(m[0] === 'a');
assert(re.lastIndex === 5);

// We shoudn't match starting past the last character.
m = re.exec(s1);
assert(m === null);

re = new RegExp("aa|a", "y");

re.lastIndex = 0;
// First character, '_', shouldn't match.
assert(re.exec(s1) === null);
assert(re.lastIndex === 0);

// Second and third characters, 'aa', should match and we'll advance past them.
re.lastIndex = 1;
m = re.exec(s1);
assert(m[0] === 'aa');
assert(re.lastIndex === 3);

// Fourth character, 'b', shouldn't match.
m = re.exec(s1);
assert(m === null);
assert(re.lastIndex === 0);

// Fifth character, 'a', should match and we'll advance past the last character.
re.lastIndex = 4;
m = re.exec(s1);
assert(m[0] === 'a');
assert(re.lastIndex === 5);

// We shoudn't match starting past the last character.
m = re.exec(s1);
assert(m === null);
