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

const search = /q=(\w+)\+(\w+)/;
const string = 'q=abc+def';

shouldBe(string.replace(search, '$1 $2'), 'abc def');
shouldBe(string.replace(search, '$01 $02'), 'abc def');
shouldBe(string.replace(search, '$0$1$3$2$4'), '$0abc$3def$4');
shouldBe(string.replace(search, '$00$01$03$02$04'), '$00abc$03def$04');
shouldBe(string.replace(search, '$10$21$32$43'), 'abc0def1$32$43');

shouldBe(search[Symbol.replace](string, '$1 $2'), 'abc def');
shouldBe(search[Symbol.replace](string, '$01 $02'), 'abc def');
shouldBe(search[Symbol.replace](string, '$0$1$3$2$4'), '$0abc$3def$4');
shouldBe(search[Symbol.replace](string, '$00$01$03$02$04'), '$00abc$03def$04');
shouldBe(search[Symbol.replace](string, '$10$21$32$43'), 'abc0def1$32$43');

const longSearch = new RegExp(
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)' +
    '(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)(\\w)'
);

const longString =
    'abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXY' +
    'abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXY';

const longReplace =
    '$0$1$2$3$4$5$6$7$8$9' +
    '$10$11$12$13$14$15$16$17$18$19' +
    '$20$21$22$23$24$25$26$27$28$29' +
    '$30$31$32$33$34$35$36$37$38$39' +
    '$40$41$42$43$44$45$46$47$48$49' +
    '$50$51$52$53$54$55$56$57$58$59' +
    '$60$61$62$63$64$65$66$67$68$69' +
    '$70$71$72$73$74$75$76$77$78$79' +
    '$80$81$82$83$84$85$86$87$88$89' +
    '$90$91$92$93$94$95$96$97$98$99$100';

shouldBe(longString.replace(longSearch, longReplace), '$0abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXj0');
shouldBe(longSearch[Symbol.replace](longString, longReplace), '$0abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXj0');
