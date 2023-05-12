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

function ExplicitToString(value)
{
    var result;
    if (value instanceof Array)
    {
        result = "[";

        for (var idx = 0; idx < value.length; idx++)
        {
            if (idx > 0)
            {
                result += ", ";
            }

            var item = value[idx];
            result += ExplicitToString(item);
        }

        result += "]";
    }
    else if (value == null)
    {
        result = "'null'";
    }
    else if (value == undefined)
    {
        result = "'undefined'";
    }
    else
    {
        result = value /* .toString() */;
    }

    return result;
}


function Print(name, value)
{
    var result = name + " = " + ExplicitToString(value);
   
    WScript.Echo(result);
}

var a = [1, 2, 3];
Print("a", a);

var b = a.concat(4, 5, 6);
Print("b", b);

var c = [1, [2, 3]];
Print("c", c);

var d = a.concat(4, [5, [6, [7]]]);
Print("d", d);

var e = a.concat([4, 5], [6, 7], [8, [9, [10]]]);
Print("e", e);
