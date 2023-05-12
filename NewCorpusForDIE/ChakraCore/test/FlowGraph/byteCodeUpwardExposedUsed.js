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
    var IntArr0 = [1];
    var strvar0 = '';
    function v1() {
        var __loopvar1000 = function () {
            try {
            } finally {
            }
            LABEL0:
            for (_strvar0 in IntArr0) {
                switch (strvar0) {
                    default:
                        break LABEL0;
                    case 'Æ':
                }
            }
        }();
    }
    v1();
}
test0();
test0();

function test1() {
    var IntArr0 = [];
    var VarArr0 = [''];
    var strvar0 = '';
    LABEL1:
    for (; ;) {
        for (var _strvar0 of IntArr0) {
        }
        switch (strvar0) {
            default:
                break LABEL1;
            case '+':
        }
    }
    async function func183() {
        class class35 {
            static func219(argMath271 = Math.acos(strvar0 + 21623524.9) - b) {
                class class42 extends BaseClass {
                    constructor() {
                    }
                    func221() {
                        if (false) {
                        }
                    }
                    static func223() {
                        fPolyProp = function () {
                            if (undefined) {
                            }
                        };
                    }
                }
                for (_strvar3 of VarArr0) {
                    strvar7.concat(IntArr1.push(obj0, a instanceof ('AsyncFunction' ? func4 : Object), ary));
                }
            }
        }
    }
}
test1();
test1();
test1();

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

function test0() {
    var IntArr0 = [1];
    var strvar0 = '';
    function v1() {
        var __loopvar1000 = function () {
            try {
            } finally {
            }
            LABEL0:
            for (_strvar0 in IntArr0) {
                switch (strvar0) {
                    default:
                        break LABEL0;
                    case 'Æ':
                }
            }
        }();
    }
    v1();
}
test0();
test0();

function test1() {
    var IntArr0 = [];
    var VarArr0 = [''];
    var strvar0 = '';
    LABEL1:
    for (; ;) {
        for (var _strvar0 of IntArr0) {
        }
        switch (strvar0) {
            default:
                break LABEL1;
            case '+':
        }
    }
    async function func183() {
        class class35 {
            static func219(argMath271 = Math.acos(strvar0 + 21623524.9) - b) {
                class class42 extends BaseClass {
                    constructor() {
                    }
                    func221() {
                        if (false) {
                        }
                    }
                    static func223() {
                        fPolyProp = function () {
                            if (undefined) {
                            }
                        };
                    }
                }
                for (_strvar3 of VarArr0) {
                    strvar7.concat(IntArr1.push(obj0, a instanceof ('AsyncFunction' ? func4 : Object), ary));
                }
            }
        }
    }
}
test1();
test1();
test1();

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

function test0() {
    var IntArr0 = [1];
    var strvar0 = '';
    function v1() {
        var __loopvar1000 = function () {
            try {
            } finally {
            }
            LABEL0:
            for (_strvar0 in IntArr0) {
                switch (strvar0) {
                    default:
                        break LABEL0;
                    case 'Æ':
                }
            }
        }();
    }
    v1();
}
test0();
test0();

function test1() {
    var IntArr0 = [];
    var VarArr0 = [''];
    var strvar0 = '';
    LABEL1:
    for (; ;) {
        for (var _strvar0 of IntArr0) {
        }
        switch (strvar0) {
            default:
                break LABEL1;
            case '+':
        }
    }
    async function func183() {
        class class35 {
            static func219(argMath271 = Math.acos(strvar0 + 21623524.9) - b) {
                class class42 extends BaseClass {
                    constructor() {
                    }
                    func221() {
                        if (false) {
                        }
                    }
                    static func223() {
                        fPolyProp = function () {
                            if (undefined) {
                            }
                        };
                    }
                }
                for (_strvar3 of VarArr0) {
                    strvar7.concat(IntArr1.push(obj0, a instanceof ('AsyncFunction' ? func4 : Object), ary));
                }
            }
        }
    }
}
test1();
test1();
test1();

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

function test0() {
    var IntArr0 = [1];
    var strvar0 = '';
    function v1() {
        var __loopvar1000 = function () {
            try {
            } finally {
            }
            LABEL0:
            for (_strvar0 in IntArr0) {
                switch (strvar0) {
                    default:
                        break LABEL0;
                    case 'Æ':
                }
            }
        }();
    }
    v1();
}
test0();
test0();

function test1() {
    var IntArr0 = [];
    var VarArr0 = [''];
    var strvar0 = '';
    LABEL1:
    for (; ;) {
        for (var _strvar0 of IntArr0) {
        }
        switch (strvar0) {
            default:
                break LABEL1;
            case '+':
        }
    }
    async function func183() {
        class class35 {
            static func219(argMath271 = Math.acos(strvar0 + 21623524.9) - b) {
                class class42 extends BaseClass {
                    constructor() {
                    }
                    func221() {
                        if (false) {
                        }
                    }
                    static func223() {
                        fPolyProp = function () {
                            if (undefined) {
                            }
                        };
                    }
                }
                for (_strvar3 of VarArr0) {
                    strvar7.concat(IntArr1.push(obj0, a instanceof ('AsyncFunction' ? func4 : Object), ary));
                }
            }
        }
    }
}
test1();
test1();
test1();

console.log("PASSED");
