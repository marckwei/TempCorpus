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

var f1 = (a = 10, b = function () { return a; }) => { 
    if (a === 10) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    var a = 20; 
    if (a === 20) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    return b; 
} 
if (f1()() === 10) {
    print("PASSED");
} else {
    print("FAILED");
}

function f2(a = 10, b = function () { return a; }) { 
    if (a === 10) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    a = 20; 
    if (a === 20) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    return b; 
} 
if (f2()() === 20) {
    print("PASSED");
} else {
    print("FAILED");
}

function f3(a = eval("10"), b = function () { return eval("a"); }) { 
    if (a === 10) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    var a = 20; 
    if (a === 20) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    return b; 
} 
if (f3()() === 10) {
    print("PASSED");
} else {
    print("FAILED");
}

function f4(a = 10, b = function () { return eval("a"); }) { 
    if (a === 10) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    a = 20; 
    if (a === 20) {
        print("PASSED");
    } else {
        print("FAILED");
    }
    return b; 
} 
if (f4()() === 20) {
    print("PASSED");
} else {
    print("FAILED");
}

if ((({} = eval('')) => { return 10; })(1) === 10) {
    print("PASSED");
}