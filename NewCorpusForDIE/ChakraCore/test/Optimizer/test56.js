function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
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

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

(function() {
var ary = new Array(10);
var obj0 = new Object();
var a;
var b;
var c;
var d;
var e;
var f;
var g;
var h;
a = -51891;
b = -14;
c = 8234;
d = 28838;
e = 9518;
f = -13516;
g = -46045;
h = -16113;
obj0.a = -37273;
obj0.b = 58993;
obj0.c = -26706;
obj0.d = -59546;
obj0.e = 44811;
ary[0] = -20729;
ary[1] = -23770;
ary[100] = -5973;
if((((55537 + (d ? f : 64480)) | ((-14852 + -12228) - a)) >= ((obj0.c & (obj0.d | 45750)) | (obj0.c & (a & 65486))))) {
  if((((-19754 & a) ^ a) == (f * obj0.d))) {
    if(((e * ((++ h) <= f)) != (((+ e) ^ c) * ((d & 64638) - obj0.a)))) {
      d = ((obj0.d ^ 56745) & (g - (b * (++ e))));
      f = obj0.c;
    } else {
    }
  } else {
  }
  if((((! obj0.a) - (obj0.b | obj0.d)) == ((- (h | b)) ^ h))) {
    obj0.a = (+ (obj0.c & ((-7496 | 7523) ^ (45685 - -60204))));
    if((((obj0.d ^ obj0.e) - obj0.b) > ((+ -58352) & ((-25537 - d) + (27643 * 54020))))) {
      h = (! (obj0.d & -4971));
    } else {
      a = ((((-46251 < d) ? (a * -43192) : obj0.c) + ((-33328 & 9646) * (f < d))) >= (((+ -38431) | -53339) - ((+ obj0.d) + h)));
      c = (! ((! a) & obj0.d));
    }
  } else {
    if((((+ d) - ((a + a) != (c & 22308))) <= (((f & 1552) + e) ^ a))) {
      obj0.a = a;
      b = d;
    } else {
      obj0.d = ((f * -33105) | (((-45750 > -57774) * (60737 ^ h)) * (++ obj0.e)));
    }
    if(((((34535 ? 7714 : obj0.c) <= h) & (obj0.c * -38915)) != (((++ e) * f) | d))) {
      g = h;
      obj0.c = (((obj0.e > (-43666 ^ obj0.c)) | (f & -48272)) * ((c > c) & ((+ -58032) & obj0.e)));
    } else {
      obj0.b = (! (obj0.a & c));
      f = obj0.b;
      obj0.e = (((a ^ (-8192 ? -6420 : d)) & (obj0.e >= (c >= d))) ? (((-55896 * obj0.a) - obj0.c) & ((- 58394) & (354 & obj0.e))) : (-44398 & ((38453 <= 33430) ? c : (h != e))));
    }
    if(((((obj0.b & f) + obj0.d) | -58618) <= ((-4271 * obj0.a) ^ ((obj0.e + 31640) > -22972)))) {
      obj0.b = (+ ((obj0.c & h) ^ a));
    } else {
    }
  }
} else {
  if(((obj0.a - e) > ((h * (-60893 <= 21582)) | ((g * 23943) & g)))) {
    f = ((((obj0.d + -17816) > (-32149 == -23330)) * (obj0.c == (26022 ? h : a))) ? (((g == -40932) ? (obj0.b * obj0.a) : (obj0.b++ )) ^ ((19793 >= e) ? (-59659 ^ -41010) : (22748 | c))) : (((6067 * 45676) + (-64920 ^ -37969)) * obj0.c));
  } else {
    if(((c & obj0.d) < (46635 - (++ d)))) {
      obj0.a = b;
    } else {
      g = obj0.b;
    }
    c = obj0.d;
    if(((g ^ ((c * -15087) * (61071 | -2991))) != (((-17401 == b) * e) | ((-47240 + f) ^ (++ a))))) {
      d = (((f | (-58441 + -5743)) - obj0.d) | (((f ? -24128 : -31413) & (f ? e : obj0.d)) - ((obj0.a ? -26661 : f) * b)));
    } else {
      d = obj0.d;
    }
  }
  h = ((f - f) * (a + obj0.e));
}
if(((-10422 ^ (++ obj0.e)) > (((44027 + -58275) <= (-53519 ? g : a)) | ((c & -61844) - (obj0.d == obj0.a))))) {
  f = g;
} else {
  if(((((obj0.d <= 30288) - d) - ((++ e) + (- obj0.d))) != (f & obj0.d))) {
    e = (+ ((f - e) - a));
  } else {
    if(((d + ((d - 26656) ^ (33899 ? obj0.c : f))) < (((62421 + 39452) + -16907) | (obj0.b * (-49977 + obj0.d))))) {
      obj0.d = e;
    } else {
      g = ((-23641 | ((-41453 >= c) ? a : (obj0.d | obj0.b))) * ((-54391 + (e & c)) - (obj0.b ^ (h | 61694))));
    }
    h = ((c + ((e < 24442) ? (g >= 52798) : (obj0.d & 6154))) >= (obj0.b + obj0.d));
    if((((f * (21198 & obj0.d)) - (b - obj0.c)) < ((obj0.b + (-25027 ^ -9170)) | (c | obj0.c)))) {
      c = obj0.c;
    } else {
      d = ((obj0.c & (b - (c ^ -65379))) ? ((h * (obj0.a - a)) ^ ((g - b) - g)) : (c * 40652));
    }
  }
  if(((((-49979 <= a) ? obj0.d : (++ g)) | ((-25462 ^ 1830) & (-34720 + e))) >= ((+ (+ c)) | ((-31438 != 39968) * (obj0.a * c))))) {
    obj0.b = obj0.e;
  } else {
    obj0.e = ((((3281 * -47111) != c) & (++ obj0.c)) == (d + a));
    h = ((obj0.c * (obj0.e > (1009 & 7854))) + (-58699 ^ obj0.d));
    a = ((((obj0.b >= -29296) ? a : (52944 | e)) ^ (++ obj0.e)) ^ (a ^ ((obj0.d++ ) * obj0.d)));
  }
}
if((((18689 <= (-8757 ^ -40292)) - (- g)) <= ((c | -13382) + e))) {
  obj0.d = (((c * g) - ((-18089 & -38647) <= obj0.b)) + (((a <= e) ? (a & obj0.a) : 20960) * (obj0.c * d)));
  if(((25902 ^ (- (25940 ? -13627 : c))) == (((obj0.a * -20957) >= f) - ((12735 * 41224) & (++ b))))) {
    if(((((35810 & b) <= h) + ((e + 14324) <= d)) < (((-40062 * -19708) ^ (23479 + -19884)) ^ ((e & obj0.c) - (26788 & obj0.b))))) {
      a = ((((48541 != obj0.d) ? -45088 : (54559 * -29542)) * h) - ((f + (obj0.a ^ -60991)) + d));
    } else {
    }
    obj0.b = obj0.c;
  } else {
    if((((obj0.d - (31703 == h)) * ((! -10400) ^ obj0.d)) < (e ^ ((-33924 - -14104) & (obj0.d != -20266))))) {
    } else {
      f = (((obj0.a - (+ -63896)) + (a ^ obj0.c)) * (d ^ (obj0.a | obj0.c)));
      e = obj0.e;
      obj0.c = c;
    }
    if(((obj0.b + obj0.c) > (((30252 > 11178) ? f : d) - (obj0.c ^ -48367)))) {
    } else {
      a = -20597;
    }
  }
} else {
  obj0.b = (- (((f++ ) >= g) * g));
  if((((-37347 ^ b) + (! (obj0.e++ ))) != (c | ((55259 <= f) ? obj0.b : obj0.b)))) {
  } else {
  }
  if(((((h & 813) + (obj0.c * obj0.a)) & obj0.b) == (((d - d) - (c - b)) & ((a ^ -40664) | (-58230 & d))))) {
    if(((obj0.c ^ b) <= (obj0.d - e))) {
      f = obj0.b;
      obj0.d = obj0.a;
      obj0.b = ((((h * e) * obj0.c) | -49312) - (c ^ obj0.c));
    } else {
      d = (((g | f) - (d > -5464)) | (obj0.a - (f | obj0.c)));
      h = ((obj0.c ^ h) ? (a + ((obj0.c ^ 6338) ^ c)) : (((58493 ? obj0.c : 20986) - (++ b)) + ((obj0.b - -20314) > (35679 - -9137))));
    }
  } else {
    if(((((-62047 | -42101) | -17654) | ((-38924 | obj0.b) & (obj0.d * 12421))) < (((- -10293) & (-22 == 22103)) + obj0.b))) {
      f = (! (-58200 - ((f < -22062) ? (+ 57231) : (e + 58600))));
      e = (- ((obj0.b * b) * (+ (- g))));
    } else {
    }
  }
}
if(((h * ((-40008 * 38925) | obj0.a)) <= ((- c) + (a + e)))) {
  obj0.c = obj0.b;
  obj0.e = obj0.c;
  if(((g + ((13611 + obj0.e) - d)) > (obj0.a - d))) {
    if(((obj0.e | obj0.d) > (a + obj0.e))) {
      obj0.c = ((obj0.d ^ ((27628 ^ 23368) ^ c)) | (obj0.e ^ obj0.e));
      obj0.b = obj0.c;
      obj0.d = d;
    } else {
    }
    if(((d ^ c) == (((-57899 ? 62537 : -65087) | d) + ((-16596 == f) * obj0.c)))) {
      obj0.c = ((((-34278 | c) + (14747 != 65158)) ^ ((! -32618) - b)) - ((h ^ (c + h)) & 54396));
      obj0.d = g;
      b = ((((-30777 & 39158) ^ (27217 | 58815)) ^ ((-45631 - e) ^ (b ? b : -49117))) ? (e + obj0.d) : (((-35616 != -52771) == (! g)) ^ (-698 * obj0.a)));
    } else {
    }
    obj0.d = obj0.d;
  } else {
    obj0.d = obj0.b;
    if(((((-43188 < 34261) | (53311 | c)) - c) <= (((-56990 <= 30134) ? f : (obj0.b == 30323)) ^ (- (-3511 ^ obj0.e))))) {
      g = obj0.c;
      obj0.c = ((f + obj0.b) ^ (a + g));
      d = (++ obj0.c);
    } else {
      f = ((((c == -5327) ? obj0.d : (+ 33495)) & ((-36137 == -7309) ? (19888 - -35201) : g)) & (e & ((+ d) & (obj0.a ^ obj0.d))));
      g = ((29086 * h) + ((+ g) + a));
      b = (((++ obj0.d) & ((obj0.e & 62304) | (obj0.a | 23106))) | (a | (+ (b ? h : -16483))));
    }
  }
} else {
  if(((((3171 + 59985) - 61317) * ((++ c) != (6917 - obj0.e))) > ((- (f & -3867)) + obj0.e))) {
  } else {
  }
}
WScript.Echo("a = " + (a>>3));
WScript.Echo("b = " + (b>>3));
WScript.Echo("c = " + (c>>3));
WScript.Echo("d = " + (d>>3));
WScript.Echo("e = " + (e>>3));
WScript.Echo("f = " + (f>>3));
WScript.Echo("g = " + (g>>3));
WScript.Echo("h = " + (h>>3));
WScript.Echo("obj0.a = " + (obj0.a>>3));
WScript.Echo("obj0.b = " + (obj0.b>>3));
WScript.Echo("obj0.c = " + (obj0.c>>3));
WScript.Echo("obj0.d = " + (obj0.d>>3));
WScript.Echo("obj0.e = " + (obj0.e>>3));
WScript.Echo("ary[0] = " + (ary[0]>>3));
WScript.Echo("ary[1] = " + (ary[1]>>3));
WScript.Echo("ary[100] = " + (ary[100]>>3));
WScript.Echo('done');
})();