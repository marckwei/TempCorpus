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

// Configuration: ..\inline.xml
// Testcase Number: 126423
// Switches: -maxinterpretcount:1  -bgjit- -loopinterpretcount:1 -force:fieldhoist -off:floattypespec
// Arch: x86
function test0() {
    var obj0 = {};
    var litObj1 = { prop0: 0, prop1: 1 };
    var func2 = function (argMath5) {
        var __loopvar4 = 0;
        for (; b < ((this.prop1 ^= (~obj0.prop2))); __loopvar4++ + b++) {
            if (__loopvar4 > 3) break;
            g = 1;
            this.prop0 = 1;
        }
    }
    Object.prototype.method0 = 1;
    var b = 1;
    var i = 1;
    Object.prototype.prop1 = 1;
    Object.prototype.prop2 = -1066571423;
    var __loopvar2 = 0;
    while ((1) && __loopvar2 < 3) {
        __loopvar2++;
        obj1 = obj0;
        // Code Snippet: switch3.ecs (Blue5522)
        switch (obj1.prop0) {
            case obj1.prop0 /= obj1:
            case undefined:
                WScript.Echo("undefined");
            case ((new func2(1)).prop1):

        };

        obj1.prop2 /= 1469371314;
    }
    obj0 = 1;
    obj0 = (new func2(1.1));
    switch ((Function("") instanceof ((typeof Object == 'function') ? Object : Object))) {
        case 1:
            break;
        case ('method0' in litObj1):
            obj1 = obj0;
            break;
        case 1:
            break;
        case 1:
            break;
        case 1:
            break;
        case 1:
            break;
        case 1:
            break;
        case 1:
            break;
        case 1:
            break;
        case 1:
            break;
        default:
            break;
    }
    // Snippet arrays1
    var v1434738 = new Array();

    v1434738.push(obj1);
    v1434738.push(obj0.prop1);
    v1434738.push(1);
    v1434738.push(obj0);
    v1434738.push(i);
    v1434738.push(1);
    v1434738.push(obj0);
    v1434738.push(this.prop1);
    v1434738.push(1);
    for (var v1434739 = 0; v1434739 < Object.keys(obj1).length; v1434739++) {
        WScript.Echo(v1434738.pop());
    }
    v1434738.push(obj1);
    v1434738.push(obj0.prop1);
    v1434738.push(1);
    v1434738.push(obj1);
    v1434738.push(g);
    WScript.Echo(v1434738.push(obj0));
    WScript.Echo(v1434738.pop());
};

// generate profile
test0();

// run JITted code
test0();
