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

var shouldBailout = false;
function test0() {
    var loopInvariant = 4;
    var obj1 = {};
    var i16 = new Int16Array();
    function _array2iterate(_array2tmp) {
        for (var _array2i in _array2tmp) {
            if (_array2i.indexOf('') == 0) {
            }
            var __loopvar1 = loopInvariant - 6;
            for (; obj1.prop0 < ~(shouldBailout ? (Object.defineProperty(obj1, '', {
                get: function () {
                },
                configurable: true
            }), obj1.prop0) : obj1.prop0); obj1++) {
                5;
                if (obj1) {
                }
            }
            _array2iterate(_array2tmp[_array2i]);
            obj1.prop0 = {
                prop0: obj1.prop0 >> 'caller',
                prop1: i16[53 & 255],
                prop2: obj1.prop0 >> '',
                prop3: new RegExp('xyz') instanceof (typeof Function == 'function' && Function[Symbol.toStringTag] == 'AsyncFunction' ? Function : Object),
                prop4: obj1[shouldBailout ? obj1[8] = 'x' : undefined, 8]
            };
        }
    }
    _array2iterate([
        [],
        []
    ]);
}
test0();
test0();
test0();

console.log("PASSED");

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

var shouldBailout = false;
function test0() {
    var loopInvariant = 4;
    var obj1 = {};
    var i16 = new Int16Array();
    function _array2iterate(_array2tmp) {
        for (var _array2i in _array2tmp) {
            if (_array2i.indexOf('') == 0) {
            }
            var __loopvar1 = loopInvariant - 6;
            for (; obj1.prop0 < ~(shouldBailout ? (Object.defineProperty(obj1, '', {
                get: function () {
                },
                configurable: true
            }), obj1.prop0) : obj1.prop0); obj1++) {
                5;
                if (obj1) {
                }
            }
            _array2iterate(_array2tmp[_array2i]);
            obj1.prop0 = {
                prop0: obj1.prop0 >> 'caller',
                prop1: i16[53 & 255],
                prop2: obj1.prop0 >> '',
                prop3: new RegExp('xyz') instanceof (typeof Function == 'function' && Function[Symbol.toStringTag] == 'AsyncFunction' ? Function : Object),
                prop4: obj1[shouldBailout ? obj1[8] = 'x' : undefined, 8]
            };
        }
    }
    _array2iterate([
        [],
        []
    ]);
}
test0();
test0();
test0();

console.log("PASSED");

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

var shouldBailout = false;
function test0() {
    var loopInvariant = 4;
    var obj1 = {};
    var i16 = new Int16Array();
    function _array2iterate(_array2tmp) {
        for (var _array2i in _array2tmp) {
            if (_array2i.indexOf('') == 0) {
            }
            var __loopvar1 = loopInvariant - 6;
            for (; obj1.prop0 < ~(shouldBailout ? (Object.defineProperty(obj1, '', {
                get: function () {
                },
                configurable: true
            }), obj1.prop0) : obj1.prop0); obj1++) {
                5;
                if (obj1) {
                }
            }
            _array2iterate(_array2tmp[_array2i]);
            obj1.prop0 = {
                prop0: obj1.prop0 >> 'caller',
                prop1: i16[53 & 255],
                prop2: obj1.prop0 >> '',
                prop3: new RegExp('xyz') instanceof (typeof Function == 'function' && Function[Symbol.toStringTag] == 'AsyncFunction' ? Function : Object),
                prop4: obj1[shouldBailout ? obj1[8] = 'x' : undefined, 8]
            };
        }
    }
    _array2iterate([
        [],
        []
    ]);
}
test0();
test0();
test0();

console.log("PASSED");

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

var shouldBailout = false;
function test0() {
    var loopInvariant = 4;
    var obj1 = {};
    var i16 = new Int16Array();
    function _array2iterate(_array2tmp) {
        for (var _array2i in _array2tmp) {
            if (_array2i.indexOf('') == 0) {
            }
            var __loopvar1 = loopInvariant - 6;
            for (; obj1.prop0 < ~(shouldBailout ? (Object.defineProperty(obj1, '', {
                get: function () {
                },
                configurable: true
            }), obj1.prop0) : obj1.prop0); obj1++) {
                5;
                if (obj1) {
                }
            }
            _array2iterate(_array2tmp[_array2i]);
            obj1.prop0 = {
                prop0: obj1.prop0 >> 'caller',
                prop1: i16[53 & 255],
                prop2: obj1.prop0 >> '',
                prop3: new RegExp('xyz') instanceof (typeof Function == 'function' && Function[Symbol.toStringTag] == 'AsyncFunction' ? Function : Object),
                prop4: obj1[shouldBailout ? obj1[8] = 'x' : undefined, 8]
            };
        }
    }
    _array2iterate([
        [],
        []
    ]);
}
test0();
test0();
test0();

console.log("PASSED");
