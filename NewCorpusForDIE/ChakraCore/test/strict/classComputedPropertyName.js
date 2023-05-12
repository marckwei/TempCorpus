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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "Assigning an undeclared variable in a class' computed property name",
        body: function () {
            assert.throws(
                function () {
                    class C {
                        [f = 5]() { }
                    }                
                },
                ReferenceError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus a variable assignment to an undeclared variable should throw a ReferenceError in strict mode",
                "Variable undefined in strict mode"
            );
            assert.throws(
                function () {
                    class C {
                        static [f = 5]() { }
                    }
                },
                ReferenceError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus a variable assignment to an undeclared variable should throw a ReferenceError in strict mode",
                "Variable undefined in strict mode"
            );
            assert.throws(
                function () {
                    "use strict";
                    class C {
                        [f = 5]() { }
                    }
                },
                ReferenceError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus a variable assignment to an undeclared variable should throw a ReferenceError in strict mode",
                "Variable undefined in strict mode"
            );
        }
    },
    {
        name: "Writing to a non writable object property in a class' computed property name",
        body: function () {
            assert.throws(
                function () {
                    var a = {};
                    Object.defineProperty(a, 'b', { value: 5, writable: false });
                    class C {
                        [a.b = 6]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus assigning a value to a non writable property should throw a TypeError in strict mode",
                "Assignment to read-only properties is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = {};
                    Object.defineProperty(a, 'b', { value: 5, writable: false });
                    class C {
                        static [a.b = 6]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus assigning a value to a non writable property should throw a TypeError in strict mode",
                "Assignment to read-only properties is not allowed in strict mode"
            );
        }
    },
    {
        name: "Writing to a getter-only object property in a class' computed property name",
        body: function () {
            assert.throws(
                function () {
                    var a = { get b() { return 5; } };
                    class C {
                        [a.b = 6]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus assigning a value to a getter-only property should throw a TypeError in strict mode",
                "Assignment to read-only properties is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = { get b() { return 5; } };
                    class C {
                        static [a.b = 6]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus assigning a value to a getter-only property should throw a TypeError in strict mode",
                "Assignment to read-only properties is not allowed in strict mode"
            );
        }
    },
    {
        name: "Writing to a property of a non-extensible object in a class' computed property name",
        body: function () {
            assert.throws(
                function () {
                    var a = {};
                    Object.preventExtensions(a);
                    class C {
                        [a.b = 5]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus assigning a value to a property of a non-extensible object should throw a TypeError in strict mode",
                "Cannot create property for a non-extensible object"
            );
            assert.throws(
                function () {
                    var a = {};
                    Object.preventExtensions(a);
                    class C {
                        static [a.b = 5]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus assigning a value to a property of a non-extensible object should throw a TypeError in strict mode",
                "Cannot create property for a non-extensible object"
            );
        }
    },
    {
        name: "Calling delete on an undeletable property in a class' computed property name",
        body: function () {
            assert.throws(
                function () {
                    class C {
                        [delete Object.prototype]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'prototype' is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    class C {
                        static [delete Object.prototype]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode,\
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'prototype' is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = 5;
                    class C {
                        [a < 6 ? delete Object.prototype : 5]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode, \
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'prototype' is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = 5;
                    class C {
                        static [a < 6 ? delete Object.prototype : 5]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode, \
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'prototype' is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = {};
                    Object.preventExtensions(a);
                    class C {
                        [a && delete Object.prototype]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode, \
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'prototype' is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = {};
                    Object.preventExtensions(a);
                    class C {
                        static [a && delete Object.prototype]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode, \
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'prototype' is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = {};
                    Object.defineProperty(a, "x", { value: 5, configurable: false });
                    class C {
                        [delete a["x"]]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode, \
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'x' is not allowed in strict mode"
            );
            assert.throws(
                function () {
                    var a = {};
                    Object.defineProperty(a, "x", { value: 5, configurable: false });
                    class C {
                        static [delete a["x"]]() { }
                    }
                },
                TypeError,
                "Computed property names inside classes are specified to execute in strict mode, \
thus calling delete on an undeletable property of object should throw a TypeError in strict mode",
                "Calling delete on 'x' is not allowed in strict mode"
            );
        }
    },

]

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });