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

(function test() {
    // Read this test file using jsc shell's builtins, and check that its content is as expected.
    const in_file = 'jsc-read.js';

    const check = content_read => {
        let testContent = test.toString();
        let lineEnding = testContent.match(/\r?\n/)[0];
        let expect = `(${testContent})();${lineEnding}`;
        if (content_read !== expect)
            throw Error('Expected to read this file as-is, instead read:\n==========\n' + content_read + '\n==========');
    };

    const test_arraybuffer = read_function => {
        let file = read_function(in_file, 'binary');
        if (typeof file.buffer !== 'object' || file.byteLength === undefined || file.length === undefined || file.BYTES_PER_ELEMENT !== 1 || file.byteOffset !== 0)
            throw Error('Expected a Uint8Array');
        let str = '';
        for (var i = 0; i != file.length; ++i)
            str += String.fromCharCode(file[i]);  // Assume ASCII.
        check(str);
    };

    const test_string = read_function => {
        let str = read_function(in_file);
        if (typeof str !== 'string')
            throw Error('Expected a string');
        check(str);
    };

    // jsc's original file reading function is `readFile`, whereas SpiderMonkey
    // shell's file reading function is `read`. The latter is used by
    // emscripten's shell.js (d8 calls it `readbuffer`, which shell.js
    // polyfills).
    test_arraybuffer(readFile);
    test_arraybuffer(read);
    test_string(readFile);
    test_string(read);
})();
