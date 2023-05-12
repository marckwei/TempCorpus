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

WScript.Echo("Testing invalidation due to overwrite:");

var proto1 = {
    // Make sure we branch to a unique type path to avoid false sharing
    unique1_1: 0,
    add: function () {
        return (this.x + this.y) + " (original)";
    },
    subtract: function () {
        return (this.x - this.y) + " (original)";
    }
}

var object1 = Object.create(proto1);
object1.x = 0;
object1.y = 1;

var testOverwrite = function (object) {
    WScript.Echo("x + y = " + object.add());
    WScript.Echo("x - y = " + object.subtract());
}

testOverwrite(object1);

testOverwrite(object1);

proto1.subtract = function () {
    return (this.x - this.y) + " (overwritten)";
}

testOverwrite(object1);

proto1.add = function () {
    return (this.x + this.y) + " (overwritten)";
}

testOverwrite(object1);

var proto1 = {
    // Make sure we branch to a unique type path to avoid false sharing
    unique1_2: 0,
    add: function () {
        return (this.x + this.y) + " (original)";
    },
    subtract: function () {
        return (this.x - this.y) + " (original)";
    }
}

var object1 = Object.create(proto1);
object1.x = 0;
object1.y = 1;

var overwrittenSubtract = function () {
    return (this.x - this.y) + " (overwritten)";
}

var testOverwrite = function (object, overwrite) {
    WScript.Echo("x + y = " + object.add());
    if (overwrite) {
        proto1.subtract = overwrittenSubtract;
    }
    WScript.Echo("x - y = " + object.subtract());
}

testOverwrite(object1, false);

testOverwrite(object1, false);

testOverwrite(object1, true);

WScript.Echo();


WScript.Echo("Testing invalidation due to delete:");

var proto2 = {
    // Make sure we branch to a unique type path to avoid false sharing
    unique2: 0,
    add: function () {
        return (this.x + this.y) + " (from proto2)";
    },
    subtract: function () {
        return (this.x - this.y) + " (from proto2)";
    }
}

var proto1 = Object.create(proto2, {
    // Make sure we branch to a unique type path to avoid false sharing
    unique3: { value: 0 },
    add: {
        value: function () {
            return (this.x + this.y) + " (from proto1)";
        },
        writable: true, configurable: true
    },
    subtract: {
        value: function () {
            return (this.x - this.y) + " (from proto1)";
        },
        writable: true, configurable: true
    }
});

var object1 = Object.create(proto1);
object1.x = 0;
object1.y = 1;

function testDelete(object) {
    WScript.Echo("x + y = " + object.add());
    WScript.Echo("x - y = " + object.subtract());
}

testDelete(object1);

testDelete(object1);

delete proto1.subtract;

testDelete(object1);

delete proto1.add;

testDelete(object1);

WScript.Echo();


WScript.Echo("Testing invalidation due to shadowing:");

var proto2 = {
    // Make sure we branch to a unique type path to avoid false sharing
    unique4: 0,
    add: function () {
        return (this.x + this.y) + " (from proto2)";
    },
    subtract: function () {
        return (this.x - this.y) + " (from proto2)";
    }
}

var proto1 = Object.create(proto2, {
    // Make sure we branch to a unique type path to avoid false sharing
    unique5: { value: 0 },
});

var object1 = Object.create(proto1);
object1.x = 0;
object1.y = 1;

function testShadow(object) {
    WScript.Echo("x + y = " + object.add());
    WScript.Echo("x - y = " + object.subtract());
}

testShadow(object1);

testShadow(object1);

proto1.subtract = function () {
    return (this.x - this.y) + " (from proto1)";
};

testShadow(object1);

proto1.add = function () {
    return (this.x + this.y) + " (from proto1)";
};

testShadow(object1);

WScript.Echo();