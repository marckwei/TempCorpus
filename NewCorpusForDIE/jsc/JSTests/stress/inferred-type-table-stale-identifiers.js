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

var o = {};
o.f = 1;
o.g = 2;

var p = {};
p.f = 1;
p.g = 2;

function foo(o) {
    o.i0 = 0
    o.i1 = 1
    o.i2 = 2
    o.i3 = 3
    o.i4 = 4
    o.i5 = 5
    o.i6 = 6
    o.i7 = 7
    o.i8 = 8
    o.i9 = 9
    o.i10 = 10
    o.i11 = 11
    o.i12 = 12
    o.i13 = 13
    o.i14 = 14
    o.i15 = 15
    o.i16 = 16
    o.i17 = 17
    o.i18 = 18
    o.i19 = 19
    o.i20 = 20
    o.i21 = 21
    o.i22 = 22
    o.i23 = 23
    o.i24 = 24
    o.i25 = 25
    o.i26 = 26
    o.i27 = 27
    o.i28 = 28
    o.i29 = 29
    o.i30 = 30
    o.i31 = 31
    o.i32 = 32
    o.i33 = 33
    o.i34 = 34
    o.i35 = 35
    o.i36 = 36
    o.i37 = 37
    o.i38 = 38
    o.i39 = 39
    o.i40 = 40
    o.i41 = 41
    o.i42 = 42
    o.i43 = 43
    o.i44 = 44
    o.i45 = 45
    o.i46 = 46
    o.i47 = 47
    o.i48 = 48
    o.i49 = 49
    o.i50 = 50
    o.i51 = 51
    o.i52 = 52
    o.i53 = 53
    o.i54 = 54
    o.i55 = 55
    o.i56 = 56
    o.i57 = 57
    o.i58 = 58
    o.i59 = 59
    o.i60 = 60
    o.i61 = 61
    o.i62 = 62
    o.i63 = 63
    o.i64 = 64
    o.i65 = 65
    o.i66 = 66
    o.i67 = 67
    o.i68 = 68
    o.i69 = 69
    o.i70 = 70
    o.i71 = 71
    o.i72 = 72
    o.i73 = 73
    o.i74 = 74
    o.i75 = 75
    o.i76 = 76
    o.i77 = 77
    o.i78 = 78
    o.i79 = 79
    o.i80 = 80
    o.i81 = 81
    o.i82 = 82
    o.i83 = 83
    o.i84 = 84
    o.i85 = 85
    o.i86 = 86
    o.i87 = 87
    o.i88 = 88
    o.i89 = 89
    o.i90 = 90
    o.i91 = 91
    o.i92 = 92
    o.i93 = 93
    o.i94 = 94
    o.i95 = 95
    o.i96 = 96
    o.i97 = 97
    o.i98 = 98
    o.i99 = 99
}

foo(o);
foo = null;
o = null;
fullGC();

function bar(o) {
    o.j0 = 0
    o.j1 = 1
    o.j2 = 2
    o.j3 = 3
    o.j4 = 4
    o.j5 = 5
    o.j6 = 6
    o.j7 = 7
    o.j8 = 8
    o.j9 = 9
    o.j10 = 10
    o.j11 = 11
    o.j12 = 12
    o.j13 = 13
    o.j14 = 14
    o.j15 = 15
    o.j16 = 16
    o.j17 = 17
    o.j18 = 18
    o.j19 = 19
    o.j20 = 20
    o.j21 = 21
    o.j22 = 22
    o.j23 = 23
    o.j24 = 24
    o.j25 = 25
    o.j26 = 26
    o.j27 = 27
    o.j28 = 28
    o.j29 = 29
    o.j30 = 30
    o.j31 = 31
    o.j32 = 32
    o.j33 = 33
    o.j34 = 34
    o.j35 = 35
    o.j36 = 36
    o.j37 = 37
    o.j38 = 38
    o.j39 = 39
    o.j40 = 40
    o.j41 = 41
    o.j42 = 42
    o.j43 = 43
    o.j44 = 44
    o.j45 = 45
    o.j46 = 46
    o.j47 = 47
    o.j48 = 48
    o.j49 = 49
    o.j50 = 50
    o.j51 = 51
    o.j52 = 52
    o.j53 = 53
    o.j54 = 54
    o.j55 = 55
    o.j56 = 56
    o.j57 = 57
    o.j58 = 58
    o.j59 = 59
    o.j60 = 60
    o.j61 = 61
    o.j62 = 62
    o.j63 = 63
    o.j64 = 64
    o.j65 = 65
    o.j66 = 66
    o.j67 = 67
    o.j68 = 68
    o.j69 = 69
    o.j70 = 70
    o.j71 = 71
    o.j72 = 72
    o.j73 = 73
    o.j74 = 74
    o.j75 = 75
    o.j76 = 76
    o.j77 = 77
    o.j78 = 78
    o.j79 = 79
    o.j80 = 80
    o.j81 = 81
    o.j82 = 82
    o.j83 = 83
    o.j84 = 84
    o.j85 = 85
    o.j86 = 86
    o.j87 = 87
    o.j88 = 88
    o.j89 = 89
    o.j90 = 90
    o.j91 = 91
    o.j92 = 92
    o.j93 = 93
    o.j94 = 94
    o.j95 = 95
    o.j96 = 96
    o.j97 = 97
    o.j98 = 98
    o.j99 = 99
}

bar(p);
