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

function assert(b) {
  if (!b) throw new Error;
}

function shouldNotThrow(script) {
    eval(script);
}

function shouldThrowSyntaxError(script) {
    let error;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }

    if (!(error instanceof SyntaxError))
        throw new Error('Expected SyntaxError!');
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

class F { #x; static isF(obj) { return #x in obj; } }
class SF { static #x; static isSF(obj) { return #x in obj; } }

class M { #x() {} static isM(obj) { return #x in obj; } }
class SM { static #x() {} static isSM(obj) { return #x in obj; } }

class G { get #x() {} static isG(obj) { return #x in obj; } }
class SG { static get #x() {} static isSG(obj) { return #x in obj; } }

class S { set #x(v) {} static isS(obj) { return #x in obj; } }
class SS { static set #x(v) {} static isSS(obj) { return #x in obj; } }

function test() {
  assert(F.isF(new F));
  assert(!F.isF(F) && !F.isF(new M) && !F.isF({}));
  shouldThrowTypeError(() => F.isF(3));
  assert(SF.isSF(SF));
  assert(!SF.isSF(new SF) && !SF.isSF(SM) && !SF.isSF({}));
  shouldThrowTypeError(() => SF.isSF(3));

  assert(M.isM(new M));
  assert(!M.isM(M) && !M.isM(new F) && !M.isM({}));
  shouldThrowTypeError(() => M.isM(3));
  assert(SM.isSM(SM));
  assert(!SM.isSM(new SM) && !SM.isSM(SF) && !SM.isSM({}));
  shouldThrowTypeError(() => SM.isSM(3));

  assert(G.isG(new G));
  assert(!G.isG(G) && !G.isG(new F) && !G.isG({}));
  shouldThrowTypeError(() => G.isG(3));
  assert(SG.isSG(SG));
  assert(!SG.isSG(new SG) && !SG.isSG(SF) && !SG.isSG({}));
  shouldThrowTypeError(() => SG.isSG(3));

  assert(S.isS(new S));
  assert(!S.isS(S) && !S.isS(new F) && !S.isS({}));
  shouldThrowTypeError(() => S.isS(3));
  assert(SS.isSS(SS));
  assert(!SS.isSS(new SS) && !SS.isSS(SF) && !SS.isSS({}));
  shouldThrowTypeError(() => SS.isSS(3));
}
noInline(test);

for (let i = 0; i < 10000; i++)
  test();

shouldNotThrow(() => { class C { #x; f() { 0 == #x in {}; } } });
shouldNotThrow(() => { class C { #x; f() { 0 != #x in {}; } } });
shouldNotThrow(() => { class C { #x; f() { 0 === #x in {}; } } });
shouldNotThrow(() => { class C { #x; f() { 0 !== #x in {}; } } });
shouldThrowSyntaxError('class C { #x; f() { 0 < #x in {}; } }');
shouldThrowSyntaxError('class C { #x; f() { 0 > #x in {}; } }');
shouldThrowSyntaxError('class C { #x; f() { 0 <= #x in {}; } }');
shouldThrowSyntaxError('class C { #x; f() { 0 >= #x in {}; } }');
shouldThrowSyntaxError('class C { #x; f() { 0 instanceof #x in {}; } }');
shouldThrowSyntaxError('class C { #x; f() { 0 in #x in {}; } }');
