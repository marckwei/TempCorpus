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

description("Test for bug 31689: RegExp#exec's returned Array-like object behaves differently from regular Arrays");

var tests = [
    [ /(a)(_)?.+(c)(_)?.+(e)(_)?.+/, 'abcdef', '["abcdef", "a", undefined, "c", undefined, "e", undefined]' ],
    [ /(a)(_)?/, 'abcdef', '["a", "a", undefined]' ],
    [ /(_)?.+(a)/, 'xabcdef', '["xa", undefined, "a"]' ],
    [ /(_)?.+(a)(_)?/, 'xabcdef', '["xa", undefined, "a", undefined]' ],
];

function testRegExpMatchesArray(i)
{
    return tests[i][0].exec(tests[i][1]);
}

function testInOperator(i)
{
    var re = tests[i][0],
        str = tests[i][1],
        inArray = [],
        matches = re.exec(str);

    for (var j = 0; j < matches.length; j++) {
        if (j in matches) {
            inArray.push(matches[j]);
        }
    }
    return inArray;
}

function testForEachFunction(i) 
{
    var re = tests[i][0],
        str = tests[i][1],
        inArray = [],
        matches = re.exec(str);

    matches.forEach(function(m) {
        inArray.push(m);
    });
    return inArray;

}

for (var i in tests) {
    shouldBe('testRegExpMatchesArray(' + i + ')', tests[i][2]);
    shouldBe('testInOperator(' + i + ')', tests[i][2]);
    shouldBe('testForEachFunction(' + i + ')', tests[i][2]);
}

