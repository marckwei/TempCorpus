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

function PrintDescriptor(name, propDesc) {
    if (propDesc) {
        write(name + ":configurable : " + propDesc.configurable);
        write(name + ":enumerable   : " + propDesc.enumerable);
        write(name + ":writable     : " + propDesc.writable);
        write(name + ":getter       : " + propDesc.get);
        write(name + ":setter       : " + propDesc.set);
        write(name + ":value        : " + propDesc.value);
    } else {
        write(name + " :propDesc undefined");
    }
}

(function Test1() {
    var propDesc;

    try {
        propDesc = Object.getOwnPropertyDescriptor(arguments, "callee");
        PrintDescriptor("arguments.callee", propDesc);
    } catch (e) {
        write("Exception: " + e.message);
    }

    try {
        propDesc = Object.getOwnPropertyDescriptor(arguments, "caller");
        PrintDescriptor("arguments.caller", propDesc);
    } catch (e) {
        write("Exception: " + e.message);
    }

    try {
        var c = arguments.caller;
    } catch (e) {
        write("Exception: " + e.message);
    }

    try {
        arguments.caller = 10;
    } catch (e) {
        write("Exception: " + e.message);
    }

    try {
        var y = arguments.callee;
    } catch (e) {
        write("Exception: " + e.message);
    }

    try {
        arguments.callee = 20;
    } catch (e) {
        write("Exception: " + e.message);
    }
})();