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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

function shouldThrowTypeError(func) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (!(error instanceof TypeError))
        throw new Error('Expected TypeError!');
}

shouldThrowTypeError(() => { String.prototype.replaceAll.call(undefined, 'def', 'xyz'); });
shouldThrowTypeError(() => { String.prototype.replaceAll.call(null, 'def', 'xyz'); });

shouldThrowTypeError(() => { 'abcdefabcdefabc'.replaceAll(/def/, 'xyz'); });
shouldThrowTypeError(() => { 'abcdefabcdefabc'.replaceAll(new RegExp('def'), 'xyz'); });
shouldThrowTypeError(() => { 'abcdefabcdefabc'.replaceAll({ [Symbol.match]() {}, toString: () => 'def' }, 'xyz'); });

shouldBe('abcdefabcdefabc'.replaceAll('def', 'xyz'), 'abcxyzabcxyzabc');
shouldBe('abcdefabcdefabc'.replaceAll(/def/g, 'xyz'), 'abcxyzabcxyzabc');
shouldBe('abcdefabcdefabc'.replaceAll(new RegExp('def', 'g'), 'xyz'), 'abcxyzabcxyzabc');
shouldBe('abcdefabcdefabc'.replaceAll({ [Symbol.match]() {}, toString: () => 'def', flags: 'g' }, 'xyz'), 'abcxyzabcxyzabc');

const search = /def/g;
search[Symbol.replace] = undefined;
shouldBe('abcdefabcdefabc'.replaceAll(search, 'xyz'), 'abcdefabcdefabc');
search[Symbol.replace] = () => 'q';
shouldBe('abcdefabcdefabc'.replaceAll(search, 'xyz'), 'q');
search[Symbol.replace] = RegExp.prototype[Symbol.replace].bind(search);
shouldBe('abcdefabcdefabc'.replaceAll(search, 'xyz'), 'abcxyzabcxyzabc');

shouldBe('abc'.replaceAll('', 'z'), 'zazbzcz');
shouldBe(''.replaceAll('', 'z'), 'z');
shouldBe('abc'.replaceAll('', ''), 'abc');
shouldBe(''.replaceAll('', ''), '');
