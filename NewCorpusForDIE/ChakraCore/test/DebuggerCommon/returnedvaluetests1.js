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

function Run() {
    function f1() {
        var m = 31;
        m++;
        var coll = new Intl.Collator();
        m += f2();
        return m;
    }

    function f2() {
        return 100;
    }

    function test6() {
        var formatter = new Intl.NumberFormat("en-US");/**bp:locals();resume('step_over');locals();resume('step_into');locals();stack();resume('step_out');locals();stack();**/ 
        f1(new Intl.Collator());
        formatter;
        formatter = new Intl.NumberFormat("en-US"); /**bp:locals();resume('step_into');locals();**/
    }
    test6();

    function test8() {
        function test7() {
            var d = new Date(2013, 1, 1);     
            [d.toLocaleString].every(function (f) {
                f; /**bp:resume('step_out');locals();stack()**/
                return f;
            });
            return d;
        }
        test7();        /**bp:locals();resume('step_into');locals();removeExpr()**/
    }
    test8();


    function test9() {
        var k = 10;
        function test10 () {
            var k1 = 10; /**bp:locals()**/
            return k1;
        }
        k+= test10(); /**bp:resume('step_over');**/
    }
    test9();
    WScript.Echo("Pass");
}
WScript.Attach(Run);