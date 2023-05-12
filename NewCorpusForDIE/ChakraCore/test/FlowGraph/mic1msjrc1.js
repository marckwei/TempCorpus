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

function test0() {
    while (undefined) {
        if (undefined) {
            continue;
        }
        try {
            continue;
        } catch (ex) {
        } finally {
            break;
        }
    }
}
test0();
test0();
test0();


function test1() {
    try {
        LABEL2:
        while (h != d) {
            try {
                continue;
            } catch (ex) {
                continue;
            } finally {
                return -1839801917;
            }
        }
    } catch (ex) {
    }
}
test1();
test1();
test1();


var _oo1obj = undefined;
function test2() {
    var _oo1obj = function () {
        var _oo1obj = {
            prop1 : []
        };
        for (; ([])[1]; ) {
        }
        _oo1obj.f1 = undefined;
    }();
}
test2();
test2();
test2();


function test3() {
    var IntArr1 = Array(1);
    for (var _ of IntArr1) {
        if (this || 1) {
            return 1;
        }
    }
}
test3();
test3();
test3();


var ary = Array();
var func4 = function () {
    for (var _ of ary) {
        if (undefined || func4) {
            break;
        }
    }
};
func4();
func4();
func4();

console.log('PASSED');

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

function test0() {
    while (undefined) {
        if (undefined) {
            continue;
        }
        try {
            continue;
        } catch (ex) {
        } finally {
            break;
        }
    }
}
test0();
test0();
test0();


function test1() {
    try {
        LABEL2:
        while (h != d) {
            try {
                continue;
            } catch (ex) {
                continue;
            } finally {
                return -1839801917;
            }
        }
    } catch (ex) {
    }
}
test1();
test1();
test1();


var _oo1obj = undefined;
function test2() {
    var _oo1obj = function () {
        var _oo1obj = {
            prop1 : []
        };
        for (; ([])[1]; ) {
        }
        _oo1obj.f1 = undefined;
    }();
}
test2();
test2();
test2();


function test3() {
    var IntArr1 = Array(1);
    for (var _ of IntArr1) {
        if (this || 1) {
            return 1;
        }
    }
}
test3();
test3();
test3();


var ary = Array();
var func4 = function () {
    for (var _ of ary) {
        if (undefined || func4) {
            break;
        }
    }
};
func4();
func4();
func4();

console.log('PASSED');

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

function test0() {
    while (undefined) {
        if (undefined) {
            continue;
        }
        try {
            continue;
        } catch (ex) {
        } finally {
            break;
        }
    }
}
test0();
test0();
test0();


function test1() {
    try {
        LABEL2:
        while (h != d) {
            try {
                continue;
            } catch (ex) {
                continue;
            } finally {
                return -1839801917;
            }
        }
    } catch (ex) {
    }
}
test1();
test1();
test1();


var _oo1obj = undefined;
function test2() {
    var _oo1obj = function () {
        var _oo1obj = {
            prop1 : []
        };
        for (; ([])[1]; ) {
        }
        _oo1obj.f1 = undefined;
    }();
}
test2();
test2();
test2();


function test3() {
    var IntArr1 = Array(1);
    for (var _ of IntArr1) {
        if (this || 1) {
            return 1;
        }
    }
}
test3();
test3();
test3();


var ary = Array();
var func4 = function () {
    for (var _ of ary) {
        if (undefined || func4) {
            break;
        }
    }
};
func4();
func4();
func4();

console.log('PASSED');

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

function test0() {
    while (undefined) {
        if (undefined) {
            continue;
        }
        try {
            continue;
        } catch (ex) {
        } finally {
            break;
        }
    }
}
test0();
test0();
test0();


function test1() {
    try {
        LABEL2:
        while (h != d) {
            try {
                continue;
            } catch (ex) {
                continue;
            } finally {
                return -1839801917;
            }
        }
    } catch (ex) {
    }
}
test1();
test1();
test1();


var _oo1obj = undefined;
function test2() {
    var _oo1obj = function () {
        var _oo1obj = {
            prop1 : []
        };
        for (; ([])[1]; ) {
        }
        _oo1obj.f1 = undefined;
    }();
}
test2();
test2();
test2();


function test3() {
    var IntArr1 = Array(1);
    for (var _ of IntArr1) {
        if (this || 1) {
            return 1;
        }
    }
}
test3();
test3();
test3();


var ary = Array();
var func4 = function () {
    for (var _ of ary) {
        if (undefined || func4) {
            break;
        }
    }
};
func4();
func4();
func4();

console.log('PASSED');
