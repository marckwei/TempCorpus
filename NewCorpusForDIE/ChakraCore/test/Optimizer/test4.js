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
a = 9527;
b = -64699;
c = -25554;
d = -1027;
e = 38769;
f = 23687;
g = -45707;
h = 59747;
obj0.a = -40855;
obj0.b = -48104;
obj0.c = 52607;
obj0.d = 7395;
obj0.e = 35818;
ary[0] = -31325;
ary[1] = 41012;
ary[100] = 22211;
if(((((g | obj0.e) ^ (obj0.e & 38138)) * ((48489 & 29145) + d)) > (((a++ ) & (a | c)) | ((a == obj0.d) - obj0.d)))) {
  obj0.e = ((obj0.d - 18948) == (((-21093 | 37040) & (-22118 | g)) | (f | (-51195 & obj0.b))));
} else {
  if(((obj0.e * obj0.e) < ((b * g) + ((++ e) + g)))) {
  } else {
    h = ((obj0.a & (-33933 & (g + obj0.a))) | (((obj0.e > b) * g) | (d ^ obj0.e)));
  }
}
if(((obj0.e * obj0.e) >= (((- 44358) | (h++ )) * -58848))) {
  e = ((obj0.d & 27173) * (((64303 == e) ? a : (162 ^ -35630)) - (c <= (-5703 - 46399))));
  if(((c + obj0.c) >= (f | f))) {
  } else {
    if(((h * -14051) <= (((10391 != -12563) + -22661) ^ (a + a)))) {
      g = (+ (((f ^ e) < (e + obj0.d)) * (! (obj0.d & a))));
    } else {
      obj0.d = obj0.e;
    }
    b = (((-62984 | obj0.c) + b) * (((obj0.b <= f) & obj0.c) * ((a | h) - (43180 | obj0.a))));
    obj0.a = ((-5755 ^ ((obj0.e ? 49785 : b) + f)) & (a ^ (d * (obj0.b++ ))));
  }
} else {
  if(((c & a) < (b - (-49361 != b)))) {
  } else {
    e = -53869;
    if(((((51746 + e) + e) * ((-45183 < 35342) ? (obj0.d * -10051) : h)) < ((a * obj0.d) + ((c - obj0.a) & (-53399 < -52903))))) {
    } else {
    }
  }
  obj0.a = ((obj0.d * ((e > obj0.a) ? e : (obj0.a <= obj0.d))) - (((obj0.d - -58952) + (-30962 - 1311)) | obj0.d));
  if(((obj0.b & obj0.b) > (((d - f) > obj0.b) & 44129))) {
    obj0.c = ((((a ^ obj0.e) - obj0.d) + d) ? (((obj0.a * 32127) | -44696) * (h + a)) : ((g - (obj0.a != obj0.d)) | 36263));
    a = ((d * (obj0.c++ )) & (obj0.a & 61391));
  } else {
    if((((! (d - f)) ^ 20340) < (23895 | (obj0.d - -47354)))) {
      obj0.b = ((((- h) * (c * -11885)) + ((! 48812) >= (-20811 ? 16412 : -42547))) - (obj0.d & (d * d)));
      e = ((obj0.a * ((58639 ^ -59471) & (-33015 - obj0.a))) + (((obj0.c | g) & b) ^ 32548));
      e = 14444;
    } else {
      obj0.c = b;
      f = (((e + (b ? 31854 : -63659)) - ((! f) - (3442 ^ obj0.c))) ^ (obj0.b | (h - (-19254 + g))));
      obj0.b = ((c + ((-9446 == -58533) <= (d == e))) + (((d > 34518) ? f : (obj0.a & h)) & (e++ )));
    }
  }
}
if((((d >= (18560 == e)) & obj0.e) <= (obj0.d + ((51122 ^ e) - -38092)))) {
  obj0.e = ((((obj0.d <= -39255) > g) + (obj0.e ^ (a ? 33469 : obj0.e))) & (((obj0.e - 61164) - (55164 ? -32714 : e)) | (a * (g >= f))));
  h = 13428;
} else {
  if(((a & (21072 & obj0.a)) <= (e & ((e + -64083) ^ (g ? d : -10633))))) {
  } else {
    if(((((f * 11245) ^ (+ -52603)) * b) == (((obj0.e ^ h) * f) - (d ^ g)))) {
    } else {
      e = h;
      b = ((d + ((-60263 | a) ^ c)) & (h - ((e * -53894) & f)));
      c = (+ (obj0.d * -8807));
    }
  }
  if((((12063 | (-54351 * b)) ^ b) != (b - ((c & a) > obj0.c)))) {
    if(((((obj0.d & -32132) + (obj0.e & 36702)) + f) > ((! (- 52854)) - ((-21980 <= 30023) ? (c | -7933) : (17132 ^ a))))) {
    } else {
      obj0.d = (((h >= 45260) - ((49547 * 14535) ^ d)) ^ ((obj0.d <= (e + -20473)) - obj0.b));
      h = ((e & ((-37227 < -50386) & (-24213 - -19751))) * (obj0.b - ((obj0.b + -7936) + obj0.b)));
    }
    if(((a * ((d == obj0.b) ? d : (-29943 ? -29314 : c))) <= ((b + obj0.e) & c))) {
      c = (- (g ^ a));
      a = (((e == (63040 * 16689)) * c) ^ (obj0.b - -26714));
    } else {
      a = obj0.a;
    }
  } else {
    if(((g * (h & (60040 - obj0.e))) >= (((-58591 <= -32466) - -32389) | c))) {
      g = 32790;
      c = h;
    } else {
      obj0.a = obj0.a;
      g = ((((-48034 * g) & obj0.a) | -10753) - (h - ((! 24988) + (-64618 ? -26401 : obj0.d))));
      d = ((((-23805 - 13872) & -56859) ^ ((39473 + 38825) * b)) * ((! (-52955 < -53369)) & (obj0.d + (h ^ obj0.d))));
    }
    if(((h ^ h) > (a * c))) {
    } else {
      obj0.b = ((-51184 | (obj0.a + (obj0.a + f))) ^ (obj0.a & (a + (-59560 * 57438))));
      h = ((((h & obj0.b) * (g - -7878)) ^ (c & h)) - (-37996 - ((39018 ? obj0.a : c) ^ h)));
    }
  }
  if((((e * 16559) * ((b + 3340) + (obj0.e - e))) == ((e & h) & (b * -53276)))) {
    h = ((obj0.d * ((60650 + -54300) * (a | g))) ? (((obj0.d < 62323) ? obj0.b : 21131) & ((-18445 & 50859) + (-55820 > 27749))) : (a + (e - g)));
    if(((60916 * 12613) != (((-8235 * d) - (-24571 * obj0.e)) * -53990))) {
      obj0.b = ((f - 1525) - ((e | (d - c)) ^ a));
    } else {
    }
  } else {
    if(((e * ((- -55468) - a)) > (((e & 50120) * -378) ^ obj0.b))) {
      f = ((b - e) ? (((! 25185) | a) ^ obj0.d) : (g + ((- 53353) | g)));
      c = f;
      a = ((((11681 + -6888) != obj0.d) | (a++ )) > (((obj0.b ? c : obj0.a) + obj0.b) | obj0.c));
    } else {
      h = ((obj0.d - obj0.e) * ((obj0.c * e) ^ (obj0.d * (obj0.a ? h : d))));
    }
  }
}
if((((a - (a++ )) - ((g | f) * (65296 | a))) != (-31017 & ((35634 >= 18185) ? (c != 52030) : (b - b))))) {
} else {
  if(((obj0.e + obj0.e) == (((obj0.d & -24225) <= obj0.b) + h))) {
    f = h;
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
