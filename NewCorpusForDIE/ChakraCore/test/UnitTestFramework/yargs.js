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

'use strict';
let dest;
if (typeof WScript !== "undefined") {
  dest = this;
} else if (typeof require !== "undefined") {
  dest = module.exports;
}

(function() {
dest.yargsParse = parse;

//The MIT License (MIT)
//
//Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

function preserveCamelCase(str) {
  let isLastCharLower = false;
  let isLastCharUpper = false;
  let isLastLastCharUpper = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];

    if (isLastCharLower && /[a-zA-Z]/.test(c) && c.toUpperCase() === c) {
      str = str.substr(0, i) + '-' + str.substr(i);
      isLastCharLower = false;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = true;
      i++;
    } else if (isLastCharUpper && isLastLastCharUpper && /[a-zA-Z]/.test(c) && c.toLowerCase() === c) {
      str = str.substr(0, i - 1) + '-' + str.substr(i - 1);
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = false;
      isLastCharLower = true;
    } else {
      isLastCharLower = c.toLowerCase() === c;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = c.toUpperCase() === c;
    }
  }

  return str;
}

function camelCase(str) {
  if (arguments.length > 1) {
    str = Array.from(arguments)
      .map(x => x.trim())
      .filter(x => x.length)
      .join('-');
  } else {
    str = str.trim();
  }

  if (str.length === 0) {
    return '';
  }

  if (str.length === 1) {
    return str.toLowerCase();
  }

  if (/^[a-z0-9]+$/.test(str)) {
    return str;
  }

  const hasUpperCase = str !== str.toLowerCase();

  if (hasUpperCase) {
    str = preserveCamelCase(str);
  }

  return str
    .replace(/^[_.\- ]+/, '')
    .toLowerCase()
    .replace(/[_.\- ]+(\w|$)/g, (m, p1) => p1.toUpperCase());
};

//Copyright (c) 2016, Contributors
//
//Permission to use, copy, modify, and/or distribute this software
//for any purpose with or without fee is hereby granted, provided
//that the above copyright notice and this permission notice
//appear in all copies.
//
//THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
//WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES
//OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE
//LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES
//OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
//WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
//ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

// take an un-split argv string and tokenize it.
function tokenizeArgString(argString) {
  if (Array.isArray(argString)) return argString

  var i = 0
  var c = null
  var opening = null
  var args = []

  for (var ii = 0; ii < argString.length; ii++) {
    c = argString.charAt(ii)

    // split on spaces unless we're in quotes.
    if (c === ' ' && !opening) {
      i++
      continue
    }

    // don't split the string if we're in matching
    // opening or closing single and double quotes.
    if (c === opening) {
      opening = null
      continue
    } else if ((c === "'" || c === '"') && !opening) {
      opening = c
      continue
    }

    if (!args[i]) args[i] = ''
    args[i] += c
  }

  return args
}

function parse (args, opts) {
  if (!opts) opts = {}
  // allow a string argument to be passed in rather
  // than an argv array.
  args = tokenizeArgString(args)
  // aliases might have transitive relationships, normalize this.
  var aliases = combineAliases(opts.alias || {})
  var configuration = assign({
    'short-option-groups': true,
    'camel-case-expansion': true,
    'dot-notation': true,
    'parse-numbers': true,
    'boolean-negation': true,
    'duplicate-arguments-array': true,
    'flatten-duplicate-arrays': true,
    'populate--': false
  }, opts.configuration)
  var defaults = opts.default || {}
  var configObjects = opts.configObjects || []
  var envPrefix = opts.envPrefix
  var notFlagsOption = configuration['populate--']
  var notFlagsArgv = notFlagsOption ? '--' : '_'
  var newAliases = {}
  // allow a i18n handler to be passed in, default to a fake one (util.format).
  var __ = opts.__ || function (str) {
    return str;
  }
  var error = null
  var flags = {
    aliases: {},
    arrays: {},
    bools: {},
    strings: {},
    numbers: {},
    counts: {},
    normalize: {},
    configs: {},
    defaulted: {},
    nargs: {},
    coercions: {}
  }
  var negative = /^-[0-9]+(\.[0-9]+)?/

  ;[].concat(opts.array).filter(Boolean).forEach(function (key) {
    flags.arrays[key] = true
  })

  ;[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
    flags.bools[key] = true
  })

  ;[].concat(opts.string).filter(Boolean).forEach(function (key) {
    flags.strings[key] = true
  })

  ;[].concat(opts.number).filter(Boolean).forEach(function (key) {
    flags.numbers[key] = true
  })

  ;[].concat(opts.count).filter(Boolean).forEach(function (key) {
    flags.counts[key] = true
  })

  ;[].concat(opts.normalize).filter(Boolean).forEach(function (key) {
    flags.normalize[key] = true
  })

  Object.keys(opts.narg || {}).forEach(function (k) {
    flags.nargs[k] = opts.narg[k]
  })

  Object.keys(opts.coerce || {}).forEach(function (k) {
    flags.coercions[k] = opts.coerce[k]
  })

  if (Array.isArray(opts.config) || typeof opts.config === 'string') {
    ;[].concat(opts.config).filter(Boolean).forEach(function (key) {
      flags.configs[key] = true
    })
  } else {
    Object.keys(opts.config || {}).forEach(function (k) {
      flags.configs[k] = opts.config[k]
    })
  }

  // create a lookup table that takes into account all
  // combinations of aliases: {f: ['foo'], foo: ['f']}
  extendAliases(opts.key, aliases, opts.default, flags.arrays)

  // apply default values to all aliases.
  Object.keys(defaults).forEach(function (key) {
    (flags.aliases[key] || []).forEach(function (alias) {
      defaults[alias] = defaults[key]
    })
  })

  var argv = { _: [] }

  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, !(key in defaults) ? false : defaults[key])
    setDefaulted(key)
  })

  var notFlags = []
  if (args.indexOf('--') !== -1) {
    notFlags = args.slice(args.indexOf('--') + 1)
    args = args.slice(0, args.indexOf('--'))
  }

  for (var i = 0; i < args.length; i++) {
    var arg = args[i]
    var broken
    var key
    var letters
    var m
    var next
    var value

    // -- seperated by =
    if (arg.match(/^--.+=/) || (
      !configuration['short-option-groups'] && arg.match(/^-.+=/)
    )) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      m = arg.match(/^--?([^=]+)=([\s\S]*)$/)

      // nargs format = '--f=monkey washing cat'
      if (checkAllAliases(m[1], flags.nargs)) {
        args.splice(i + 1, 0, m[2])
        i = eatNargs(i, m[1], args)
      // arrays format = '--f=a b c'
      } else if (checkAllAliases(m[1], flags.arrays) && args.length > i + 1) {
        args.splice(i + 1, 0, m[2])
        i = eatArray(i, m[1], args)
      } else {
        setArg(m[1], m[2])
      }
    } else if (arg.match(/^--no-.+/) && configuration['boolean-negation']) {
      key = arg.match(/^--no-(.+)/)[1]
      setArg(key, false)

    // -- seperated by space.
    } else if (arg.match(/^--.+/) || (
      !configuration['short-option-groups'] && arg.match(/^-.+/)
    )) {
      key = arg.match(/^--?(.+)/)[1]

      // nargs format = '--foo a b c'
      if (checkAllAliases(key, flags.nargs)) {
        i = eatNargs(i, key, args)
      // array format = '--foo a b c'
      } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
        i = eatArray(i, key, args)
      } else {
        next = args[i + 1]

        if (next !== undefined && (!next.match(/^-/) ||
          next.match(negative)) &&
          !checkAllAliases(key, flags.bools) &&
          !checkAllAliases(key, flags.counts)) {
          setArg(key, next)
          i++
        } else if (/^(true|false)$/.test(next)) {
          setArg(key, next)
          i++
        } else {
          setArg(key, defaultForType(guessType(key, flags)))
        }
      }

    // dot-notation flag seperated by '='.
    } else if (arg.match(/^-.\..+=/)) {
      m = arg.match(/^-([^=]+)=([\s\S]*)$/)
      setArg(m[1], m[2])

    // dot-notation flag seperated by space.
    } else if (arg.match(/^-.\..+/)) {
      next = args[i + 1]
      key = arg.match(/^-(.\..+)/)[1]

      if (next !== undefined && !next.match(/^-/) &&
        !checkAllAliases(key, flags.bools) &&
        !checkAllAliases(key, flags.counts)) {
        setArg(key, next)
        i++
      } else {
        setArg(key, defaultForType(guessType(key, flags)))
      }
    } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
      letters = arg.slice(1, -1).split('')
      broken = false

      for (var j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2)

        if (letters[j + 1] && letters[j + 1] === '=') {
          value = arg.slice(j + 3)
          key = letters[j]

          // nargs format = '-f=monkey washing cat'
          if (checkAllAliases(key, flags.nargs)) {
            args.splice(i + 1, 0, value)
            i = eatNargs(i, key, args)
          // array format = '-f=a b c'
          } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
            args.splice(i + 1, 0, value)
            i = eatArray(i, key, args)
          } else {
            setArg(key, value)
          }

          broken = true
          break
        }

        if (next === '-') {
          setArg(letters[j], next)
          continue
        }

        // current letter is an alphabetic character and next value is a number
        if (/[A-Za-z]/.test(letters[j]) &&
          /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letters[j], next)
          broken = true
          break
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], next)
          broken = true
          break
        } else {
          setArg(letters[j], defaultForType(guessType(letters[j], flags)))
        }
      }

      key = arg.slice(-1)[0]

      if (!broken && key !== '-') {
        // nargs format = '-f a b c'
        if (checkAllAliases(key, flags.nargs)) {
          i = eatNargs(i, key, args)
        // array format = '-f a b c'
        } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
          i = eatArray(i, key, args)
        } else {
          next = args[i + 1]

          if (next !== undefined && (!/^(-|--)[^-]/.test(next) ||
            next.match(negative)) &&
            !checkAllAliases(key, flags.bools) &&
            !checkAllAliases(key, flags.counts)) {
            setArg(key, next)
            i++
          } else if (/^(true|false)$/.test(next)) {
            setArg(key, next)
            i++
          } else {
            setArg(key, defaultForType(guessType(key, flags)))
          }
        }
      }
    } else {
      argv._.push(
        flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
      )
    }
  }

  // order of precedence:
  // 1. command line arg
  // 2. value from env var
  // 3. value from config file
  // 4. value from config objects
  // 5. configured default value
  applyEnvVars(argv, true) // special case: check env vars that point to config file
  applyEnvVars(argv, false)
  setConfig(argv)
  setConfigObjects()
  applyDefaultsAndAliases(argv, flags.aliases, defaults)
  applyCoercions(argv)

  // for any counts either not in args or without an explicit default, set to 0
  Object.keys(flags.counts).forEach(function (key) {
    if (!hasKey(argv, key.split('.'))) setArg(key, 0)
  })

  // '--' defaults to undefined.
  if (notFlagsOption && notFlags.length) argv[notFlagsArgv] = []
  notFlags.forEach(function (key) {
    argv[notFlagsArgv].push(key)
  })

  // how many arguments should we consume, based
  // on the nargs option?
  function eatNargs (i, key, args) {
    var toEat = checkAllAliases(key, flags.nargs)

    if (args.length - (i + 1) < toEat) error = Error(__(`Not enough arguments following: ${key}`))

    for (var ii = i + 1; ii < (toEat + i + 1); ii++) {
      setArg(key, args[ii])
    }

    return (i + toEat)
  }

  // if an option is an array, eat all non-hyphenated arguments
  // following it... YUM!
  // e.g., --foo apple banana cat becomes ["apple", "banana", "cat"]
  function eatArray (i, key, args) {
    var start = i + 1
    var argsToSet = []
    var multipleArrayFlag = i > 0
    for (var ii = i + 1; ii < args.length; ii++) {
      if (/^-/.test(args[ii]) && !negative.test(args[ii])) {
        if (ii === start) {
          setArg(key, defaultForType('array'))
        }
        multipleArrayFlag = true
        break
      }
      i = ii
      argsToSet.push(args[ii])
    }
    if (multipleArrayFlag) {
      setArg(key, argsToSet.map(function (arg) {
        return processValue(key, arg)
      }))
    } else {
      argsToSet.forEach(function (arg) {
        setArg(key, arg)
      })
    }

    return i
  }

  function setArg (key, val) {
    unsetDefaulted(key)

    if (/-/.test(key) && !(flags.aliases[key] && flags.aliases[key].length) && configuration['camel-case-expansion']) {
      var c = camelCase(key)
      flags.aliases[key] = [c]
      newAliases[c] = true
    }

    var value = processValue(key, val)

    var splitKey = key.split('.')
    setKey(argv, splitKey, value)

    // handle populating aliases of the full key
    if (flags.aliases[key]) {
      flags.aliases[key].forEach(function (x) {
        x = x.split('.')
        setKey(argv, x, value)
      })
    }

    // handle populating aliases of the first element of the dot-notation key
    if (splitKey.length > 1 && configuration['dot-notation']) {
      ;(flags.aliases[splitKey[0]] || []).forEach(function (x) {
        x = x.split('.')

        // expand alias with nested objects in key
        var a = [].concat(splitKey)
        a.shift() // nuke the old key.
        x = x.concat(a)

        setKey(argv, x, value)
      })
    }

    // Set normalize getter and setter when key is in 'normalize' but isn't an array
    if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
      var keys = [key].concat(flags.aliases[key] || [])
      /*
      keys.forEach(function (key) {
        argv.__defineSetter__(key, function (v) {
          val = v
        })

        argv.__defineGetter__(key, function () {
          return typeof val === 'string' ? path.normalize(val) : val
        })
      })
      */
    }
  }

  function processValue (key, val) {
    // handle parsing boolean arguments --foo=true --bar false.
    if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
      if (typeof val === 'string') val = val === 'true'
    }

    var value = val
    if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.coercions)) {
      if (isNumber(val)) value = Number(val)
      if (!isUndefined(val) && !isNumber(val) && checkAllAliases(key, flags.numbers)) value = NaN
    }

    // increment a count given as arg (either no value or value parsed as boolean)
    if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === 'boolean')) {
      value = increment
    }

    /*
    // Set normalized value when key is in 'normalize' and in 'arrays'
    if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
      if (Array.isArray(val)) value = val.map(path.normalize)
      else value = path.normalize(val)
    }
    */
    return value
  }

  // set args from config.json file, this should be
  // applied last so that defaults can be applied.
  function setConfig (argv) {
    var configLookup = {}

    // expand defaults/aliases, in-case any happen to reference
    // the config.json file.
    applyDefaultsAndAliases(configLookup, flags.aliases, defaults)

    Object.keys(flags.configs).forEach(function (configKey) {
      var configPath = argv[configKey] || configLookup[configKey]
      if (configPath) {
        throw new Error("Not Supported in Chakra Host");
        try {
          var config = null
          var resolvedConfigPath = path.resolve(process.cwd(), configPath)

          if (typeof flags.configs[configKey] === 'function') {
            try {
              config = flags.configs[configKey](resolvedConfigPath)
            } catch (e) {
              config = e
            }
            if (config instanceof Error) {
              error = config
              return
            }
          } else {
            config = require(resolvedConfigPath)
          }

          setConfigObject(config)
        } catch (ex) {
          if (argv[configKey]) error = Error(__(`Invalid JSON config file: ${configPath}`))
        }
      }
    })
  }

  // set args from config object.
  // it recursively checks nested objects.
  function setConfigObject (config, prev) {
    Object.keys(config).forEach(function (key) {
      var value = config[key]
      var fullKey = prev ? prev + '.' + key : key

      // if the value is an inner object and we have dot-notation
      // enabled, treat inner objects in config the same as
      // heavily nested dot notations (foo.bar.apple).
      if (typeof value === 'object' && !Array.isArray(value) && configuration['dot-notation']) {
        // if the value is an object but not an array, check nested object
        setConfigObject(value, fullKey)
      } else {
        // setting arguments via CLI takes precedence over
        // values within the config file.
        if (!hasKey(argv, fullKey.split('.')) || (flags.defaulted[fullKey])) {
          setArg(fullKey, value)
        }
      }
    })
  }

  // set all config objects passed in opts
  function setConfigObjects () {
    if (typeof configObjects === 'undefined') return
    configObjects.forEach(function (configObject) {
      setConfigObject(configObject)
    })
  }

  function applyEnvVars (argv, configOnly) {
    if (typeof envPrefix === 'undefined') return

    var prefix = typeof envPrefix === 'string' ? envPrefix : ''
    Object.keys(process.env).forEach(function (envVar) {
      if (prefix === '' || envVar.lastIndexOf(prefix, 0) === 0) {
        // get array of nested keys and convert them to camel case
        var keys = envVar.split('__').map(function (key, i) {
          if (i === 0) {
            key = key.substring(prefix.length)
          }
          return camelCase(key)
        })

        if (((configOnly && flags.configs[keys.join('.')]) || !configOnly) && (!hasKey(argv, keys) || flags.defaulted[keys.join('.')])) {
          setArg(keys.join('.'), process.env[envVar])
        }
      }
    })
  }

  function applyCoercions (argv) {
    var coerce
    Object.keys(argv).forEach(function (key) {
      coerce = checkAllAliases(key, flags.coercions)
      if (typeof coerce === 'function') {
        try {
          argv[key] = coerce(argv[key])
        } catch (err) {
          error = err
        }
      }
    })
  }

  function applyDefaultsAndAliases (obj, aliases, defaults) {
    Object.keys(defaults).forEach(function (key) {
      if (!hasKey(obj, key.split('.'))) {
        setKey(obj, key.split('.'), defaults[key])

        ;(aliases[key] || []).forEach(function (x) {
          if (hasKey(obj, x.split('.'))) return
          setKey(obj, x.split('.'), defaults[key])
        })
      }
    })
  }

  function hasKey (obj, keys) {
    var o = obj

    if (!configuration['dot-notation']) keys = [keys.join('.')]

    keys.slice(0, -1).forEach(function (key) {
      o = (o[key] || {})
    })

    var key = keys[keys.length - 1]

    if (typeof o !== 'object') return false
    else return key in o
  }

  function setKey (obj, keys, value) {
    var o = obj

    if (!configuration['dot-notation']) keys = [keys.join('.')]

    keys.slice(0, -1).forEach(function (key) {
      if (o[key] === undefined) o[key] = {}
      o = o[key]
    })

    var key = keys[keys.length - 1]

    var isTypeArray = checkAllAliases(keys.join('.'), flags.arrays)
    var isValueArray = Array.isArray(value)
    var duplicate = configuration['duplicate-arguments-array']

    if (value === increment) {
      o[key] = increment(o[key])
    } else if (Array.isArray(o[key])) {
      if (duplicate && isTypeArray && isValueArray) {
        o[key] = configuration['flatten-duplicate-arrays'] ? o[key].concat(value) : [o[key]].concat([value])
      } else if (!duplicate && Boolean(isTypeArray) === Boolean(isValueArray)) {
        o[key] = value
      } else {
        o[key] = o[key].concat([value])
      }
    } else if (o[key] === undefined && isTypeArray) {
      o[key] = isValueArray ? value : [value]
    } else if (duplicate && !(o[key] === undefined || checkAllAliases(key, flags.bools) || checkAllAliases(keys.join('.'), flags.bools) || checkAllAliases(key, flags.counts))) {
      o[key] = [ o[key], value ]
    } else {
      o[key] = value
    }
  }

  // extend the aliases list with inferred aliases.
  function extendAliases () {
    Array.prototype.slice.call(arguments).forEach(function (obj) {
      Object.keys(obj || {}).forEach(function (key) {
        // short-circuit if we've already added a key
        // to the aliases array, for example it might
        // exist in both 'opts.default' and 'opts.key'.
        if (flags.aliases[key]) return

        flags.aliases[key] = [].concat(aliases[key] || [])
        // For "--option-name", also set argv.optionName
        flags.aliases[key].concat(key).forEach(function (x) {
          if (/-/.test(x) && configuration['camel-case-expansion']) {
            var c = camelCase(x)
            flags.aliases[key].push(c)
            newAliases[c] = true
          }
        })
        flags.aliases[key].forEach(function (x) {
          flags.aliases[x] = [key].concat(flags.aliases[key].filter(function (y) {
            return x !== y
          }))
        })
      })
    })
  }

  // check if a flag is set for any of a key's aliases.
  function checkAllAliases (key, flag) {
    var isSet = false
    var toCheck = [].concat(flags.aliases[key] || [], key)

    toCheck.forEach(function (key) {
      if (flag[key]) isSet = flag[key]
    })

    return isSet
  }

  function setDefaulted (key) {
    [].concat(flags.aliases[key] || [], key).forEach(function (k) {
      flags.defaulted[k] = true
    })
  }

  function unsetDefaulted (key) {
    [].concat(flags.aliases[key] || [], key).forEach(function (k) {
      delete flags.defaulted[k]
    })
  }

  // return a default value, given the type of a flag.,
  // e.g., key of type 'string' will default to '', rather than 'true'.
  function defaultForType (type) {
    var def = {
      boolean: true,
      string: '',
      number: undefined,
      array: []
    }

    return def[type]
  }

  // given a flag, enforce a default type.
  function guessType (key, flags) {
    var type = 'boolean'

    if (checkAllAliases(key, flags.strings)) type = 'string'
    else if (checkAllAliases(key, flags.numbers)) type = 'number'
    else if (checkAllAliases(key, flags.arrays)) type = 'array'

    return type
  }

  function isNumber (x) {
    if (!configuration['parse-numbers']) return false
    if (typeof x === 'number') return true
    if (/^0x[0-9a-f]+$/i.test(x)) return true
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
  }

  function isUndefined (num) {
    return num === undefined
  }

  return {
    argv: argv,
    error: error,
    aliases: flags.aliases,
    newAliases: newAliases,
    configuration: configuration
  }
}

// if any aliases reference each other, we should
// merge them together.
function combineAliases (aliases) {
  var aliasArrays = []
  var change = true
  var combined = {}

  // turn alias lookup hash {key: ['alias1', 'alias2']} into
  // a simple array ['key', 'alias1', 'alias2']
  Object.keys(aliases).forEach(function (key) {
    aliasArrays.push(
      [].concat(aliases[key], key)
    )
  })

  // combine arrays until zero changes are
  // made in an iteration.
  while (change) {
    change = false
    for (var i = 0; i < aliasArrays.length; i++) {
      for (var ii = i + 1; ii < aliasArrays.length; ii++) {
        var intersect = aliasArrays[i].filter(function (v) {
          return aliasArrays[ii].indexOf(v) !== -1
        })

        if (intersect.length) {
          aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii])
          aliasArrays.splice(ii, 1)
          change = true
          break
        }
      }
    }
  }

  // map arrays back to the hash-lookup (de-dupe while
  // we're at it).
  aliasArrays.forEach(function (aliasArray) {
    aliasArray = aliasArray.filter(function (v, i, self) {
      return self.indexOf(v) === i
    })
    combined[aliasArray.pop()] = aliasArray
  })

  return combined
}

function assign (defaults, configuration) {
  var o = {}
  configuration = configuration || {}

  Object.keys(defaults).forEach(function (k) {
    o[k] = defaults[k]
  })
  Object.keys(configuration).forEach(function (k) {
    o[k] = configuration[k]
  })

  return o
}

// this function should only be called when a count is given as an arg
// it is NOT called to set a default value
// thus we can start the count at 1 instead of 0
function increment (orig) {
  return orig !== undefined ? orig + 1 : 1
}

})();
