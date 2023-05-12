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

// Blue bug 241839
function val() {
    return 1;
}

function testSwitch1() {
    switch (val()) {
    case 1:
        let z = 10; // No error
        z++;
        break;
    case 2:
        let y = 1; // No error
        y++;
        break;
    }
}

function testSwitch2() {
    switch (val()) {
    case 1:
        switch (val()) {
        default:
            let a = 1; // No error
            break;
        }
    }
}

function testSwitch3() {
    var a = 1;
    while (a)
        switch (val()) {
        default:
            let b = 2; // No error
            ++b;
            a = 0;
            break;
        }
}

testSwitch1();
testSwitch2();
testSwitch3();

// Reduced hang found during development.
(function () { try { eval(
    "switch (Math()) { \
    default: \
        function func4() { \
            switch (--e) { \
            } \
        } \
    }"
); } catch (e) { WScript.Echo(e) }})();

WScript.Echo('Pass');