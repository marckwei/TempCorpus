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

WScript.LoadScriptFile("util.js");

function oneTest(a)
{
    a[1] = 0x80000000;
    a[5] = 10;
    WScript.Echo(a[5]);
    if (Object.getOwnPropertyDescriptor(a, 100000) != undefined) {
        WScript.Echo('FAIL');
    }

    try {
        var pro = Uint32Array.prototype;
        WScript.Echo(pro.toString());

        WScript.Echo("prototype is");
        printObj(pro);
    } catch(e) {
        WScript.Echo("constructor is");
        printObj(Uint32Array);
    }

    WScript.Echo("object is");
    printObj(a);

    a[20] =20;
    a.foo ='bar';
    WScript.Echo("object after expando is");
    printObj(a);
    WScript.Echo("");
}

WScript.Echo("test1");
var test1 = new Uint32Array(9);
oneTest(test1);

WScript.Echo("test2");
var test2 = new Uint32Array(0);
oneTest(test2);

WScript.Echo("test3");
var arrayBuffer = new ArrayBuffer(32);
var test3 = new Uint32Array(arrayBuffer);
oneTest(test3);

WScript.Echo("test4");
var test4 = new Uint32Array(arrayBuffer, 4);
oneTest(test4);

WScript.Echo("test5");
var test5 = new Uint32Array(arrayBuffer, 4, 6);
oneTest(test5);

WScript.Echo("test6");
var mybuffer = test1.buffer;
WScript.Echo(mybuffer);
var test6 = new Uint32Array(mybuffer);
oneTest(test6);

WScript.Echo("test7");
var test7 = new Uint32Array(test1.buffer, 4);
oneTest(test7);

WScript.Echo("test8");
var test8 = new Uint32Array(test1.buffer, 4, 6);
oneTest(test8);

var arr = [1,2,3,4,5,6,7,8,9,10,11,12];

WScript.Echo("test9");
var test9 = new Uint32Array(arr);
oneTest(test9);

WScript.Echo("test9.1");
printObj(test1);
test9.set(test1);
oneTest(test9);

WScript.Echo("test9.2");
test9.set(test5);
oneTest(test9);

WScript.Echo("test10");
var test10 = new Uint32Array({});
oneTest(test10);

WScript.Echo("test10.1");
try {
    var test101 = new Uint32Array(test1.buffer, 3, 6);
    oneTest(test101);
}
catch(e)
{
    WScript.Echo("succeed with catching" + e);
}

WScript.Echo("test11");
var test11 = new Uint32Array('abcdefg');
oneTest(test11);

WScript.Echo("test11.1");
var test11 = new Uint32Array(new String('abcdefg'));
oneTest(test11);


WScript.Echo("test12");
var test12 = new Uint32Array(0);
oneTest(test12);


WScript.Echo("test13");
var test13 = new Uint32Array(arrayBuffer, 0);
oneTest(test13);


WScript.Echo("test14");
try
{
    var test14 = new Uint32Array(arrayBuffer, 0, 0);
    oneTest(test14);
}
catch(e)
{
    WScript.Echo("succeed with catching" + e);
}


WScript.Echo("test15");
try
{
    var test15 = new Uint32Array(arrayBuffer, 0, 40);
    oneTest(test15);
}
catch(e)
{
    WScript.Echo("succeed with catching" + e);
}

WScript.Echo("test16");
try
{
    var test16 = new Uint32Array(arrayBuffer, 40, 4);
    oneTest(test16);
}
catch(e)
{
    WScript.Echo("succeed with catching" + e);
}

WScript.Echo("test17");
var test17 = test5.subarray(0);
printObj(test17);

WScript.Echo("test18");
var test18 = test5.subarray(4);
printObj(test18);

WScript.Echo("test19");
var test19    = test5.subarray(0, 3);
printObj(test19);


WScript.Echo("test20");
WScript.Echo(Uint32Array.prototype[10]);
WScript.Echo(Uint32Array.prototype[-1]);
WScript.Echo(Uint32Array.prototype[2]);
Uint32Array.prototype[2] = 10;
WScript.Echo(Uint32Array.prototype[2]);

WScript.Echo("test21");
testSetWithInt(-1, 2, new Uint32Array(3), new Uint32Array(3), new Uint32Array(3));
testSetWithFloat(-1, 2, new Uint32Array(3), new Uint32Array(3), new Uint32Array(3));
testSetWithObj(-1, 2, new Uint32Array(3), new Uint32Array(3), new Uint32Array(3));

WScript.Echo("test21 JIT");
testSetWithInt(-1, 2, new Uint32Array(3), new Uint32Array(3), new Uint32Array(3));
testSetWithFloat(-1, 2, new Uint32Array(3), new Uint32Array(3), new Uint32Array(3));
testSetWithObj(-1, 2, new Uint32Array(3), new Uint32Array(3), new Uint32Array(3));

WScript.Echo("test22");
testIndexValueForSet(new Uint32Array(5));
WScript.Echo("test22 JIT");
testIndexValueForSet(new Uint32Array(5));
