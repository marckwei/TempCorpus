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

function test1() {
    var obj = {};
    var x = "test1_value";
    
    function foo() {
        return x;
    }
            
    with (obj) {
        write(foo());
    }
}
test1();

function test2() {
    var obj = {};
        
    function foo() {
        return "test2_value";
    }
    
    var o1 = { f : foo };
    
    with (obj) {        
        write(o1.f());
    }
}
test2();

function test3_helper() { return "test3_helper";  }

function test3() {
    var o = {};
    with (o) 
    {
        var g = test3_helper;
        var x = g();            
        write(x);
    }    
}

test3();

var test4_obj = { prop4: "Feb20" };
with (test4_obj) {
    write("test4_obj.prop4 = " + (0, function () {
        return (0, function () {
            return prop4;
        })()
    })())
}

var test5_obj = {};
with (test5_obj) {
    test5_obj.func5 = function (x) {
        write(helper5);

        var func5_inner = function (d, c) {
            write("func5_inner " + x);
            write(helper5);            
        };
        func5_inner();
    };

    test5_obj.helper5 = function helper_5(a, b) {
        write("in pair entry");
    };
}

var result5 = test5_obj.func5(100);
write(result5);

var test6_result = "global test6_result";
function test6() {
    function test6_inner() {
        return this.test6_result;
    }

    with ({})
        write(test6_inner());
}

test6();
