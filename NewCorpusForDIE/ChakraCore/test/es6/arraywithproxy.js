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

var p1 = new Proxy([], {
    get: function (target, property) {
        print('get trap: ' + property.toString());
        return Reflect['get'].apply(this, arguments);
    }
});

var p2 = new Proxy([0,1,2,3], {
    get: function (target, property) {
        print('get trap: ' + property.toString());
        return Reflect['get'].apply(this, arguments);
    },
    has: function(target, property){
        print('has trap: ' + property);
        return Reflect.has(target, property);
    },
    deleteProperty: function(target, property){
        print('delete trap: ' + property);
        return true;
    }
});

print('concat test#1');
p1.concat();
print('concat test#2');
p2.concat('a','b','c');
print('unshift  test');
p1.unshift();
print('splice test');
p2.splice(0,4,9,4);

