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

description("Tests that assignments to global variables behave properly when the property table is rehashed.");

var result;

result = (function() {
    a = 0;
    b = 1;
    c = 2;
    d = 3;
    e = 4;
    f = 5;
    g = 6;
    h = 7;
    i = 8
    j = 9;
    k = 10;
    l = 11;
    m = 12;
    n = 13;
    o = 14;
    p = 15;
    q = 16;
    r = 17;
    s = 18;
    t = 19;
    u = 20;
    v = 21;
    w = 22;
    x = 23;
    y = 24;
    z = 25;
    aa = 0;
    bb = 1;
    cc = 2;
    dd = 3;
    ee = 4;
    ff = 5;
    gg = 6;
    hh = 7;
    ii = 8;
    jj = 9;
    kk = 10;
    ll = 11;
    mm = 12;
    nn = 13;
    oo = 14;
    pp = 15;
    qq = 16;
    rr = 17;
    ss = 18;
    tt = 19;
    uu = 20;
    vv = 21;
    ww = 22;
    xx = 23;
    yy = 24;
    zz = 25;
    aaa = 0;
    bbb = 1;
    ccc = 2;
    ddd = 3;
    eee = 4;
    fff = 5;                        
    ggg = 6;
    hhh = 7;
    iii = 8;
    jjj = 9;
    kkk = 10;
    lll = 11;
    mmm = 12;
    nnn = 13;
    ooo = 14;
    ppp = 15;
    qqq = 16;
    rrr = 17;
    sss = 18;
    ttt = 19;
    uuu = 20;
    vvv = 21;
    www = 22;
    xxx = 23;
    yyy = 24;
    zzz = 25;
    aaaa = 0;
    bbbb = 1;
    cccc = 2;
    dddd = 3;
    eeee = 4;
    ffff = 5;
    gggg = 6;
    hhhh = 7;
    iiii = 8;
    jjjj = 9;
    kkkk = 10;
    llll = 11;
    mmmm = 12;
    nnnn = 13;
    oooo = 14;
    pppp = 15;
    qqqq = 16;
    rrrr = 17;
    ssss = 18;
    tttt = 19;
    uuuu = 20;
    vvvv = 21;
    wwww = 22;
    xxxx = 23;
    yyyy = 24;
    zzzz = 25;
    return 1;
})();

shouldBe(result.toString(), "1");
