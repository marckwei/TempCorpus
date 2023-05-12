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

function write(args)
{
  WScript.Echo(args)
}

write("Scenario 1");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(0,3,1,2,3,4));
write(a);
write(a.length);

write("Scenario 2");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(0,3,1,2));
write(a);
write(a.length);

write("Scenario 3");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(0,3,1,2,3));
write(a);
write(a.length);

write("Scenario 4");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(0,3,1,2,3));
write(a);
write(a.length);

write("Scenario 5");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(0,3,1,2,3));
write(a);
write(a.length);

write("Scenario 6");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(4,4,1,2,3,4));
write(a);
write(a.length);

write("Scenario 7");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(4,4,1,2,3));
write(a);
write(a.length);

write("Scenario 8");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(4,4,1,2,3,4,5));
write(a);
write(a.length);


write("Scenario 9");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(4,5,1,2,3,4,5));
write(a);
write(a.length);

write("Scenario 10");
var  a = [1,2,3,4,5,6,7,8];
write(a.splice(4,10,1,2,3,4,5));
write(a);
write(a.length);

write("Scenario 11");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(17,1,1));
write(a);
write(a.length);

write("Scenario 12");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(17,10));
write(a);
write(a.length);

write("Scenario 13");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(17,0,1));
write(a);
write(a.length);


write("Scenario 14");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(17,0,1,2,3,4));
write(a);
write(a.length);



write("Scenario 16");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(10,5,1,2,3,4));
write(a);
write(a.length);

write("Scenario 17");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(10,8,1,2,3,4));
write(a);
write(a.length);

write("Scenario 18");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(10,8,1,2,3,4,5,6,7,8));
write(a);
write(a.length);

write("Scenario 19");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(10,20,1,2,3,4));
write(a);
write(a.length);

write("Scenario 20");
var  a = [];
a[10] = 10;
a[11] = 11;
a[12] = 12;
a[13] = 13;
a[14] = 14;
a[15] = 15;
a[16] = 16;
a[17] = 17;
write(a.splice(10,5,1,2,3,4,5,6,7));
write(a);
write(a.length);
