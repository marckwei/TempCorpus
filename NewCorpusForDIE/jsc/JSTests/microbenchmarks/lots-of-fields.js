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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
// This test uses all available memory on some small memory devices.
//@ skip if $memoryLimited

function foo() {
    var result = 0;
    for (var i = 0; i < 5000; ++i) {
        var o = {};
        o.i0 = 0;
        o.i1 = 1;
        o.i2 = 2;
        o.i3 = 3;
        o.i4 = 4;
        o.i5 = 5;
        o.i6 = 6;
        o.i7 = 7;
        o.i8 = 8;
        o.i9 = 9;
        o.i10 = 10;
        o.i11 = 11;
        o.i12 = 12;
        o.i13 = 13;
        o.i14 = 14;
        o.i15 = 15;
        o.i16 = 16;
        o.i17 = 17;
        o.i18 = 18;
        o.i19 = 19;
        o.i20 = 20;
        o.i21 = 21;
        o.i22 = 22;
        o.i23 = 23;
        o.i24 = 24;
        o.i25 = 25;
        o.i26 = 26;
        o.i27 = 27;
        o.i28 = 28;
        o.i29 = 29;
        o.i30 = 30;
        o.i31 = 31;
        o.i32 = 32;
        o.i33 = 33;
        o.i34 = 34;
        o.i35 = 35;
        o.i36 = 36;
        o.i37 = 37;
        o.i38 = 38;
        o.i39 = 39;
        o.i40 = 40;
        o.i41 = 41;
        o.i42 = 42;
        o.i43 = 43;
        o.i44 = 44;
        o.i45 = 45;
        o.i46 = 46;
        o.i47 = 47;
        o.i48 = 48;
        o.i49 = 49;
        o.i50 = 50;
        o.i51 = 51;
        o.i52 = 52;
        o.i53 = 53;
        o.i54 = 54;
        o.i55 = 55;
        o.i56 = 56;
        o.i57 = 57;
        o.i58 = 58;
        o.i59 = 59;
        o.i60 = 60;
        o.i61 = 61;
        o.i62 = 62;
        o.i63 = 63;
        o.i64 = 64;
        o.i65 = 65;
        o.i66 = 66;
        o.i67 = 67;
        o.i68 = 68;
        o.i69 = 69;
        o.i70 = 70;
        o.i71 = 71;
        o.i72 = 72;
        o.i73 = 73;
        o.i74 = 74;
        o.i75 = 75;
        o.i76 = 76;
        o.i77 = 77;
        o.i78 = 78;
        o.i79 = 79;
        o.i80 = 80;
        o.i81 = 81;
        o.i82 = 82;
        o.i83 = 83;
        o.i84 = 84;
        o.i85 = 85;
        o.i86 = 86;
        o.i87 = 87;
        o.i88 = 88;
        o.i89 = 89;
        o.i90 = 90;
        o.i91 = 91;
        o.i92 = 92;
        o.i93 = 93;
        o.i94 = 94;
        o.i95 = 95;
        o.i96 = 96;
        o.i97 = 97;
        o.i98 = 98;
        o.i99 = 99;
        o.i100 = 100;
        o.i101 = 101;
        o.i102 = 102;
        o.i103 = 103;
        o.i104 = 104;
        o.i105 = 105;
        o.i106 = 106;
        o.i107 = 107;
        o.i108 = 108;
        o.i109 = 109;
        o.i110 = 110;
        o.i111 = 111;
        o.i112 = 112;
        o.i113 = 113;
        o.i114 = 114;
        o.i115 = 115;
        o.i116 = 116;
        o.i117 = 117;
        o.i118 = 118;
        o.i119 = 119;
        o.i120 = 120;
        o.i121 = 121;
        o.i122 = 122;
        o.i123 = 123;
        o.i124 = 124;
        o.i125 = 125;
        o.i126 = 126;
        o.i127 = 127;
        o.i128 = 128;
        o.i129 = 129;
        o.i130 = 130;
        o.i131 = 131;
        o.i132 = 132;
        o.i133 = 133;
        o.i134 = 134;
        o.i135 = 135;
        o.i136 = 136;
        o.i137 = 137;
        o.i138 = 138;
        o.i139 = 139;
        o.i140 = 140;
        o.i141 = 141;
        o.i142 = 142;
        o.i143 = 143;
        o.i144 = 144;
        o.i145 = 145;
        o.i146 = 146;
        o.i147 = 147;
        o.i148 = 148;
        o.i149 = 149;
        o.i150 = 150;
        o.i151 = 151;
        o.i152 = 152;
        o.i153 = 153;
        o.i154 = 154;
        o.i155 = 155;
        o.i156 = 156;
        o.i157 = 157;
        o.i158 = 158;
        o.i159 = 159;
        o.i160 = 160;
        o.i161 = 161;
        o.i162 = 162;
        o.i163 = 163;
        o.i164 = 164;
        o.i165 = 165;
        o.i166 = 166;
        o.i167 = 167;
        o.i168 = 168;
        o.i169 = 169;
        o.i170 = 170;
        o.i171 = 171;
        o.i172 = 172;
        o.i173 = 173;
        o.i174 = 174;
        o.i175 = 175;
        o.i176 = 176;
        o.i177 = 177;
        o.i178 = 178;
        o.i179 = 179;
        o.i180 = 180;
        o.i181 = 181;
        o.i182 = 182;
        o.i183 = 183;
        o.i184 = 184;
        o.i185 = 185;
        o.i186 = 186;
        o.i187 = 187;
        o.i188 = 188;
        o.i189 = 189;
        o.i190 = 190;
        o.i191 = 191;
        o.i192 = 192;
        o.i193 = 193;
        o.i194 = 194;
        o.i195 = 195;
        o.i196 = 196;
        o.i197 = 197;
        o.i198 = 198;
        o.i199 = 199;
        for (var j = 0; j < 100; ++j)
            result += o.i100;
    }
    return result;
}

var result = foo();
if (result != 50000000)
    throw "Error: bad result: " + result;
