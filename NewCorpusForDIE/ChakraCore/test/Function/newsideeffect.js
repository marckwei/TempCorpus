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

function echo(m) { this.WScript ? WScript.Echo(m) : console.log(m); }

//
// Win8: 762166
// ES5 11.2.2 "new MemberExpression Arguments", MemberExpression is fully evaluated before Arguments.
// Arguments side effect can't change the constructor used for new operator.
//

(function(){
    function x(){ echo("x");}
    function y(){ echo("y");}
    
    new x(x = y);
    new x();
})();
   
(function(){
    function x(){ echo("x");}
    function y(){ echo("y");}
    
    new x(x = y);
    new x();
    
    function foo() {
        x(); // Reference of "x" and put it in slot
    }
})();

(function () {
    var o = {
        x: function () { echo("x"); }
    };
    function y() { echo("y"); }

    new o.x(o.x = y);
    new o.x();
})();

(function () {
    var o = {
        x: function () { echo("x"); }
    };
    var y = {
        x: function () { echo("y"); }
    };

    new o.x(o = y);
    new o.x();
})();
