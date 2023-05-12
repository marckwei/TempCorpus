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

// use -forcejitloopbody
var i = 0;
var obj0 = {};
var obj1 = {};
var VarArr0 = new Array();
obj1.PROP0 = 5;
VarArr0;
do {
    while (obj0) {
        VarArr0[0] = 1; 

        obj0.length = 0;
        obj0.PROP0 = 'substring';
        obj0.PROP0.substring(1,2);

        switch (obj0.PROP0) { 
            case 's1':
            case 's2':
            case 's3':
            case 's4':
        }

        var __loopvar4 = 0;
        for (; obj1.PROP0 < 1; __loopvar4) {
        }

        if (i++ === 1) {
            break;
        }
    }
} while (false);

WScript.Echo(obj0.PROP0);
WScript.Echo(obj1.PROP0);