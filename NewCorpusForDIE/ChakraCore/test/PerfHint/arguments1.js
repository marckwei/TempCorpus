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

// jshost -trace:perfhint d:\testbins1\test.js -off:simplejit -maxinterpretcount:1

var target = function (arg) {
    var string = "that: " + this.that +
                 ", arg: " + arg;
    return string;
};

var that = { that: "that" };

function arguments_test1(arg1) {
    target.apply(that, arguments);
}

function arguments_test1_fixed() {
    target.apply(that, arguments);
}

function arguments_test2() {
    var k = 10;
    arguments[arguments.length] = 'end';
    target.apply(that, arguments);
}

function arguments_test3() {
    var arr = [];
    for (var i in arguments) {
        arr.push(arguments[i]);
    }

    arr.push('end');
    target.apply(that, arr);
}

function arguments_test2_fixed() {
    var k = arguments.length;
    var arr = [];
    for (var i = 0; i < k; i++) {
        arr[i] = arguments[i];
    }

    arr.push('end');
    target.apply(that, arr);
}

var arg = "arg";
var iter = 100;

function Run() {
    for (var i = 0; i < iter; i++) {
        arguments_test1(arg);
    }
    for (var i = 0; i < iter; i++) {
        arguments_test1_fixed(arg);
    }
    for (var i = 0; i < iter; i++) {
        arguments_test2(arg);
    }
    for (var i = 0; i < iter; i++) {
        arguments_test3(arg);
    }
    for (var i = 0; i < iter; i++) {
        arguments_test2_fixed(arg);
    }
}
Run();
