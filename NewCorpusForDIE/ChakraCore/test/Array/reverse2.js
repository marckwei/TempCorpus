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

function write(v) { WScript.Echo(v + ""); }

for (var i=0;i<100; i += 2)
{
    Array.prototype[i] = (i*i) + 1000;
}

function Test()
{

    var args = arguments;
    var a = new Array();

    while (args.length > 1)
    {

        var s = Array.prototype.shift.call(args);
        var e = Array.prototype.shift.call(args);

        for (var i=s;i<e;i++)
        {
            a[i] = i;
        }

    }
    a.length = Array.prototype.shift.call(args);

    write(a);
    write(a.reverse());
    write(a.reverse());
}

Test(0,10,10);
Test(0,5, 7,15,15);
Test(0,5, 7,15, 21,24,30);
Test(0,5, 7,15, 21,24, 55, 59 , 65);
Test(0,5, 7,15, 21,24, 55, 59 , 78);
Test(0,1, 7,12, 15,17, 26, 27 , 27);

function Test1()
{
  var ary = new Array(2);
  ary.reverse();
  ary.push(1);
}
Test1();
Test1();
Test1();

