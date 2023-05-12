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

// Tests that the property ID is properly enumerated in the case
// of calling RemoteDictionaryTypeHandlerBase<TPropertyIndex>::GetPropertyInfo()
// in the hybrid debugger (no assert in ActivationObjectWalker::IsPropertyValid()
// for the global property 'prop0').
// Bug #241480.

function test0() {
    var obj0 = {};
    var obj1 = {};
    var arrObj0 = {};
    var func0 = function (argFunc0, argMath1, argArr2) {
        arrObj0.prop1 = (this.prop0 %= 1);
        obj0.prop1 %= 1;
        h = 1; /**bp:locals();evaluate('this.prop0')**/
        return 1;
    }
    var func1 = function (argArr3) {
        func0.call(obj0, 1, (func0(1, 1, 1)), 1);
    }
    arrObj0.method0 = func0;
    var h = 1;
    func1(1);
    obj1.length <<= (Object.defineProperty(this, 'prop0', {
        set: function (_x) { },
        configurable: true
    }), 1);
    arrObj0.method0.call(obj0, 1, 1, 1)
};
test0();

WScript.Echo("PASSED");