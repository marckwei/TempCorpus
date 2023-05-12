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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function f0() {
    var printArr = [];
    Object.prototype.m = {};
    Object.defineProperty(Array.prototype, "5", {writable : true});

    for (var iterator = 0; iterator < 10; iterator++) {
        var arr0 = [];
        arr0[10] = "Should not see this";
        arr0.shift();
        for (var arr0Elem in arr0) {
            if (arr0Elem.indexOf('m')) {
                continue;
            }
            for (var i = 9.1 | 0; i < arr0.length; i++) {
                arr0[i] = "";
            }
            printArr.push(arr0);
        }
    }
    WScript.Echo(printArr);
}
f0();
f0();

function f1() {
    var printArr = [];
    var arr0 = new Array(1, 1);
    var arr1 = [];
    arr0[3] = 1;
    arr0[2] = 1;
    arr1[1] = 1;
    arr1[3] = -1;
    arr1[2] = 1;
    for (var i = 0.1 ? 1 : -1; i < arr0.length; i++) {
        arr0[i] = arr1[i];
    }
    printArr.push(arr0);
    i | 0;
    WScript.Echo(printArr);
}
f1();
f1();