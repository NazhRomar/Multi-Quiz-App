# Python Essentials 2 (PE2): Study Notes

# Module 1: Modules, Packages, and PIP

PE2 is the second of a two-course series and prepares you for the **PCAP: Certified Associate in Python Programming** exam. PCAP is an interim step to **PCPP1** (Certified Professional in Python Programming 1).

## Modules

- **Decomposition:** dividing a big piece of software into smaller cooperating parts (e.g. user interface and logic), then dividing those further.
- **Module:** a file containing Python definitions and statements, which can be imported and used later.
- You are a module's **user** when you use an existing one, and its **supplier** when you create one.
- A module is identified by its **name**. Modules shipped with Python, plus the built-in functions, form the **Python standard library**.
- A module's **entities** can be functions, variables, constants, classes, and objects.

### Namespace

**Namespace:** a space in which names exist without conflicting with each other. Inside a namespace, **each name must be unique**.

- `import module` makes all the module's names **known**, but they **don't enter your code's namespace**. You can still have your own `sin` or `pi`.

## Importing

| Form | Effect | Access |
|---|---|---|
| `import math` | Imports the whole module. | Must qualify: `math.pi`, `math.sin(x)` |
| `import math, sys` | Imports several (separate lines are preferred). | Qualified |
| `from math import pi, sin` | Imports only the listed entities. | No qualification: `pi`, `sin(x)`. `math.e` would be an error. |
| `from module import *` | Imports **all** entities. | No qualification. Unsafe: name conflicts. Treat as temporary. |
| `import math as m` | **Aliasing** the module. | `m.pi`. The original name `math` becomes inaccessible. |
| `from math import pi as PI, sin as sine` | Aliasing entities. | `PI`, `sine`. Original names inaccessible. |

- `import` can appear anywhere, but **before the first use** of the module's entities.
- Qualification (`module.entity`) is **compulsory** after `import module`, whether or not names conflict.
- With `from ... import`, the **later** definition wins: importing after defining your own `sin` replaces yours; defining `sin` after importing replaces the imported one.
- `as` is a keyword.

```
import math

def sin(x):
    if 2 * x == pi:
        return 0.99999999
    else:
        return None

pi = 3.14

print(sin(pi/2))             # 0.99999999
print(math.sin(math.pi/2))   # 1.0
```

## Selected Standard Modules

### dir()

`dir(module)` returns an **alphabetically sorted list** of all the names in a module. The module must be imported **as a whole** (`import module`; `from module` is not enough). If aliased, use the alias.

### math

| Group | Entities |
|---|---|
| **Trigonometry** (radians) | `sin(x)`, `cos(x)`, `tan(x)`, and inverses `asin(x)`, `acos(x)`, `atan(x)` |
| **Angles** | `pi`, `radians(x)` (degrees to radians), `degrees(x)` (radians to degrees) |
| **Hyperbolic** | `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh` |
| **Exponentiation** | `e`, `exp(x)`, `log(x)` (natural), `log(x, b)` (base b), `log10(x)`, `log2(x)` |
| **General** | `ceil(x)`, `floor(x)`, `trunc(x)`, `factorial(x)`, `hypot(x, y)` |

- `log10(x)` and `log2(x)` are more precise than `log(x, 10)` and `log(x, 2)`.
- `pow(x, y)` is a **built-in** function, not from math.
- `ceil(x)`: smallest integer **greater than or equal to** x.
- `floor(x)`: largest integer **less than or equal to** x.
- `trunc(x)`: x truncated to an integer. **Not** the same as ceil or floor (differs for negatives).
- `factorial(x)`: x must be a non-negative integer.
- `hypot(x, y)`: hypotenuse length, same as `sqrt(pow(x, 2) + pow(y, 2))` but more precise.

```
from math import ceil, floor, trunc

x = 1.4
y = 2.6

print(floor(x), floor(y))    # 1 2
print(floor(-x), floor(-y))  # -2 -3
print(ceil(x), ceil(y))      # 2 3
print(ceil(-x), ceil(-y))    # -1 -2
print(trunc(x), trunc(y))    # 1 2
print(trunc(-x), trunc(-y))  # -1 -2
```

### random

Computers generate **pseudorandom** numbers: deterministic algorithms that only look random.

- A generator takes a **seed**, calculates a number from it, and produces a new seed. Seed values eventually repeat (a feature, not a bug).
- Python seeds the generator from the **current time** when the module is imported.

| Function | Returns |
|---|---|
| `random()` | A float in the range **0.0 <= x < 1.0** |
| `seed()` | Sets the seed from the current time. |
| `seed(int_value)` | Sets the seed to a fixed value, so the sequence repeats every run. |
| `randrange(end)`, `randrange(beg, end)`, `randrange(beg, end, step)` | An integer from the matching `range(...)`. **Right side excluded.** |
| `randint(left, right)` | An integer in **[left, right]**, same as `randrange(left, right+1)`. Right side included. |
| `choice(sequence)` | One random element. |
| `sample(sequence, elements_to_choose)` | A list of **unique** elements in random order. `elements_to_choose` must not exceed the sequence length. |

- `randrange` and `randint` can repeat values. Use `sample` when you need unique values (e.g. a lottery).
- `randrange(1)`, `randrange(0, 1)`, `randrange(0, 1, 1)` always return `0`; `randint(0, 1)` returns `0` or `1`.

### platform

The layers your code runs on: **your code → Python (runtime) → OS → hardware**. The `platform` module reports on the underlying hardware, OS, and interpreter.

| Function | Returns |
|---|---|
| `platform(aliased = False, terse = False)` | A human-readable string describing the whole environment. `aliased` may show alternative names; `terse` gives a briefer form. |
| `machine()` | Generic processor name (e.g. `x86`, `x86_64`, `armv7l`). |
| `processor()` | Real processor name, if possible. |
| `system()` | Generic OS name (e.g. `Windows`, `Linux`). |
| `version()` | OS version string. |
| `python_implementation()` | e.g. `CPython`. |
| `python_version_tuple()` | A 3-element tuple: **major**, **minor**, **patch** level. |

- Rough sizes: `math` has over 50 symbols, `random` over 60 entities, `platform` about 70 functions.
- **Python Module Index:** https://docs.python.org/3/py-modindex.html, a directory of standard modules.

## Writing Your Own Modules

- When a module is first imported, Python creates a **`__pycache__`** folder holding `module.cpython-xy.pyc`: **semi-compiled** code (not machine code). Later imports are faster. It's rebuilt automatically if the source changes.
- When a module is imported, its contents are **implicitly executed**, which lets it initialize itself. This happens **only once**, on the first import, even if several files import it.

### `__name__`

Each source file has its own `__name__` variable:

- Run directly: `__name__` is `"__main__"`.
- Imported as a module: `__name__` is the file name without `.py`.

```
if __name__ == "__main__":
    print("I prefer to be a module.")
else:
    print("I like to be a module.")
```

A common use: put **tests** in the `if __name__ == "__main__":` block. They run when you run the module directly and are skipped when it's imported.

### Private variables

- Python **can't hide** variables from a module's users.
- By **convention**, a leading `_` or `__` marks a name as private. Users may obey it or not.

### Module anatomy

```
#!/usr/bin/env python3

""" module.py - an example of a Python module """

__counter = 0

def suml(the_list):
    global __counter
    __counter += 1
    the_sum = 0
    for element in the_list:
        the_sum += element
    return the_sum

if __name__ == "__main__":
    print("I prefer to be a module, but I can do some tests for you.")
    my_list = [i+1 for i in range(5)]
    print(suml(my_list) == 15)
```

- **Shebang** (also *shabang, hashbang, poundbang, hashpling*): the `#!` line. A **comment** to Python, but on Unix-like OSs (including MacOS) it tells the OS which program runs the file. No effect on Windows.
- **Doc-string:** a string placed before any module instructions (including imports) that explains the module's purpose.

### Where Python looks: sys.path

- `sys.path` is a list of folders searched **in order** for imported modules. The first match wins; if none match, the import fails.
- The **first element** is the folder where execution started.
- A **zip file** can appear in the path; Python treats it like a folder.
- `sys.path` is modifiable: `path.append('..\\modules')` adds a folder at the end; `insert()` can put it elsewhere.
- Backslashes are doubled because `\` is the escape character.
- A relative path only works if you start from the right folder; an absolute path always works.

## Packages

**Package:** a container for related modules, the way a folder holds files. Modules group functions; packages group modules.

- Entities in a package tree are named with dots, like folders: `extra.good.best.tau.funT()`.
- **`__init__.py`:** the file that makes a folder a package. It runs when any of the package's modules is imported and initializes the package. It **may be empty but must not be absent**. Subpackages can have their own.
- A package can be placed **anywhere**, as long as Python knows its location (via `sys.path`).
- A package can also be distributed inside a **zip file** and imported from it by adding the zip to `sys.path`.

```
from sys import path
path.append('..\\packages')

import extra.iota              # fully qualified; "import iota" fails
print(extra.iota.funI())

from extra.iota import funI
import extra.good.best.sigma as sig
```

## PIP and PyPI

- **PyPI (Python Package Index):** the main centralized repository of Python packages, maintained by the **Packaging Working Group**, part of the **Python Software Foundation**. Nicknamed **the Cheese Shop** (after a Monty Python sketch). Website: https://pypi.org/. It's not the only repo, but the most important one.
- **pip:** the tool for using PyPI. A **recursive acronym**: "pip installs packages". It's a **console** tool and may need to be installed separately.
- Linux may have both Python 2 and 3, so there can be `pip` (or `pip2`) and `pip3`. On Linux, installing pip with the system package manager (e.g. `apt` installing `python3-pip`) is preferred.
- On Windows, if `pip` isn't recognized, the **PATH** variable is probably wrong; reinstalling Python and letting the installer set it is easiest.

### Dependencies

- **Dependency:** when software relies on other software, often across several levels.
- **Dependency hell:** manually tracking down and installing every required package.
- pip **discovers, identifies, and resolves dependencies** automatically, avoiding unnecessary downloads.

### pip commands

| Command | What it does |
|---|---|
| `pip --version` / `pip3 --version` | Check pip's version. |
| `pip help` | List all operations. |
| `pip help operation` | Describe one operation (e.g. `pip help install`). |
| `pip list` | List installed packages and versions. Always includes `pip` and `setuptools`. |
| `pip show package_name` | Info about an **installed** package, including `Requires:` (what it needs) and `Required-by:` (what needs it). |
| `pip search anystring` | Search PyPI package names and summaries (case-insensitive). Needs internet. |
| `pip install name` | Install **system-wide** (needs admin rights). |
| `pip install --user name` | Install for **your user only**. |
| `pip install -U name` | **Update** an installed package. |
| `pip uninstall name` | Uninstall a package. |

- The `show` data comes from the package's own **metadata**.
- pip uses the Internet to query PyPI; it doesn't store PyPI content locally.
- Example: `pygame` (a game library, developed since 2000) installed with `pip install pygame` or `pip install --user pygame`.

# Module 2: Strings, String and List Methods, Exceptions

## Characters and Encoding

- **Computers store characters as numbers.** Each character maps to a unique number.
- **Whitespaces** and **control characters** (which control input/output devices) are characters too, e.g. the end-of-line code.
- **ASCII (American Standard Code for Information Interchange):** the most widely used standard. Room for **256 characters**, but only the **first 128** are standard. Uses **8 bits** per character.

Key ASCII codes:

| Character | Code |
|---|---|
| space | 32 |
| `0` | 48 |
| `A` | 65 |
| `a` | 97 |

The difference between `a` and `A` is **32** (the space's code). Letters are in alphabetical order, and **upper-case comes before lower-case**.

- **I18N:** short for **internationalization** (I, 18 letters, N). Software must work across languages and alphabets.
- **Code point:** a number that makes a character (e.g. 32 is the space in ASCII).
- **Code page:** a standard for using the **upper 128 code points** for national characters. The same code point means different characters in different code pages (e.g. 200 is Č in ISO/IEC 8859-2 but Ш in ISO/IEC 8859-5), so code points are ambiguous.
- **Unicode:** assigns unique, unambiguous characters to **more than a million code points**. The first 128 match ASCII; the first 256 match ISO/IEC 8859-1 (Western European). Unicode only names characters and groups them into **planes**; it doesn't say how to store them.

| Encoding | How it stores characters |
|---|---|
| **UCS-4** (Universal Character Set) | **32 bits (4 bytes)** per character. Wasteful (4 times ASCII size). May start with a **BOM** (byte order mark). |
| **UTF-8** (Unicode Transformation Format) | Uses only as many bits as needed: **8** for Latin/ASCII, **16** for non-Latin, **24** for CJK ideographs. No BOM needed. The most common. |

Python 3 fully supports Unicode and UTF-8, in names and in input/output.

## Strings in Python

Python strings are **immutable sequences**.

- `len()` returns the number of characters. An escaped character (e.g. `\'` or `\n`) counts as **one**; the backslash isn't counted.
- **Multiline strings** use triple apostrophes `'''...'''` or triple quotes `"""..."""`. The invisible line feed `\n` between lines counts as a character.

```
multiline = '''Line #1
Line #2'''
print(len(multiline))   # 15 (7 + 7 + the \n)
```

### Operators

- `+` **concatenates** (not commutative: order matters).
- `*` **replicates** (string and number, in either order).
- `+=` and `*=` work too.
- **Overloading:** using one operator for different kinds of data.

```
print(5 * 'a')                          # aaaaa
asterisk = '*'
plus = "+"
print((asterisk + plus) * 4 + asterisk) # *+*+*+*+*
```

### ord() and chr()

- `ord(char)`: the code point of a **one-character string**. Anything else raises **TypeError**. `ord('a')` is 97; `ord(' ')` is 32.
- `chr(code)`: the character for a code point. An invalid argument raises **ValueError** or **TypeError**. `chr(945)` is `α`.
- `chr(ord(x)) == x` and `ord(chr(x)) == x` are always true.

### Indexing, iterating, slicing

- Strings support **indexing** (including negative indices) and **iterating** with `for`. Going past the end raises an exception.
- **Slices** work as with lists:

```
alpha = "abdefg"

print(alpha[1:3])    # bd
print(alpha[3:])     # efg
print(alpha[:3])     # abd
print(alpha[3:-2])   # e
print(alpha[-3:4])   # e
print(alpha[::2])    # adf
print(alpha[1::2])   # beg
```

- `in` checks whether the left string appears anywhere in the right one; `not in` is the opposite. Case-sensitive.

### Immutability

- `del` **can't remove characters** from a string, only delete the whole string.
- Strings have **no `append()` or `insert()`**.
- To "change" a string, build a new one: `alphabet = "a" + alphabet + "z"`. This creates a new copy each time (slightly less efficient, but fine).

### Sequence functions and methods

| Function/method | What it does |
|---|---|
| `min(seq)` | Smallest element (lowest code point). Empty sequence raises **ValueError**. `min("aAbByYzZ")` is `A`. |
| `max(seq)` | Largest element. `max("aAbByYzZ")` is `z`. |
| `seq.index(x)` | Index of the **first** occurrence. Absent element raises **ValueError**. |
| `list(str)` | New list of the string's characters, one per element. Also works on tuples and dictionaries. |
| `seq.count(x)` | Number of occurrences. Absent element returns 0 (no error). |

```
print("aAbByYzZaA".index("b"))   # 2
print("aAbByYzZaA".index("Z"))   # 7
print("aAbByYzZaA".index("A"))   # 1
print(list("abcabc"))            # ['a', 'b', 'c', 'a', 'b', 'c']
print("abcabc".count("b"))       # 2
```

## String Methods

> **Key line:** String methods never change the original string. They **return a new string** (or a value), which is lost unless you use it.

| Method | What it returns |
|---|---|
| `capitalize()` | First character upper-case (if a letter); **all other letters lower-case**. `'aBcD'` → `'Abcd'`. |
| `center(width)` | Centered in a field of `width`, padded with spaces. Too-small width returns the original. |
| `center(width, char)` | Same, padded with `char`. `'gamma'.center(20, '*')` → `*******gamma********`. |
| `endswith(sub)` | `True` if the string ends with `sub`. |
| `startswith(sub)` | `True` if the string starts with `sub`. |
| `find(sub)` | Index of the first occurrence, or **-1** if absent (no error). **Strings only.** |
| `find(sub, start)` | Search starting at index `start`. |
| `find(sub, start, end)` | Search from `start` up to, but **not including**, `end`. |
| `rfind(...)` | Like `find()` but searches **from the end** (right). Same 1, 2, and 3-parameter forms. |
| `isalnum()` | Only letters or digits. Empty string is `False`. |
| `isalpha()` | Only letters. |
| `isdigit()` | Only digits. |
| `islower()` | Only lower-case letters. |
| `isupper()` | Only upper-case letters. |
| `isspace()` | Only whitespaces. |
| `join(list)` | Joins the list's strings, using the string it's called on as the **separator**. Non-string elements raise **TypeError**. |
| `lower()` | All upper-case letters lower-cased. No parameters. |
| `upper()` | All lower-case letters upper-cased. |
| `swapcase()` | Swaps the case of every letter. |
| `title()` | First letter of **every word** upper-case, the rest lower-case. |
| `lstrip()` | Removes **leading** whitespaces. |
| `lstrip(chars)` | Removes leading characters that appear **anywhere in `chars`** (a set, not a prefix). |
| `rstrip()` / `rstrip(chars)` | Same, on the **trailing** side. |
| `strip()` | Removes leading **and** trailing whitespaces. |
| `replace(old, new)` | Replaces all occurrences. Empty `new` removes them. |
| `replace(old, new, count)` | Limits the number of replacements. |
| `split()` | List of substrings split on **whitespace** (spaces aren't kept). Empty string gives an empty list. Reverse of `join()`. |

```
print(",".join(["omicron", "pi", "rho"]))          # omicron,pi,rho
print("www.cisco.com".lstrip("w."))                # cisco.com
print("pythoninstitute.org".lstrip(".org"))        # pythoninstitute.org (no leading o, r, g or .)
print("This is it!".replace("is", "are"))          # Thare are it!
print("phi       chi\npsi".split())                # ['phi', 'chi', 'psi']
print('kappa'.find('a', 2))                        # 4
print('kappa'.find('a', 1, 4))                     # 1
print('kappa'.find('a', 2, 4))                     # -1
print("I know that I know nothing.".swapcase())    # i KNOW THAT i KNOW NOTHING.
```

- Use `in`, not `find()`, to check if a single character occurs: it's much faster.
- `isalnum()` on `'Six lambdas'` is `False` because of the space; on `'lambda_30'` it's `False` because of `_`.

## Strings in Action

### Comparing strings

- All comparison operators (`==`, `!=`, `>`, `>=`, `<`, `<=`) work on strings, comparing **code points character by character**.
- The result is decided by the **first different character**.
- If the shorter string matches the start of the longer one, the **longer string is greater**: `'alpha' < 'alphabet'`.
- Comparison is **case-sensitive**: upper-case is **less than** lower-case, so `'beta' > 'Beta'`.
- Digit-only strings are **still strings**, not numbers:

```
print('10' == '010')   # False
print('10' > '010')    # True
print('10' > '8')      # False
print('20' < '8')      # True
print('20' < '80')     # True
```

Comparing strings to numbers:

| Comparison | Result |
|---|---|
| `string == number` | Always `False` |
| `string != number` | Always `True` |
| `>`, `>=`, `<`, `<=` | Raises **TypeError** |

### Sorting

- `sorted(list)`: a **function** that returns a **new** sorted list. The original is untouched.
- `list.sort()`: a **method** that sorts the list **in situ** (no new list).

### Conversions

- `str(number)`: number to string. Always works.
- `int(string)` / `float(string)`: string to number. Only if the string is a valid number; otherwise **ValueError**.

### Example programs

- **Caesar cipher:** replaces each letter with the next one (Z becomes A), using `ord()` and `chr()`.
- **Numbers processor:** `line.split()`, then `float()` each piece inside `try`/`except`.
- **IBAN validator:** IBAN (International Bank Account Number) = 2-letter country code (ISO 3166-1) + 2 check digits + account number (up to 30 alphanumeric characters). Valid length is 15 (Norway) to 31 (Malta).

IBAN validation steps:

1. Check the total length is correct for the country.
2. Move the first four characters (country code and check digits) to the end.
3. Replace each letter with two digits: A = 10, B = 11, ... Z = 35.
4. Treat it as an integer and divide by 97. If the **remainder is 1**, the IBAN might be valid.

Other string-comparison ideas:

- **Hamming distance** and **Levenshtein distance:** measure how similar two strings are (fuzzy comparison).
- **Soundex:** compares how English words *sound* (acoustic similarity); invented in 1918.
- Python stores very large integers using string-like techniques because of limited native precision.

**Labs:** Your own split (`mysplit()`), A LED Display, Improving the Caesar cipher, Palindromes, Anagrams, The Digit of Life, Find a word!, Sudoku.

## Exceptions

When code does something wrong, Python **stops the program** and **creates an exception** object. Together this is called **raising an exception**.

- If nothing handles it, the program is **terminated** with an error message (a traceback).
- If it's **handled**, the program can continue.

Common exceptions so far: **ValueError** (e.g. `float("Abracadabra")`, `math.sqrt(-1)`), **ZeroDivisionError**, **IndexError**, **TypeError**, **KeyboardInterrupt** (Ctrl-C).

### try / except

Python prefers trying first and handling failure, over checking everything beforehand (which bloats code).

```
try:
    x = int(input("Enter a number: "))
    y = 1 / x
    print(y)
except ZeroDivisionError:
    print("You cannot divide by zero, sorry.")
except ValueError:
    print("You must enter an integer value.")
except:
    print("Oh dear, something went wrong...")

print("THE END.")
```

- `try` starts the risky block. If an exception occurs, execution **jumps immediately** to the matching `except`, skipping the rest of the `try` block.
- If nothing goes wrong, all `except` blocks are skipped.

Rules for `except` branches:

- They're searched **in order**; **the first match** runs, and no other branch is visited.
- The same exception name can't appear in more than one branch.
- Any number of branches is allowed, but `try` needs **at least one** `except`.
- `except` can't be used without a preceding `try`.
- If no branch matches, the exception stays **unhandled**.
- An unnamed `except:` must be **last**, and there can be only one.

```
try:
    print("1")
    x = 1 / 0
    print("2")      # skipped
except:
    print("Oh dear, something went wrong...")
print("3")
```

Output: `1`, `Oh dear, something went wrong...`, `3`.

### The exception hierarchy

Python 3 defines **63 built-in exceptions** in a tree with the root on top. The closer to the root, the more **general (abstract)**; the leaves are **concrete**.

```
BaseException
 ↑
Exception
 ↑
ArithmeticError
 ↑
ZeroDivisionError
```

- An exception matches a branch naming it **or any more general** exception. `except ArithmeticError:` catches ZeroDivisionError.
- **Order matters:** a general exception listed before a concrete one makes the concrete branch **unreachable**. Python gives no warning.
- Handle several exceptions the same way with a tuple: `except (exc1, exc2):`.
- `except:` and `except BaseException:` are equivalent.

```
try:
    y = 1 / 0
except ArithmeticError:
    print("Arithmetic problem!")   # runs
except ZeroDivisionError:
    print("Zero Division!")        # unreachable
```

### Exceptions and functions

- An exception raised in a function can be handled **inside** it or **outside** by the caller (or the caller's caller).
- Exceptions **cross function and module boundaries**, travelling up the call chain until handled. If never handled, Python terminates the program.

### raise

- `raise exc`: raises an exception on demand. Useful to **test** handling, or to handle part of an exception and pass the rest on (separation of concerns).
- `raise` (no name): **re-raises** the exception currently being handled. Allowed **only inside an `except` branch**.

```
def bad_fun(n):
    try:
        return n / 0
    except:
        print("I did it again!")
        raise

try:
    bad_fun(0)
except ArithmeticError:
    print("I see!")
```

Output: `I did it again!`, `I see!`, `THE END.`

### assert

`assert expression` evaluates the expression:

- `True`, non-zero, non-empty string, or anything other than `None`: nothing happens.
- Otherwise (`False`, `0`, empty string, `None`): raises **AssertionError**.

Assertions don't replace exceptions or data validation; they **supplement** them ("like an airbag").

## Useful Built-in Exceptions

| Exception | Location in tree | Raised when |
|---|---|---|
| **ArithmeticError** (abstract) | BaseException ← Exception ← ArithmeticError | Any arithmetic error (zero division, invalid domain). |
| **AssertionError** | BaseException ← Exception ← AssertionError | `assert` argument is `False`, `None`, `0`, or an empty string. |
| **BaseException** (abstract) | BaseException | The most general; includes all others. |
| **IndexError** | BaseException ← Exception ← LookupError ← IndexError | Accessing a non-existent sequence element. |
| **KeyboardInterrupt** | BaseException ← KeyboardInterrupt | User presses Ctrl-C. **Not derived from Exception.** |
| **LookupError** (abstract) | BaseException ← Exception ← LookupError | Invalid references to collections. |
| **MemoryError** | BaseException ← Exception ← MemoryError | Not enough free memory. |
| **OverflowError** | BaseException ← Exception ← ArithmeticError ← OverflowError | A number too big to store. |
| **ImportError** | BaseException ← Exception ← StandardError ← ImportError | An import fails. |
| **KeyError** | BaseException ← Exception ← LookupError ← KeyError | Accessing a non-existent key (e.g. in a dictionary). |

- **Abstract:** ArithmeticError, BaseException, LookupError.
- **Concrete:** AssertionError, ImportError, IndexError, KeyboardInterrupt, KeyError, MemoryError, OverflowError.

**Lab: Reading ints safely:** `read_int(prompt, min, max)` keeps asking until the input is an integer in range, printing `Error: wrong input` or `Error: the value is not within permitted range (min..max)`.

# Module 3: Object-Oriented Programming

## Procedural vs Object-Oriented

| | Procedural | Object-oriented |
|---|---|---|
| **Data and code** | Two separate worlds. Functions use data (and can abuse it). | Data and code live together in **classes**. |
| **Best for** | Smaller, simpler projects. | Big, complex projects built by large teams. |

- Python is a universal tool for **both** styles. Some problems (e.g. GUI handling) need the object approach.
- **Methods:** functions invoked from within the data, not beside it.
- **Class:** like a recipe for creating objects.
- **Object:** an incarnation of a class. A class is a set of objects; an object is a being belonging to a class.
- **Properties (attributes):** an object's traits. **Methods:** its activities.

### Class hierarchies

- **Superclass:** the more general class, at the **top**. **Subclass:** a more specialized class below it.
- The hierarchy grows **top to bottom, like tree roots**.
- In an **inheritance diagram**, arrows point **from the subclass to its superclass**. The top class has no superclass.
- An object of a class also belongs to **all its superclasses** (a car is a wheeled vehicle, a land vehicle, and a vehicle). An object of a superclass doesn't necessarily belong to a subclass.
- **Inheritance:** an object inherits all traits, requirements, and qualities defined in any of its superclasses. The relationship is **transitive**: if C is a subclass of B and B of A, then C is a subclass of A.

### What an object has

| Group | Hint when describing it |
|---|---|
| A **name** that identifies it in its namespace | a noun |
| A set of **properties** (may be empty) | an adjective |
| A set of **abilities/methods** (may be empty) | a verb |

Example: "A pink Cadillac went quickly." Name = Cadillac, class = Wheeled vehicles, property = color (pink), activity = go (quickly).

### First class and object

```
class TheSimplestClass:
    pass

my_first_object = TheSimplestClass()
```

- A class definition starts with the keyword `class`, then the class name and a colon.
- A class existing doesn't create any objects. You create them by calling the class **like a function**.
- **Instantiation:** creating an object; the object is an **instance** of the class.

## The Stack Example

**Stack:** stores data **LIFO (Last In, First Out)**, like a stack of coins. Two operations: **push** (put on top) and **pop** (take from top).

Procedural stack:

```
stack = []

def push(val):
    stack.append(val)

def pop():
    val = stack[-1]
    del stack[-1]
    return val
```

Its problems, and the OOP fixes:

| Problem | OOP solution |
|---|---|
| The list is exposed; anyone can break it (`stack[0] = 0`). | **Encapsulation:** hide (protect) values from unauthorized access. |
| More stacks need more lists and functions. | One class can produce **as many stacks as needed**. |
| Adding features to many stacks is messy. | **Inheritance:** a subclass adds new traits to the existing ones. |

Object stack:

```
class Stack:
    def __init__(self):
        self.__stack_list = []

    def push(self, val):
        self.__stack_list.append(val)

    def pop(self):
        val = self.__stack_list[-1]
        del self.__stack_list[-1]
        return val

stack_object = Stack()
stack_object.push(3)
print(stack_object.pop())
```

- **Constructor:** a method named **`__init__`**, invoked **implicitly** when an object is created. It initializes the object.
- Every method (including the constructor) needs **at least one parameter**, conventionally named **`self`**, which represents the object. Python passes it automatically.
- Properties are created by assigning them, usually in the constructor: `self.stack_list = []`.
- Access properties with **dot notation** and **no parentheses**: `stack_object.stack_list`.
- A name starting with **two underscores** (`__stack_list`) is **private**: accessible only inside the class. Accessing it from outside raises **AttributeError**. This is how Python implements **encapsulation**.
- A **public** name must not start with two underscores, and may have **at most one trailing underscore**.
- Each object gets its own copy of private data but shares the same methods.

### Subclassing the stack

```
class AddingStack(Stack):
    def __init__(self):
        Stack.__init__(self)
        self.__sum = 0

    def get_sum(self):
        return self.__sum

    def push(self, val):
        self.__sum += val
        Stack.push(self, val)

    def pop(self):
        val = Stack.pop(self)
        self.__sum -= val
        return val
```

- The superclass name goes in parentheses: `class AddingStack(Stack):`. The subclass gets everything from the superclass.
- Python makes you **explicitly invoke the superclass constructor** (`Stack.__init__(self)`); otherwise the object misses `__stack_list`. Do it **before** other initializations.
- When calling a superclass method by class name **inside the class**, you must pass `self` explicitly. From **outside**, you never pass `self`.
- **Overriding:** redefining a superclass method with the same name. The interface stays the same; the implementation changes.

**Labs:** Counting stack, Queue aka FIFO (**FIFO: First In, First Out**; `put()` and `get()`, with a custom `QueueError`), Queue part 2 (`isempty()`).

## Properties: Instance and Class Variables

### Instance variables

- Exist only when explicitly created and added to an object (in the constructor or at any time later). They can also be removed.
- Different objects of the same class **may have different sets of properties**. Each object's are **isolated** from the others.
- **`__dict__`:** a dictionary every object has, holding the names and values of all its instance variables.

```
class ExampleClass:
    def __init__(self, val = 1):
        self.first = val

    def set_second(self, val):
        self.second = val

example_object_1 = ExampleClass()
example_object_2 = ExampleClass(2)
example_object_2.set_second(3)
example_object_3 = ExampleClass(4)
example_object_3.third = 5

print(example_object_1.__dict__)   # {'first': 1}
print(example_object_2.__dict__)   # {'first': 2, 'second': 3}
print(example_object_3.__dict__)   # {'first': 4, 'third': 5}
```

### Name mangling

When a private (`__name`) instance variable is created **inside a class method**, Python **mangles** it to `_ClassName__name`:

- `self.__first` in `ExampleClass` is stored as `_ExampleClass__first`.
- The mangled name **is accessible from outside**: `example_object_1._ExampleClass__first`. So privacy is limited.
- Mangling **doesn't happen** if the variable is added **outside** the class code (`obj.__third = 5` stays `__third`).
- Mangling applies to private **methods** and **class variables** too.

### Class variables

- **Class variable:** exists in **exactly one copy**, stored outside any object. It exists even if no objects have been created.
- Created by assigning it inside the class but **outside any method**.
- Shows the **same value in every instance**.
- **Not** shown in an object's `__dict__`; it appears in the **class's** `__dict__`.

```
class ExampleClass:
    counter = 0
    def __init__(self, val = 1):
        self.__first = val
        ExampleClass.counter += 1

example_object_1 = ExampleClass()
example_object_2 = ExampleClass(2)
example_object_3 = ExampleClass(4)

print(example_object_1.__dict__, example_object_1.counter)  # {'_ExampleClass__first': 1} 3
```

### Checking whether an attribute exists

- Accessing a non-existent attribute raises **AttributeError**. You can catch it with `try`/`except AttributeError`.
- **`hasattr(object_or_class, 'name')`** returns `True` or `False`. The name must be a **string**. Works on classes too.

```
class ExampleClass:
    a = 1
    def __init__(self):
        self.b = 2

example_object = ExampleClass()

print(hasattr(example_object, 'b'))   # True
print(hasattr(example_object, 'a'))   # True
print(hasattr(ExampleClass, 'b'))     # False
print(hasattr(ExampleClass, 'a'))     # True
```

## Methods

- A **method** is a function embedded in a class. It must have **at least one parameter** (no parameterless methods), the first one usually named `self`.
- When invoking a method, **don't pass `self`**; Python sets it. Extra parameters go after `self` in the definition.
- `self` is used to access the object's **instance and class variables** and to **invoke other methods** from inside the class (`self.other()`).

### The constructor

- A method named `__init__` is the **constructor**. It's invoked automatically when an object is created.
- It must have `self`, may have more parameters (the class call must match them), and can have **default values**.
- It **cannot return a value** and **cannot be invoked directly** from the object or from inside the class (only from a subclass).

```
class Classy:
    def __init__(self, value = None):
        self.var = value

obj_1 = Classy("object")
obj_2 = Classy()
print(obj_1.var)   # object
print(obj_2.var)   # None
```

- Methods starting with `__` are (partially) hidden by mangling: `obj.__hidden()` fails, `obj._Classy__hidden()` works.

### Built-in attributes

| Attribute | On | Contains |
|---|---|---|
| `__dict__` | objects and classes | Their variables (the class one also lists methods). |
| `__name__` | **classes only** | The class name (a string). `obj.__name__` is an error; use `type(obj).__name__`. |
| `__module__` | classes and objects | Name of the module where the class is defined. `__main__` means the file currently being run. |
| `__bases__` | **classes only** | A **tuple of classes** (not names) that are direct superclasses, in definition order. |

- `type(obj)` returns the class an object was created from.
- A class with no explicit superclass has **`object`** (a predefined class) as its direct ancestor: `__bases__` shows `( object )`.

### Introspection and reflection

- **Introspection:** a program examining the type or properties of an object **at runtime**.
- **Reflection:** a program **manipulating** an object's values, properties, or functions at runtime.

| Function | What it does |
|---|---|
| `getattr(obj, 'name')` | Returns the attribute's current value. |
| `setattr(obj, 'name', value)` | Sets the attribute's value. |
| `isinstance(value, type)` | Checks the type (e.g. `int`). |

```
def incIntsI(obj):
    for name in obj.__dict__.keys():
        if name.startswith('i'):
            val = getattr(obj, name)
            if isinstance(val, int):
                setattr(obj, name, val + 1)
```

This increments every integer attribute whose name starts with `i`.

**Labs:** The Timer class (`__str__` returning `hh:mm:ss`), Days of the week (`Weeker` with `WeekDayError`), Points on a plane (`math.hypot()`), Triangle (composition of `Point` objects).

## Inheritance

**Inheritance:** passing attributes and methods from a superclass to a newly created **subclass**, building a new class from an existing repertoire of traits instead of from scratch.

### `__str__()`

When an object must be shown as a string (e.g. in `print()`), Python calls its **`__str__()`** method. The default returns something like `<__main__.Star object at 0x...>`. Define your own to return a readable string.

```
class Star:
    def __init__(self, name, galaxy):
        self.name = name
        self.galaxy = galaxy

    def __str__(self):
        return self.name + ' in ' + self.galaxy

print(Star("Sun", "Milky Way"))   # Sun in Milky Way
```

### issubclass(), isinstance(), and is

| Check | Returns `True` when |
|---|---|
| `issubclass(ClassOne, ClassTwo)` | ClassOne is a subclass of ClassTwo. **Every class is a subclass of itself.** |
| `isinstance(objectName, ClassName)` | The object was made from the class **or any of its superclasses**. |
| `object_one is object_two` | Both variables refer to the **same object**. |

```
class Vehicle: pass
class LandVehicle(Vehicle): pass
class TrackedVehicle(LandVehicle): pass
```

| is a subclass of → | Vehicle | LandVehicle | TrackedVehicle |
|---|---|---|---|
| **Vehicle** | True | False | False |
| **LandVehicle** | True | True | False |
| **TrackedVehicle** | True | True | True |

The `isinstance()` table for one object of each class looks the same.

- Variables store **handles** to objects, not the objects. Assigning one variable to another copies the handle, not the object.

```
object_1 = SampleClass(0)
object_2 = SampleClass(2)
object_3 = object_1
object_3.val += 1

print(object_1 is object_2)   # False
print(object_2 is object_3)   # False
print(object_3 is object_1)   # True
print(object_1.val, object_2.val, object_3.val)   # 1 2 1

string_1 = "Mary had a little "
string_2 = "Mary had a little lamb"
string_1 += "lamb"
print(string_1 == string_2, string_1 is string_2)   # True False
```

### super()

- **`super()`** accesses the **nearest superclass** without naming it: `super().__init__(name)`.
- With `super()`, you **don't (and mustn't) pass `self`**.
- It works for any superclass resource, not just the constructor.
- Class variables and instance variables from the superclass are inherited too (instance ones only if the superclass constructor is called).

### How Python finds attributes

When you access an object's entity, Python looks:

1. **Inside the object** itself.
2. In **all classes in its inheritance line**, from **bottom to top**.
3. If several classes are on the same level (multiple inheritance), from **left to right**.

If nothing is found, it raises **AttributeError**.

- **Single inheritance:** a subclass has exactly one superclass (most common and recommended).
- **Multiple inheritance:** a class has more than one superclass: `class Sub(SuperA, SuperB):`.
- **Overriding:** the entity defined **later** (lower in the hierarchy) overrides the same name defined earlier.

```
class Left:
    var = "L"
    var_left = "LL"
    def fun(self):
        return "Left"

class Right:
    var = "R"
    var_right = "RR"
    def fun(self):
        return "Right"

class Sub(Left, Right):
    pass

obj = Sub()
print(obj.var, obj.var_left, obj.var_right, obj.fun())   # L LL RR Left
```

With `class Sub(Right, Left):` the output is `R LL RR Right`.

### Polymorphism

```
class One:
    def do_it(self):
        print("do_it from One")

    def doanything(self):
        self.do_it()

class Two(One):
    def do_it(self):
        print("do_it from Two")

One().doanything()   # do_it from One
Two().doanything()   # do_it from Two
```

- **Polymorphism:** a subclass modifying its superclass's behavior. One class takes many forms depending on its subclasses' redefinitions. (Greek: *polys* "many" + *morphe* "form".)
- **Virtual method:** a method redefined in a subclass, changing the superclass's behavior.
- **Abstract method:** an empty method in the superclass that only shows a possibility; subclasses implement it.
- Polymorphism keeps code clean: e.g. a `Vehicle.turn()` uses `change_direction()`, which `TrackedVehicle` and `WheeledVehicle` implement differently.

### Composition

**Composition:** building an object from other objects, each delivering part of the behavior.

| Inheritance | Composition |
|---|---|
| **Extends** a class's capabilities by adding and modifying components. The recipe is in the class and its ancestors. | Treats a class as a **container** that stores and uses other objects. |

```
class Wheels:
    def change_direction(self, left, on):
        print("wheels: ", left, on)

class Vehicle:
    def __init__(self, controller):
        self.controller = controller

    def turn(self, left):
        self.controller.change_direction(left, True)
        time.sleep(0.25)
        self.controller.change_direction(left, False)

wheeled = Vehicle(Wheels())
```

### Single vs multiple inheritance

- Single inheritance is **simpler, safer, easier** to understand and maintain.
- Multiple inheritance is risky, makes overriding tricky, makes `super()` **ambiguous**, and violates the **single responsibility principle**.
- Use multiple inheritance as a last resort; **composition** is often better.

### Method Resolution Order (MRO)

**MRO:** the strategy a language uses to scan the class hierarchy for a method. Python's MRO can't be violated.

- `class Bottom(Middle, Top):` (where Middle is already a subclass of Top) is valid but adds nothing.
- `class Bottom(Top, Middle):` fails: **TypeError: Cannot create a consistent method resolution order (MRO)**. The order conflicts with the real inheritance path.

### The diamond problem

```
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass
```

- The inheritance diagram is diamond-shaped: A on top, B and C in the middle, D at the bottom.
- **Java and C#** don't allow multiple inheritance, so no diamonds. **Python allows it**, and MRO decides.
- If B and C both define `m_middle()`, `D().m_middle()` uses **B's**, because B is listed first.

## Exceptions Once Again

### else and finally

```
def reciprocal(n):
    try:
        n = 1 / n
    except ZeroDivisionError:
        print("Division failed")
        n = None
    else:
        print("Everything went fine")
    finally:
        print("It's time to say goodbye")
        return n

print(reciprocal(2))
print(reciprocal(0))
```

Output:

```
Everything went fine
It's time to say goodbye
0.5
Division failed
It's time to say goodbye
None
```

- **`else:`** runs **only if no exception** was raised in `try`. It must come after the last `except`. After `try`, either an `except` branch or `else` runs, never both.
- **`finally:`** **always** runs, whether or not an exception was raised or handled. It must be the last branch.
- `else` and `finally` are independent; use either or both.

### Exceptions are classes

- When an exception is raised, an **object** of its class is created and travels up looking for a handler.
- `except Exception as e:` catches the object in `e`. Its scope is only that `except` branch.
- Printing `e` uses its `__str__()`, which gives the reason message.
- **`args`:** a property introduced by `BaseException`; a **tuple of all arguments passed to the constructor**. Empty with no arguments, one element with one, and so on.

```
try:
    raise Exception("my", "exception")
except Exception as e:
    print(e.args)   # ('my', 'exception')
```

- `__subclasses__()` returns a class's direct subclasses. The root of all exceptions is **BaseException**; its direct children include **Exception, GeneratorExit, SystemExit, KeyboardInterrupt**.

### Creating your own exceptions

- Define new exceptions as **subclasses of built-in ones**.
- To make a special case of a built-in exception, derive from **that** exception. For your own separate hierarchy, derive from a top class like **Exception**.

```
class MyZeroDivisionError(ZeroDivisionError):
    pass
```

An `except ZeroDivisionError:` branch catches both; to tell them apart, put `except MyZeroDivisionError:` **first**.

```
class PizzaError(Exception):
    def __init__(self, pizza='unknown', message=''):
        Exception.__init__(self, message)
        self.pizza = pizza

class TooMuchCheeseError(PizzaError):
    def __init__(self, pizza='unknown', cheese='>100', message=''):
        PizzaError.__init__(self, pizza, message)
        self.cheese = cheese
```

- Custom exceptions can carry extra data (here `pizza` and `cheese`).
- Giving **default values** to all constructor parameters lets you raise them by class name alone: `raise PizzaError`.
- The more specific `except TooMuchCheeseError` must come **before** `except PizzaError`.

# Module 4: Miscellaneous

## Generators and Iterators

**Generator:** specialized code that produces a **series of values** and controls the iteration. Generators are often called **iterators** (the course treats them as one). `range()` is a generator.

| Function | Generator |
|---|---|
| Returns **one** value, invoked once. | Returns a **series** of values, implicitly invoked many times. |

### The iterator protocol

**Iterator protocol:** how an object must behave to work with `for` and `in`. An object that follows it is an **iterator**. It must provide:

- **`__iter__()`:** returns **the object itself**. Invoked **once**, to start the iteration.
- **`__next__()`:** returns the **next value**. When there are no more, it raises **`StopIteration`**.

```
class Fib:
    def __init__(self, nn):
        self.__n = nn
        self.__i = 0
        self.__p1 = self.__p2 = 1

    def __iter__(self):
        return self

    def __next__(self):
        self.__i += 1
        if self.__i > self.__n:
            raise StopIteration
        if self.__i in [1, 2]:
            return 1
        ret = self.__p1 + self.__p2
        self.__p1, self.__p2 = self.__p2, ret
        return ret

for i in Fib(10):
    print(i)
```

- Order of calls: the object is created, `__iter__` runs once, then `__next__` runs **11 times** for `Fib(10)` (10 values, plus one that raises StopIteration).
- An iterator can be **composed** into another class whose `__iter__()` returns it.
- The protocol is **inconvenient** because the iterator must save its state between calls.

### yield

- Replacing `return` with **`yield`** turns a function into a **generator**.
- `yield` returns a value like `return`, but **doesn't lose the function's state**: variables are frozen and execution **resumes** on the next call.
- A generator **shouldn't be invoked explicitly**; calling it returns a generator **object** (its identifier), not the values. Use it in a context that needs a series, like `for`.
- `yield` can only be used **inside functions**.

```
def powers_of_2(n):
    power = 1
    for i in range(n):
        yield power
        power *= 2

for v in powers_of_2(8):
    print(v)                      # 1 2 4 8 16 32 64 128

t = [x for x in powers_of_2(5)]   # in a list comprehension: [1, 2, 4, 8, 16]
t = list(powers_of_2(3))          # list() collects the values: [1, 2, 4]

for i in range(20):
    if i in powers_of_2(4):       # the in operator works too: 1 2 4 8
        print(i)
```

```
def fibonacci(n):
    p = pp = 1
    for i in range(n):
        if i in [0, 1]:
            yield 1
        else:
            n = p + pp
            pp, p = p, n
            yield n

print(list(fibonacci(10)))   # [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

## List Comprehensions and Conditional Expressions

**List comprehension:** a compact way of creating a list in place.

```
list_2 = [10 ** ex for ex in range(6)]   # [1, 10, 100, 1000, 10000, 100000]
```

**Conditional expression:** `expression_one if condition else expression_two`. It's an **operator**, not an instruction. It gives `expression_one` when the condition is `True`, otherwise `expression_two`.

```
the_list = [1 if x % 2 == 0 else 0 for x in range(10)]   # [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
```

> **Key line:** Square **brackets** make a list comprehension; **parentheses** make a **generator**.

```
the_list = [1 if x % 2 == 0 else 0 for x in range(10)]
the_generator = (1 if x % 2 == 0 else 0 for x in range(10))
```

- Both print the same values when iterated, but the list exists as a whole, while the generator produces values **one by one**.
- `len(the_list)` is 10; `len(the_generator)` raises **TypeError: object of type 'generator' has no len()**.

## Lambda Functions

**Lambda:** an **anonymous function** (a function without a name). Borrowed from mathematics' *Lambda calculus*, but not the same thing.

```
lambda parameters: expression
```

It returns the value of the expression for the given arguments.

```
two = lambda: 2
sqr = lambda x: x * x
pwr = lambda x, y: x ** y

for a in range(-2, 3):
    print(sqr(a), end=" ")
    print(pwr(a, two()))
```

Output: `4 4`, `1 1`, `0 0`, `1 1`, `4 4`.

- A lambda assigned to a variable is no longer anonymous.
- The real benefit: pass a lambda directly where a function is needed, instead of defining a one-use function:

```
def print_function(args, fun):
    for x in args:
        print('f(', x,')=', fun(x), sep='')

print_function([x for x in range(-2, 3)], lambda x: 2 * x**2 - 4 * x + 2)
```

### map() and filter()

| Function | What it does |
|---|---|
| `map(function, list)` | Applies the function to **every element** and returns an **iterator** of the results. The second argument can be any iterable; more than two arguments are allowed. |
| `filter(function, list)` | Keeps only the elements for which the function returns **`True`**. Returns an iterator. |

```
list_1 = [x for x in range(5)]
list_2 = list(map(lambda x: 2 ** x, list_1))   # [1, 2, 4, 8, 16]

short_list = [1, "Python", -1, "Monty"]
print(list(filter(lambda s: isinstance(s, str), short_list)))   # ['Python', 'Monty']
```

Use `list()` to turn the result into a list.

## Closures

**Closure:** a technique that **stores values even though the context they were created in no longer exists**.

```
def outer(par):
    loc = par

    def inner():
        return loc
    return inner

var = 1
fun = outer(var)
print(fun())   # 1
```

- `inner()` is defined inside `outer()` and can use `outer()`'s variables. It can only be invoked from within `outer()`.
- `outer()` returns a copy of `inner()` **frozen** with its full environment, so `loc` survives after `outer()` ends.
- A closure must be **invoked the same way it was declared** (here, with no arguments).
- Closures can take parameters, and one factory can create many closures:

```
def make_closure(par):
    loc = par

    def power(p):
        return p ** loc
    return power

fsqr = make_closure(2)
fcub = make_closure(3)

for i in range(5):
    print(i, fsqr(i), fcub(i))
```

Output: `0 0 0`, `1 1 1`, `2 4 8`, `3 9 27`, `4 16 64`.

## Files and Streams

### File names

- **Windows** uses `\` as the directory separator; **Unix/Linux** uses `/`.
- Unix/Linux file names are **case-sensitive**. Windows stores case but doesn't distinguish it.
- In Python strings `\` is the escape character, so write Windows paths as `"\\dir\\file"`. Python also converts `/` automatically on Windows, so `"/dir/file"` and `"c:/dir/file"` work too.

### Streams

- Programs don't talk to files directly but through **handles** or **streams** (synonyms here).
- **Opening the file:** connecting a stream to a file. **Closing the file:** disconnecting it. `open` is always the first operation and `close` the last.
- Opening can fail: the file doesn't exist, no permission, or too many open files (e.g. an OS limit like 200).
- **Open mode:** declares how the stream will be processed. Only operations consistent with the mode are allowed.

| Mode | Allows |
|---|---|
| **Read mode** | Reads only. Writing raises **UnsupportedOperation** (from the `io` module; inherits OSError and ValueError). |
| **Write mode** | Writes only. Reading raises the same exception. |
| **Update mode** | Both reads and writes. |

- **Current file position:** a stream behaves like a tape recorder; a virtual head moves as data is read or written.
- Every file is behind an object of an adequate class. You **never use constructors**: you get the object from **`open()`** and remove it with **`close()`**.
- **`BufferedIOBase`** can process any file; **`TextIOBase`** is specialized for text files.

### Text vs binary streams

| Text streams | Binary streams |
|---|---|
| Structured in **lines** of typographical characters. Read/written character by character or line by line. | A sequence of **bytes** of any value (programs, images, audio, databases). Read/written byte by byte or block by block. |

- **Line endings:** Unix/Linux uses **LF** (`\n`, ASCII 10). Windows (from CP/M) uses **CR LF** (`\r\n`, ASCII 13 and 10).
- **Non-portability:** traits that stop a program running in other environments. **Portability:** the ability to run anywhere.
- In **text mode** on Windows, Python does a **translation of newline characters**: `\r\n` becomes `\n` when reading, and `\n` becomes `\r\n` when writing. It's transparent. In binary mode, nothing is converted.

### open()

```
stream = open(file, mode = 'r', encoding = None)
```

- Returns a stream object, or raises an exception (e.g. **FileNotFoundError** if a file to read doesn't exist).
- Defaults: mode is **read in text mode**; encoding depends on the platform. Use e.g. `encoding='utf-8'` for national characters.

| Mode | Meaning | File must exist? |
|---|---|---|
| `r` | **Read.** | **Yes**, and be readable. |
| `w` | **Write.** Creates the file, or **truncates it to zero length** if it exists. | No |
| `a` | **Append.** Creates the file if needed; the head is placed at the **end**, existing content kept. | No |
| `r+` | **Read and update.** Both reads and writes. | **Yes**, and be writeable. |
| `w+` | **Write and update.** Both reads and writes. Creates the file if needed. | No |
| `x` | **Exclusive creation.** Raises an exception if the file already exists. | Must **not** exist |

- Add **`b`** at the end for **binary** mode, or **`t`** for **text** mode (the default): `rt`, `rb`, `wt`, `wb`, `at`, `ab`, `r+t`, `r+b`, `w+t`, `w+b`.
- After opening, the position is **before the first byte**, except in `a` mode, where it's **after the last byte**.

```
try:
    stream = open("C:\\Users\\User\\Desktop\\file.txt", "rt")
    # Processing goes here.
    stream.close()
except Exception as exc:
    print("Cannot open the file:", exc)
```

### Pre-opened streams

Three streams are already open when a program starts (import `sys` to use them):

| Stream | Purpose |
|---|---|
| `sys.stdin` | Standard input (normally the keyboard; used by `input()`). |
| `sys.stdout` | Standard output (normally the screen; used by `print()`). |
| `sys.stderr` | Standard error output, for error messages. |

```
import sys
sys.stderr.write("Error message")
```

### close()

- `stream.close()` takes no arguments and returns nothing; it raises **IOError** on error.
- It can fail: data may still be in a **cache/buffer**, and closing **flushes** the buffers.
- The three pre-opened streams don't need closing.

### Diagnosing stream problems

- The **IOError** object has an **`errno`** property (error number). Compare it with constants from the **`errno`** module.

| Constant | Meaning |
|---|---|
| `errno.EACCES` | Permission denied (e.g. writing a read-only file). |
| `errno.EBADF` | Bad file number (e.g. using an unopened stream). |
| `errno.EEXIST` | File exists (e.g. renaming a file to its own name). |
| `errno.EFBIG` | File too large for the OS. |
| `errno.EISDIR` | Is a directory (treating a directory as a file). |
| `errno.EMFILE` | Too many open files. |
| `errno.ENOENT` | No such file or directory. |
| `errno.ENOSPC` | No space left on device. |

- **`os.strerror(errno)`** returns a string describing an error number. A non-existent code raises **ValueError**.

```
from os import strerror

try:
    s = open("c:/users/user/Desktop/file.txt", "rt")
    s.close()
except Exception as exc:
    print("The file could not be opened:", strerror(exc.errno))
```

## Reading and Writing Files

### Text files

| Method | Returns |
|---|---|
| `read(n)` | Up to `n` characters as a string. Empty string at end of file. |
| `read()` | The **whole file** as a string. Careful with huge files. |
| `readline()` | One complete line, or an empty string at end of file. |
| `readlines()` | A **list of all lines**. |
| `readlines(n)` | Lines up to a buffer of about `n` bytes. Returns an **empty list** at end of file. |

- The file object from `open()` in text mode is **iterable**: `__next__` returns the next line, and the stream **closes itself automatically** at the end of the file.

```
for line in open('text.txt', 'rt'):
    print(line, end='')
```

- **`write(string)`:** writes a string. **No newline is added**; include `\n` yourself. Writing to a stream opened for reading fails.

```
file = open('newtext.txt', 'wt')
for i in range(10):
    file.write("line #" + str(i+1) + "\n")
file.close()
```

### bytearray

- **Amorphous data:** data with no specific shape, just a series of bytes.
- **`bytearray`:** a specialized class holding amorphous bytes. `bytearray(10)` creates 10 bytes, **all zeros**.
- Like lists: **mutable**, work with `len()`, and support indexing.
- Elements must be **integers** (otherwise **TypeError**) in the range **0 to 255** (otherwise **ValueError**).
- `hex()` shows a value in hexadecimal.

### Binary files

| Method | What it does |
|---|---|
| `write(bytearray)` | Writes all the bytes. Returns the **number of bytes written**. |
| `readinto(bytearray)` | Fills an **existing** bytearray with bytes from the file. Returns the number of bytes read. Unfilled space stays untouched. |
| `read()` | Reads the whole file into a new **`bytes`** object (like bytearray but **immutable**). Wrap it: `bytearray(f.read())`. |
| `read(n)` | Reads at most `n` bytes. |

```
data = bytearray(10)
for i in range(len(data)):
    data[i] = 10 + i

bf = open('file.bin', 'wb')
bf.write(data)
bf.close()

data = bytearray(10)
binary_file = open('file.bin', 'rb')
binary_file.readinto(data)
binary_file.close()
```

- File-copy example: read chunks into a 64 KB **buffer** (`bytearray(65536)`) with `readinto()` and write `buffer[:readin]`. A larger buffer means fewer I/O operations, up to a limit.
- **`exit(code)`** stops the program and passes a completion code to the OS; any code other than `0` signals a problem.

**Labs:** Character frequency histogram, Sorted character frequency histogram (`sorted(..., key=lambda x: counters[x], reverse=True)`, output to a `.hist` file), Evaluating students' results (custom exception hierarchy: `StudentsDataException`, `BadLine`, `FileEmpty`).

## The os Module

The `os` module lets you **interact with the operating system**: files and directories, OS information, processes, and file descriptors.

| Function/attribute | What it does | OS command equivalent |
|---|---|---|
| `os.uname()` | Object with `systemname`, `nodename`, `release`, `version`, `machine`. **Only some Unix systems**; on Windows use `platform.uname()`. | `uname -a` |
| `os.name` | `posix` (Unix), `nt` (Windows), or `java` (Jython). | |
| `os.mkdir(path)` | Creates a directory (relative or absolute path). Raises **FileExistsError** if it exists. Optional `mode` for permissions (ignored on some systems; use `chmod`). | `mkdir` |
| `os.makedirs(path)` | Creates directories **recursively** (all directories in the path). | `mkdir -p` (Unix), `mkdir` (Windows) |
| `os.listdir(path)` | List of file and directory names in the path (current directory if omitted). **Omits `.` and `..`**. | `ls` |
| `os.chdir(path)` | Changes the current working directory. | `cd` |
| `os.getcwd()` | Returns the **absolute path** of the current working directory. | `pwd` |
| `os.rmdir(path)` | Removes a single directory. It must exist and be **empty**. | `rmdir` |
| `os.removedirs(path)` | Removes a directory and its subdirectories. Each must exist and be empty. | `rm -r` (Unix) |
| `os.system(command)` | Runs a command given as a string. On **Windows** returns the shell's return value; on **Unix** returns the process **exit status** (`0` = success). | |

Relative and absolute paths:

- `my_first_directory` and `./my_first_directory`: in the current working directory.
- `../my_first_directory`: in the parent directory.
- `/python/my_first_directory`: absolute path from the root.

**Lab:** a recursive `find(path, dir)` that prints the absolute paths of every directory with the given name.

## The datetime Module

The `datetime` module provides **classes for working with date and time** (used for event logging, tracking database changes, data validation, storing important information).

### date

```
from datetime import date

today = date.today()
print(today.year, today.month, today.day)

my_date = date(2019, 11, 4)
```

- `date.today()` returns the current local date.
- Attributes `year`, `month`, `day` are **read-only**.

| Parameter | Restriction |
|---|---|
| `year` | 1 (**MINYEAR**) to 9999 (**MAXYEAR**) |
| `month` | 1 to 12 |
| `day` | 1 to the last day of the given month and year |

- **Timestamp:** seconds since **January 1, 1970, 00:00:00 (UTC)**, the **Unix epoch**. Leap seconds aren't counted on Unix or Windows.
- `time.time()` returns the current timestamp as a **float**.
- `date.fromtimestamp(timestamp)` creates a date from a timestamp.
- `date.fromisoformat('2019-11-04')` creates a date from the **YYYY-MM-DD** format (**ISO 8601**). Pad months and days with 0. Available since Python 3.7.
- `d.replace(year=..., month=..., day=...)` returns a **new** date (any parameters optional); assign it to a variable.

| Method | Monday | Sunday |
|---|---|---|
| `weekday()` | 0 | 6 |
| `isoweekday()` (ISO 8601) | 1 | 7 |

`date(2019, 11, 4).weekday()` is `0`; `.isoweekday()` is `1`.

### time (class)

```
time(hour, minute, second, microsecond, tzinfo, fold)
```

All parameters are optional.

| Parameter | Range |
|---|---|
| `hour` | 0 to 23 |
| `minute` | 0 to 59 |
| `second` | 0 to 59 |
| `microsecond` | 0 to 999999 |
| `tzinfo` | A `tzinfo` subclass object (time zones) or `None` (default) |
| `fold` | 0 or 1 (wall times; default 0) |

```
from datetime import time
t = time(14, 53, 20, 1)
print(t)   # 14:53:20.000001
```

### The time module

| Function | What it does |
|---|---|
| `time.time()` | Current timestamp (float). |
| `time.sleep(seconds)` | Suspends execution for the given seconds (int or float). |
| `time.ctime(timestamp)` | Timestamp to a string, e.g. `Mon Nov  4 14:53:00 2019`. No argument: current time. |
| `time.gmtime(timestamp)` | Timestamp to a **struct_time** in **UTC** (`tm_isdst` always 0). |
| `time.localtime(timestamp)` | Timestamp to a struct_time in **local time**. |
| `time.asctime(struct_time)` | struct_time or tuple to a string. No argument: uses `localtime()`. |
| `time.mktime(tuple)` | struct_time or tuple (local time) to seconds since the epoch. |
| `time.strftime(format, struct_time)` | Formats a struct_time or tuple; without one, uses current local time. |
| `time.strptime(string, format)` | Parses a string into a struct_time. |

**struct_time** fields: `tm_year`, `tm_mon` (1 to 12), `tm_mday` (1 to 31), `tm_hour` (0 to 23), `tm_min` (0 to 59), `tm_sec` (0 to 61), `tm_wday` (0 to 6), `tm_yday` (1 to 366), `tm_isdst` (1 yes, 0 no, -1 unknown), `tm_zone`, `tm_gmtoff`.

- Fields can be accessed by **index**: 0 is `tm_year`, 8 is `tm_isdst`. `tm_zone` and `tm_gmtoff` **can't** be indexed.

### datetime (class)

```
datetime(year, month, day, hour, minute, second, microsecond, tzinfo, fold)
```

- Combines date and time in one object. Same restrictions as `date` and `time`. All attributes are read-only.
- `dt.date()` returns a `date` object; `dt.time()` returns a `time` object.

```
from datetime import datetime
dt = datetime(2019, 11, 4, 14, 53)
print("Datetime:", dt)          # 2019-11-04 14:53:00
print("Date:", dt.date())       # 2019-11-04
print("Time:", dt.time())       # 14:53:00
```

| Method | Returns |
|---|---|
| `datetime.today()` | Current local date and time, `tzinfo` set to `None`. |
| `datetime.now(tz)` | Same as `today()`, unless a `tz` (tzinfo subclass object) is passed. |
| `datetime.utcnow()` | Current **UTC** date and time, `tzinfo` set to `None`. |
| `dt.timestamp()` | Float seconds since the Unix epoch. |
| `datetime.strptime(string, format)` | Parses a string into a `datetime`. A mismatched format raises **ValueError**. |

### Formatting with strftime()

- `strftime(format)` returns the date/time in a chosen format. All `datetime` module classes have it.
- **Directive:** `%` followed by a letter. Other characters in the format are kept as-is.

| Directive | Meaning | Example |
|---|---|---|
| `%Y` | Year with century | 2020 |
| `%y` | Year without century, zero-padded | 20 |
| `%m` | Month, zero-padded | 01 |
| `%B` | Full month name | November |
| `%b` | Abbreviated month name | Nov |
| `%d` | Day, zero-padded | 04 |
| `%H` | Hour (24-hour), zero-padded | 14 |
| `%M` | Minute, zero-padded | 53 |
| `%S` | Second, zero-padded | 00 |
| `%p` | AM/PM | PM |
| `%A` | Full weekday name | Wednesday |
| `%a` | Abbreviated weekday name | Wed |
| `%w` | Weekday number (0 is Sunday) | 3 |
| `%j` | Day of the year | 309 |
| `%W` | Week number of the year | 44 |

```
from datetime import datetime
print(datetime.strptime("2019/11/04 14:53:00", "%Y/%m/%d %H:%M:%S"))   # 2019-11-04 14:53:00

dt = datetime(2020, 11, 4, 14, 53)
print(dt.strftime("%y/%B/%d %H:%M:%S"))   # 20/November/04 14:53:00
```

### timedelta

- Subtracting two `date` or `datetime` objects gives a **`timedelta`**.

```
print(date(2020, 11, 4) - date(2019, 11, 4))                                # 366 days, 0:00:00
print(datetime(2020, 11, 4, 0, 0, 0) - datetime(2019, 11, 4, 14, 53, 0))   # 365 days, 9:07:00
```

- Constructor arguments (all optional, default 0): `days`, `seconds`, `microseconds`, `milliseconds`, `minutes`, `hours`, `weeks`.
- Internally it stores only **days, seconds, and microseconds**: weeks become days, hours and minutes become seconds, milliseconds become microseconds.

```
delta = timedelta(weeks=2, days=2, hours=3)
print(delta)           # 16 days, 3:00:00
print(delta.days)      # 16
print(delta.seconds)   # 10800
```

- A timedelta can be **multiplied by an integer** and **added** to a `date` or `datetime`:

```
delta = timedelta(weeks=2, days=2, hours=2)
delta2 = delta * 2                                # 32 days, 4:00:00
print(date(2019, 10, 4) + delta2)                 # 2019-11-05
print(datetime(2019, 10, 4, 14, 53) + delta2)     # 2019-11-05 18:53:00
```

## The calendar Module

- Days of the week run **Monday to Sunday**, numbered **0 (Monday) to 6 (Sunday)**. Constants like `calendar.MONDAY` and `calendar.SUNDAY` (6) exist.

| Function | What it does |
|---|---|
| `calendar.calendar(year)` | Calendar for a whole year as a string (like Unix `cal`). Optional: `w` column width (2), `l` lines per week (1), `c` spaces between month columns (6), `m` number of columns (3). |
| `calendar.prcal(year)` | Same, but prints it (no `print()` needed). |
| `calendar.month(year, month)` | Calendar for one month. Optional `w` and `l`. |
| `calendar.prmonth(year, month)` | Same, but prints it. |
| `calendar.setfirstweekday(day)` | Changes the first day of the week (default Monday). |
| `calendar.weekday(year, month, day)` | Day of the week as an integer. `weekday(2020, 12, 24)` is 3 (Thursday). |
| `calendar.weekheader(width)` | Short weekday names. Width over 3 still gives 3 characters. `weekheader(2)` → `Mo Tu We Th Fr Sa Su`. Affected by `setfirstweekday()`. |
| `calendar.isleap(year)` | `True` if a leap year. |
| `calendar.leapdays(y1, y2)` | Number of leap years from `y1` up to but **not including** `y2`. `leapdays(2010, 2021)` is 3. |

### Calendar classes

| Class | Purpose |
|---|---|
| `calendar.Calendar` | Prepares calendar data for formatting. |
| `calendar.TextCalendar` | Creates regular text calendars. |
| `calendar.HTMLCalendar` | Creates HTML calendars. |
| `calendar.LocaleTextCalendar` | Subclass of TextCalendar; takes a `locale` for month and weekday names. |
| `calendar.LocaleHTMLCalendar` | Subclass of HTMLCalendar; takes a `locale`. |

`Calendar(firstweekday=0)` methods:

| Method | Returns |
|---|---|
| `iterweekdays()` | Iterator of weekday numbers, starting with `firstweekday`. `Calendar(calendar.SUNDAY)` gives `6 0 1 2 3 4 5`. |
| `itermonthdates(year, month)` | Every day of the month as `datetime.date` objects, **plus** days from neighboring months needed to complete the weeks. |
| `itermonthdays(year, month)` | Day numbers; days outside the month are **0**. |
| `itermonthdays2(year, month)` | Tuples of (day of month, weekday number). |
| `itermonthdays3(year, month)` | Tuples of (year, month, day). Python 3.7+. |
| `itermonthdays4(year, month)` | Tuples of (year, month, day, weekday). Python 3.7+. |
| `monthdays2calendar(year, month)` | A list of weeks; each week is a list of (day number, weekday number) tuples. Days outside the month are 0. |

**Lab:** `MyCalendar(calendar.Calendar)` with `count_weekday_in_year(year, weekday)` using `monthdays2calendar()` (2019, Monday → 52; 2000, Sunday → 53).
