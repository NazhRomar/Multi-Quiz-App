# Python Essentials 1 (PE1): Study Notes

# Module 1: Introduction to Python and Computer Programming

PE1 is the first of a two-course series and prepares you for the **PCEP: Certified Entry-Level Python Programmer** exam.

## How Programs Work

- A **program** makes a computer usable. Computers can only do very simple operations (like adding or dividing), but very fast and many times.
- **Machine language:** the computer's own, very rudimentary language.
- **Instruction list (IL):** the complete set of commands a computer knows. It differs between computer types. Machine languages are developed by humans.
- **Natural languages:** human languages that developed naturally and keep evolving.

### What makes a language

| Element | Meaning | Example |
|---|---|---|
| **Alphabet** | The set of symbols used to build words. | Latin alphabet for English, Cyrillic for Russian, Kanji for Japanese |
| **Lexis** (dictionary) | The set of words the language offers. | "computer" is in the dictionary; "cmoptrue" isn't |
| **Syntax** | Rules for whether a string of words is a valid sentence. | "I am a python" is valid; "I a python am" isn't |
| **Semantics** | Rules for whether a phrase makes sense. | "I ate a doughnut" makes sense; "A doughnut ate me" doesn't |

- The IL is **the alphabet of a machine language**.
- **High-level programming languages:** a bridge between humans and computers; more complex than machine language, simpler than natural language.
- **Source code:** a program written in a high-level language (vs. **machine code**). **Source file:** the file containing it.
- A program must be correct **alphabetically, lexically, syntactically, and semantically**.

## Compilation vs Interpretation

There are two ways to turn high-level code into machine language:

- **Compilation:** the source is translated **once** (repeated after each change) into a file of machine code (e.g. an `.exe`) that can be distributed. The translator is a **compiler**.
- **Interpretation:** the source is translated **every time it runs**. The translator is an **interpreter**. End users also need the interpreter.

| | Compilation | Interpretation |
|---|---|---|
| **Advantages** | Translated code usually runs **faster**. Only the programmer needs the compiler. Machine code is hard to read, so your tricks stay secret. | Run code **as soon as it's written**; no translation phase. Code is stored in the programming language, so it runs on different architectures without recompiling. |
| **Disadvantages** | Compiling can be **time-consuming**. You need a compiler for **every hardware platform**. | **Slower**: the code shares the CPU with the interpreter. **Both you and the end user** need the interpreter. |

How the interpreter works:

- Source code must be **pure text** (no fonts, colors or images).
- It reads **top to bottom, left to right**, checking each line, then executing it (read-check-execute, repeated many times).
- On an error it stops and shows an **error message**. The reported location may be **after** the real cause.
- Part of the code may run successfully before an error is found.

> **Key line:** **Python is an interpreted language**, so you need the Python interpreter to run it. Python is **free**.

- **Scripting languages:** languages designed to be interpreted. Their programs are **scripts**.

## About Python

**Python:** a widely-used, **interpreted, object-oriented, high-level** programming language with **dynamic semantics**, used for general-purpose programming.

- Named after the BBC comedy series **Monty Python's Flying Circus**, not the snake.
- Created by **Guido van Rossum** (born 1956 in Haarlem, the Netherlands), starting as a hobby project in **December 1989**. It's a descendant of the **ABC** language.

Guido van Rossum's goals for Python (1999):

- an **easy and intuitive** language just as powerful as major competitors;
- **open source**, so anyone can contribute;
- code as **understandable** as plain English;
- **suitable for everyday tasks**, with short development times.

Why Python: it's **easy to learn, easy to teach, easy to use, easy to understand, and easy to obtain, install and deploy** (free, open and multiplatform).

| Rival | Author | Compared to Python |
|---|---|---|
| **Perl** | Larry Wall | More traditional and conservative; resembles languages derived from C. |
| **Ruby** | Yukihiro Matsumoto | More innovative, full of fresh ideas. |

- Used for Internet services, developer tools, everyday applications, science, and testing.
- Rarely used for **low-level ("close to metal") programming** and **mobile applications**.

### Python 2 vs Python 3

- **Python 2:** the older version. Only bug and security fixes now; a dead end, but still alive in old code.
- **Python 3:** the current version, used in this course.
- They are **not compatible**: Python 2 scripts won't run on Python 3 and vice versa. Migration can't be fully automated.
- Newer Python 3 versions are **backward compatible** with earlier Python 3 versions (e.g. 3.6 made dictionary keys ordered by default in CPython).

### Python implementations

- **CPython:** the traditional reference implementation by Guido van Rossum, written in **C**. Maintained by the **PSF (Python Software Foundation)**, so it's called **canonical** and a **reference Python**. The most influential Python.

| Implementation | What it is |
|---|---|
| **Cython** | Automatically translates Python code into **C** code for speed (fixes Python's lack of efficiency in heavy math). |
| **Jython** | Python written in **Java**, for integrating with Java systems. Follows **Python 2** standards. |
| **PyPy** | "A Python within a Python": written in **RPython** (Restricted Python, a subset of Python), translated to C. Mainly a tool for Python developers to test new features. Compatible with Python 3. |
| **MicroPython** | An efficient Python 3 implementation optimized for **microcontrollers**. Created by **Damien George** (2013, Kickstarter, the **pyboard**). **CircuitPython** (2017) is derived from it. |

## Installing and Running Python

- **Linux** users most likely already have Python (`python3` in the terminal).
- **Windows:** run the installer from python.org and check **Add Python 3.x to PATH**.
- **macOS** may have Python 2 preinstalled; install Python 3 separately.

Tools you need:

- an **editor** to write code;
- a **console** to launch and forcibly stop code;
- a **debugger** to run code step by step.

**IDLE (Integrated Development and Learning Environment):** a simple tool included with Python.

- The **editor window** is for writing code; the **shell window** shows output. Don't confuse them.
- Python files use the **.py** extension.
- Use straight quotes (`"`), not curly "smart" quotes.
- Run with *Run → Run Module* or **F5**. IDLE highlights matching parentheses.

An error message shows:

- the **traceback** (the path the code took through the program);
- the **location of the error** (file, line number, module); it may point to where Python first noticed the error, not where it is;
- the **content of the erroneous line**;
- the **name of the error** and a short explanation.

A missing closing parenthesis produces an **EOF** (end-of-file) error; a misspelled `print` produces a different error, found at a different stage.

# Module 2: Data Types, Variables, Basic I/O, and Operators

## The print() Function

```
print("Hello, World!")
```

- `print` is a **function name**. A **function** is code that can **cause an effect** (e.g. send text to the screen) and/or **evaluate a value and return it** as its result.

Where functions come from:

- **From Python itself (built-in):** e.g. `print()`; always available. Python 3.8 has **69** built-in functions.
- **From modules:** add-ons that must be explicitly connected to your code.
- **From your code:** functions you write yourself.

- **Arguments:** values passed to a function inside the parentheses. A function can take **any number, including zero**. The parentheses are always required.
- Convention: write function names with empty parentheses, like `print()`.
- **Function invocation (function call):** the function name plus parentheses and arguments.

What happens on an invocation:

1. Python checks the name is **legal** (an existing function).
2. It checks the **number of arguments** is allowed.
3. It **leaves your code** and jumps into the function, passing the arguments.
4. The function **executes**, causes its effect, and evaluates its result.
5. Python **returns** to your code just after the invocation.

About `print()`:

| Question | Answer |
|---|---|
| Effect | Takes its arguments, converts them to human-readable form, and **sends them to the output device** (the console). |
| Arguments | **Any** type of data. |
| Return value | **None**. Its effect is enough. |

### Instructions

- A program is a collection of **instructions**. A function invocation is one kind.
- **Only one instruction per line** is allowed (one instruction may span several lines). A line may be empty.
- Instructions run **in order**, one after another.
- Each `print()` starts on a **new line**. An empty `print()` outputs an empty line (a newline).

### Escape characters

- The **backslash** (`\`) is the **escape character**: it announces that the next character has a different meaning.
- **`\n`** is the **newline character**. You see two characters; Python sees one.

### Positional and keyword arguments

- **Positional arguments:** meaning comes from their **position**. With several arguments, `print()` outputs them on one line, **separated by a space**.
- **Keyword arguments:** meaning comes from a **keyword**. Form: `keyword=value`. They must come **after the last positional argument**.

| Keyword | Default | Controls |
|---|---|---|
| `end` | `"\n"` | What `print()` outputs after its last argument. |
| `sep` | `" "` | The separator between arguments. |

```
print("My name is", "Python.", end=" ")
print("Monty Python.")                         # My name is Python. Monty Python.

print("My", "name", "is", "Monty", "Python.", sep="-")   # My-name-is-Monty-Python.

print("My", "name", "is", sep="_", end="*")
print("Monty", "Python.", sep="*", end="*\n")  # My_name_is*Monty*Python.*

print("Programming","Essentials","in", sep="***", end="...")
print("Python")                                # Programming***Essentials***in...Python
```

## Literals

**Literal:** data whose value is determined by the literal itself (`123` is a literal; `c` is not). Literals encode data directly in code.

- `print("2")` and `print(2)` look the same, but the first is a **string** and the second an **integer**, stored completely differently.
- **Type:** the characteristic of a value that determines its kind, range, and use. The form of a literal decides its type.

### Integers

- **Integers (ints):** numbers with no fractional part.
- No commas, dots, or spaces inside numbers. **Underscores** are allowed: `11_111_111` (Python 3.6+).
- Negative: `-11111111`. A leading `+` is allowed but unnecessary.

| Prefix | System | Digits | Example |
|---|---|---|---|
| `0o` or `0O` | **Octal** (base 8) | 0 to 7 | `0o123` = 83 |
| `0x` or `0X` | **Hexadecimal** (base 16) | 0 to 9 and six letters | `0x123` = 291 |
| (none) | Decimal | 0 to 9 | |

- **Binary** uses base 2 (only 0s and 1s): `1010` is 10 in decimal.

### Floats

- **Floating-point numbers (floats):** numbers that contain (or can contain) a fractional part: `2.5`, `-0.4`.
- Use a **point**, never a comma.
- A zero alone before or after the point can be omitted: `.4` is `0.4`, `4.` is `4.0`.
- **`4` is an int; `4.0` is a float.** The point makes a float.
- **Scientific notation** with `E` or `e` (exponent): `3E8` = 3 × 10⁸; `6.62607E-34` is Planck's constant.
  - The **exponent** (after E) must be an **integer**.
  - The **base** (before E) can be an int or a float.
- Python picks the **most economical** way to show a number: `print(0.0000000000000000000001)` prints `1e-22`.

### Strings

- **Strings** need **quotes** (`"..."`) or **apostrophes** (`'...'`); be consistent.
- To put a quote inside a string: escape it (`"I like \"Monty Python\""`) or use the other delimiter (`'I like "Monty Python"'`).
- Same for apostrophes: `'I\'m Monty Python.'` or `"I'm Monty Python."`
- A string can be **empty**: `''` or `""`.

### Boolean values

- **`True`** and **`False`**: the two Boolean values, representing truth. Case matters.
- In numeric contexts `True` is `1` and `False` is `0`, so `True > False` is `True`.

### None

**`None`** is a special literal (a `NoneType` object) representing **the absence of a value**.

## Operators

- **Operator:** a symbol that operates on values. **Expression:** data and operators combined; the simplest expression is a literal.

| Operator | Name | Notes |
|---|---|---|
| `**` | Exponentiation | `2 ** 3` = 8 |
| `*` | Multiplication | |
| `/` | Division | **Always returns a float**: `6 / 3` = `2.0` |
| `//` | Integer (floor) division | Rounds **down** to the lesser integer |
| `%` | Remainder (modulo) | What's left after integer division |
| `+` | Addition | |
| `-` | Subtraction | |

> **Key line:** If **both** arguments are integers, the result is an integer. If **at least one** is a float, the result is a float. The exception is `/`, which **always** gives a float.

### Integer division

- `//` drops the fractional part and conforms to the int vs. float rule.
- **Rounding always goes toward the lesser integer** (floor), even for negatives.

```
print(6 // 4)     # 1
print(6. // 4)    # 1.0
print(-6 // 4)    # -2
print(6. // -4)   # -2.0
```

### Remainder

```
print(14 % 4)     # 2   (14 // 4 = 3; 3 * 4 = 12; 14 - 12 = 2)
print(12 % 4.5)   # 3.0 (12 // 4.5 = 2.0; 2.0 * 4.5 = 9.0; 12 - 9.0 = 3.0)
```

- Don't divide, integer-divide, or take a remainder **by zero**.

### Unary and binary operators

- **Binary operator:** two operands (`4 + 5`, `12 % 5`). Subtraction uses a **minuend** and **subtrahend**.
- **Unary operator:** one operand (`-1`, `+3`). Unary `-` changes the sign; unary `+` preserves it.

### Priorities and binding

**Hierarchy of priorities:** operators with higher priority act first. Parentheses are always evaluated first.

| Priority | Operator | |
|---|---|---|
| 1 (highest) | `**` | |
| 2 | `+`, `-` | unary |
| 3 | `*`, `/`, `//`, `%` | |
| 4 (lowest) | `+`, `-` | binary |

- A unary operator **to the right** of `**` binds more strongly: `4 ** -1` = `0.25`.
- **Binding:** the order of evaluation for operators of equal priority. Most operators have **left-sided binding** (left to right).
- **`**` uses right-sided binding.**

```
print(9 % 6 % 2)       # 1   (left to right: 9 % 6 = 3, 3 % 2 = 1)
print(2 ** 2 ** 3)     # 256 (right to left: 2 ** 3 = 8, 2 ** 8 = 256)
print(-3 ** 2)         # -9
print(-2 ** 3)         # -8
print(-(3 ** 2))       # -9
print(2 * 3 % 5)       # 1
print((5 * ((25 % 13) + 100) / (2 * 13)) // 2)   # 10.0
```

## Variables

**Variable:** a named location in memory that stores a value. Every variable has a **name** and a **value**.

### Naming rules

- Only upper- or lower-case letters, digits, and the underscore `_`.
- Must **begin with a letter**; the underscore counts as a letter.
- **Case-sensitive**: `Alice` and `ALICE` are different variables.
- Must not be a **keyword**.
- No length limit. Non-Latin letters are allowed (`переменная`, `Einbahnstraße`).
- Incorrect: `10t` (starts with a digit), `!important`, `exchange rate` (contains a space).
- The same rules apply to function names.
- **Identifier:** a variable's unique name.

**PEP 8** naming convention: lowercase words separated by underscores for variables and functions (`my_variable`, `my_function`). Mixed case (`myVariable`) only where it's already the prevailing style.

### Keywords

These **reserved keywords** can't be used as names:

```
False  None  True  and  as  assert  break  class  continue  def  del
elif  else  except  finally  for  from  global  if  import  in  is
lambda  nonlocal  not  or  pass  raise  return  try  while  with  yield
```

Changing the case makes a word usable: `import` is forbidden, `Import` is fine.

### Creating and using variables

- A variable is **created by assigning a value to it**. No declaration is needed: Python is **dynamically typed**.
- A variable can hold any type, and its type can change.
- Using a variable that was never assigned is an **error** (`var` and `Var` are different).
- **`=` is the assignment operator**, not "equals". It assigns the right side's value to the left side.

```
var = 1
var = var + 1      # var is now 2 (incremented)

var = 100
var = 200 + 300
print(var)         # 500

a = 3.0
b = 4.0
c = (a ** 2 + b ** 2) ** 0.5   # square root via ** 0.5
print("c =", c)                # c = 5.0
```

### Shortcut (compound assignment) operators

If `op` is a **two-argument** operator, `variable = variable op expression` can be written as `variable op= expression`.

| Expression | Shortcut |
|---|---|
| `i = i + 2 * j` | `i += 2 * j` |
| `var = var / 2` | `var /= 2` |
| `rem = rem % 10` | `rem %= 10` |
| `j = j - (i + var + rem)` | `j -= (i + var + rem)` |
| `x = x ** 2` | `x **= 2` |

- `round(value, digits)` rounds to the given number of decimal places.

## Comments

- **Comment:** a remark for humans, **omitted at runtime**. Starts with **`#`** and runs to the end of the line.
- Multi-line comments need a `#` on **every** line.
- Comments can also **disable code** temporarily (commenting out), e.g. while testing.
- **Self-commenting names:** names that explain themselves (`square_area`, not `aunt_jane`; `length` and `width`, not `myvar1`).
- Never write comments with wrong information.
- Shortcut to comment/uncomment lines: **CTRL + /** (Windows) or **CMD + /** (Mac).

## Input and Type Conversion

- **`input()`** reads data typed by the user and **returns it as a string**. Assign the result to a variable or it's lost.
- `input("prompt")` shows a message before reading.
- The program waits until the user presses Enter.

```
anything = input("Tell me anything...")
print("Hmm...", anything, "...Really?")
```

> **Key line:** The result of `input()` is **always a string**, so you can't do arithmetic on it directly. `anything ** 2.0` raises **TypeError: unsupported operand type(s) for \*\* or pow(): 'str' and 'float'**.

| Function | Converts |
|---|---|
| `int(x)` | To an integer. Fails (and stops the program) if it can't. |
| `float(x)` | To a float. |
| `str(x)` | To a string. Always possible. |

```
leg_a = float(input("Input first leg length: "))
leg_b = float(input("Input second leg length: "))
print("Hypotenuse length is " + str((leg_a**2 + leg_b**2) ** .5))
```

### String operators

- **`+` concatenates** two strings. Both arguments must be strings. **Not commutative**: `"ab" + "ba"` differs from `"ba" + "ab"`. Left-sided binding.
- **`*` replicates** a string a number of times (in either order).
  - `"James" * 3` → `"JamesJamesJames"`
  - `3 * "an"` → `"ananan"`
  - `5 * "2"` → `"22222"` (not 10)
  - A number **less than or equal to zero** gives an **empty string**.

```
num_1 = input("Enter the first number: ")   # 12
num_2 = input("Enter the second number: ")  # 21
print(num_1 + num_2)                         # 1221

print("+" + 10 * "-" + "+")
print(("|" + " " * 10 + "|\n") * 5, end="")
print("+" + 10 * "-" + "+")
```

**Lab idea (end time):** add the duration to the minutes, then `hour + mins // 60`, `mins % 60`, `hour % 24`.

# Module 3: Booleans, Conditions, Loops, Lists, Logic and Bitwise Operations

## Comparison Operators

Computers know only two answers: **True** and **False**. Python asks questions with comparison (relational) operators.

| Operator | Returns `True` when |
|---|---|
| `==` | Operands are equal. |
| `!=` | Operands are **not** equal. |
| `>` | Left is greater than right. |
| `>=` | Left is greater than or equal to right (non-strict). |
| `<` | Left is less than right. |
| `<=` | Left is less than or equal to right (non-strict). |

- **`=` assigns; `==` compares.** `a = b` gives `a` the value of `b`; `a == b` asks if they're equal.
- All are **binary operators with left-sided binding**.
- `2 == 2.` is `True` (the int is converted to a float).
- `>`, `>=`, `<`, `<=` have **higher priority** than `==` and `!=`. So `black_sheep == 2 * white_sheep` means `black_sheep == (2 * white_sheep)`.
- You can store a comparison's result: `answer = number_of_lions >= number_of_lionesses`.

## Conditional Statements

```
if true_or_not:
    do_this_if_true
```

The `if` statement needs, in this order: the `if` keyword, whitespace, an expression, a **colon** and newline, and an **indented** block (at least one instruction).

- The expression is `True` when **non-zero** and `False` when **zero**.
- **Indentation:** four spaces are recommended (tabs also work). All lines in a block must be indented **exactly the same**. Python 3 **doesn't allow mixing spaces and tabs**.
- If the condition is true, the indented block runs; otherwise it's skipped. Unindented code after it always runs.

### if-else, nesting, and elif

```
if the_weather_is_good:
    go_for_a_walk()
elif tickets_are_available:
    go_to_the_theater()
elif table_is_available:
    go_for_lunch()
else:
    play_chess_at_home()
```

- **`else`:** runs when the `if` condition is false.
- **Nesting:** an `if` inside another `if`. Every `else` belongs to the `if` at the **same indentation level**.
- **`elif`** (else if) checks more conditions and **stops at the first true one**.
- An if-elif-else chain is sometimes called a **cascade**.

Cascade rules:

- You **can't use `else` without a preceding `if`**.
- `else` is always the **last** branch.
- `else` is **optional**.
- With an `else`, exactly **one** branch runs. Without one, possibly **none** runs.

- A one-instruction branch can go on the same line after the colon (`if x > y: larger = x`), but it's less readable.
- Separate `if` statements are each tested on their own; an `elif` is only tested if everything before it was false.

```
x = 10

if x == 10:     # True
    print("x == 10")
if x > 15:      # False
    print("x > 15")
elif x > 10:    # False
    print("x > 10")
elif x > 5:     # True
    print("x > 5")
else:
    print("else will not be executed")
```

Output: `x == 10`, `x > 5`.

- **Pseudocode:** a formalized, readable notation for an **algorithm** that isn't a real programming language.
- `max()` and `min()` are built-in functions returning the largest and smallest of their arguments.

### Leap year rule (Gregorian calendar, since 1582)

1. Not divisible by 4 → **common** year.
2. Otherwise, not divisible by 100 → **leap** year.
3. Otherwise, not divisible by 400 → **common** year.
4. Otherwise → **leap** year.

## Loops

**Loop:** performing part of the code more than once.

### while

```
while conditional_expression:
    instruction_one
    instruction_two
```

- `if` runs its body **once** when the condition is met; `while` **repeats** it as long as the condition is `True`.
- The indented instructions are the **loop's body**.
- If the condition is false the first time, the body **never runs**.
- The body should eventually make the condition false; otherwise you get an **infinite (endless) loop**. Stop one with **Ctrl-C**, which raises **KeyboardInterrupt**.

```
while True:
    print("I'm stuck inside a loop.")
```

- `while number != 0:` is equivalent to `while number:`. `if number % 2 == 1:` is equivalent to `if number % 2:`.

```
counter = 5
while counter != 0:
    print("Inside the loop.", counter)
    counter -= 1
print("Outside the loop.", counter)
```

### for and range()

The `for` loop counts turns for you, and can browse collections item by item.

```
for i in range(100):
    # do_something()
    pass
```

- No condition after `for`; it's checked internally.
- The variable after `for` is the **control variable**.
- `in` introduces the range of values.
- **`pass`** is an **empty instruction**; loops and `if`s need at least one instruction in the body.

| Call | Values generated |
|---|---|
| `range(10)` | 0 to 9 (starts at 0, stops **before** the argument) |
| `range(2, 8)` | 2 to 7 |
| `range(2, 8, 3)` | 2, 5 (the third argument is the **step**/increment, default 1) |
| `range(1, 1)` | nothing (empty) |
| `range(2, 1)` | nothing (with two arguments, the second must be greater) |
| `range(6, 1, -2)` | 6, 4, 2 |

- `range()` accepts **only integers**. Syntax: `range(start, stop, step)`: `start` defaults to 0, `stop` is **not included**, `step` defaults to 1.
- If `range()` generates nothing, the body doesn't run.

```
power = 1
for expo in range(16):
    print("2 to the power of", expo, "is", power)
    power *= 2
```

### break and continue

**Syntactic sugar (candy):** additions that don't increase a language's power but simplify the work.

| Keyword | Effect |
|---|---|
| `break` | **Exits the loop immediately**; execution continues after the loop. |
| `continue` | Skips the rest of the current turn and **starts the next turn**. |

```
for i in range(1, 6):
    if i == 3:
        break
    print("Inside the loop.", i)     # 1, 2
print("Outside the loop.")

for i in range(1, 6):
    if i == 3:
        continue
    print("Inside the loop.", i)     # 1, 2, 4, 5
print("Outside the loop.")
```

### Loops with else

- Both `while` and `for` can have an **`else`** branch. It runs when the loop ends **without `break`**, even if the body never ran.

```
i = 1
while i < 5:
    print(i)
    i += 1
else:
    print("else:", i)     # 1 2 3 4, then else: 5

for i in range(5):
    print(i)
else:
    print("else:", i)     # 0 1 2 3 4, then else: 4
```

- After a `for` loop, the control variable **keeps its last value**.
- If the `for` body never runs, the control variable keeps the value it had **before** the loop. If it didn't exist before, it won't exist in the `else` branch.

**Labs:** Guess the secret number, counting mississippily (`time.sleep(1)`), Stuck in a loop (`break`), the Ugly and Pretty Vowel Eaters (`continue`), pyramid height, Collatz's hypothesis.

## Logical Operators

- **Conjunction:** "and"; both conditions must hold. **Disjunction:** "or"; at least one must hold.

| A | B | `A and B` | `A or B` |
|---|---|---|---|
| False | False | False | False |
| False | True | False | True |
| True | False | False | True |
| True | True | True | True |

- **`and`:** binary, priority **lower than comparison operators**, so `counter > 0 and value == 100` needs no parentheses.
- **`or`:** binary, priority **lower than `and`**.
- **`not`:** unary logical negation; priority **very high, same as unary `+` and `-`**.

**De Morgan's laws:**

```
not (p and q) == (not p) or (not q)
not (p or q) == (not p) and (not q)
```

- Logical operators **can't** be used in the `op=` shortcut form.
- Logical operators treat their arguments as a whole: zero is `False`, non-zero is `True`. `j = not not i` gives `True` if `i` isn't zero.

## Bitwise Operators

Bitwise operators work on **each bit separately**. Their arguments **must be integers** (no floats).

| Operator | Name | Rule |
|---|---|---|
| `&` | Bitwise conjunction (and) | `1` only if **both** bits are 1 |
| `\|` | Bitwise disjunction (or) | `1` if **at least one** bit is 1 |
| `^` | Bitwise exclusive or (**xor**) | `1` if **exactly one** bit is 1 |
| `~` | Bitwise negation | Flips every bit |

```
i = 15     # ...00001111
j = 22     # ...00010110

log = i and j    # True (both non-zero)
bit = i & j      # 6    (...00000110)
logneg = not i   # False
bitneg = ~i      # -16  (...11110000, two's complement)
```

- `&=`, `|=`, `^=` shortcut forms exist.

### Bit masks

**Bit mask:** a sequence of bits used to read or change selected bits. For bit 3, the mask is `2³ = 8`.

| Task | Code | Property used |
|---|---|---|
| **Check** a bit | `if flag_register & the_mask:` | `x & 1 = x`, `x & 0 = 0` |
| **Reset** a bit (set to 0) | `flag_register &= ~the_mask` | |
| **Set** a bit (set to 1) | `flag_register \|= the_mask` | `x \| 1 = 1`, `x \| 0 = x` |
| **Negate** a bit | `flag_register ^= the_mask` | `x ^ 1 = ~x`, `x ^ 0 = x` |

Bits are numbered from zero (bit 0 is the lowest).

### Shifts

- `value << bits`: shift **left**, the same as **multiplying by 2** per bit.
- `value >> bits`: shift **right**, the same as **integer division by 2** per bit (the rightmost bit is lost).
- Integers only. Not commutative. `<<` and `>>` are **digraphs**.

```
var = 17
print(var, var << 2, var >> 1)   # 17 68 8
```

### Priority table (all operators so far)

| Priority | Operator | |
|---|---|---|
| 1 (highest) | `~`, `+`, `-` | unary |
| 2 | `**` | |
| 3 | `*`, `/`, `//`, `%` | |
| 4 | `+`, `-` | binary |
| 5 | `<<`, `>>` | |
| 6 | `<`, `<=`, `>`, `>=` | |
| 7 | `==`, `!=` | |
| 8 | `&` | |
| 9 | `\|` | |
| 10 (lowest) | `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `^=`, `\|=`, `>>=`, `<<=` | |

## Lists

- **Scalars:** variables that hold one value at a time.
- **List:** an **ordered and mutable** collection of comma-separated items in **square brackets**. Elements can be of **different types**, including other lists.

```
numbers = [10, 5, 7, 2, 1]
```

- Elements are numbered **from zero**. The value in brackets is the **index**; selecting an element is **indexing**. Any expression can be an index.
- **Negative indices** count from the end: `-1` is the last element, `-2` the one before last.
- `len(list)` returns the number of elements.
- **`del list[i]`** removes an element (an **instruction**, not a function). `del list` deletes the whole list.
- Accessing a non-existent element is a runtime error.

```
numbers = [10, 5, 7, 2, 1]
numbers[0] = 111
numbers[1] = numbers[4]
print(numbers)          # [111, 1, 7, 2, 1]
del numbers[1]
print(numbers)          # [111, 7, 2, 1]
print(numbers[-1])      # 1
```

### Functions vs methods

- A **function** doesn't belong to any data: `result = function(arg)`.
- A **method** is owned by the data it works for and can **change its state**: `result = data.method(arg)`.

### Adding elements

| Method | Effect |
|---|---|
| `list.append(value)` | Adds the value at the **end**. |
| `list.insert(location, value)` | Inserts at `location`; elements from there on shift right. |

```
my_list = []
for i in range(5):
    my_list.append(i + 1)      # [1, 2, 3, 4, 5]

my_list = []
for i in range(5):
    my_list.insert(0, i + 1)   # [5, 4, 3, 2, 1]
```

### Iterating

```
my_list = [10, 1, 8, 3, 5]
total = 0
for i in my_list:      # i takes each element's value
    total += i
print(total)           # 27
```

- Don't name a variable `sum`: it's a built-in function.

### Swapping

```
variable_1, variable_2 = variable_2, variable_1
```

Reversing a list by swapping:

```
length = len(my_list)
for i in range(length // 2):
    my_list[i], my_list[length - i - 1] = my_list[length - i - 1], my_list[i]
```

## Sorting: Bubble Sort

- A list can be sorted **increasing (non-decreasing)** or **decreasing (non-increasing)**.
- **Bubble sort:** compare **adjacent elements** and swap them if they're in the wrong order. After each pass, the largest remaining element "bubbles up" to its place. Simple but not efficient.
- Repeat passes until a pass makes **no swaps**.

```
my_list = [8, 10, 6, 2, 4]
swapped = True

while swapped:
    swapped = False
    for i in range(len(my_list) - 1):
        if my_list[i] > my_list[i + 1]:
            swapped = True
            my_list[i], my_list[i + 1] = my_list[i + 1], my_list[i]

print(my_list)   # [2, 4, 6, 8, 10]
```

- Built-in alternatives: `list.sort()` sorts in place; `list.reverse()` reverses in place.

```
lst = [5, 3, 1, 2, 4]
lst.reverse()
print(lst)   # [4, 2, 1, 3, 5]
```

## Operations on Lists

> **Key line:** A list's name is the name of a **memory location**. `list_2 = list_1` copies the **name**, not the contents, so both refer to the **same list**.

```
list_1 = [1]
list_2 = list_1
list_1[0] = 2
print(list_2)    # [2]
```

### Slices

**Slice:** makes a **brand new copy** of a list or part of it.

```
my_list[start:end]
```

- Takes elements from index `start` to **`end - 1`**. `end` is the first index **not** included.
- Omitting `start` means 0; omitting `end` means `len(my_list)`; `[:]` copies the whole list.
- Negative indices work. If `start` lies beyond `end`, the slice is **empty**.

```
list_1 = [1]
list_2 = list_1[:]
list_1[0] = 2
print(list_2)              # [1]

my_list = [10, 8, 6, 4, 2]
print(my_list[1:3])        # [8, 6]
print(my_list[1:-1])       # [8, 6, 4]
print(my_list[-1:1])       # []
print(my_list[:3])         # [10, 8, 6]
print(my_list[3:])         # [4, 2]
```

### del with slices

```
my_list = [10, 8, 6, 4, 2]
del my_list[1:3]
print(my_list)    # [10, 4, 2]

del my_list[:]
print(my_list)    # [] (the contents are deleted)

del my_list       # deletes the list itself; printing it now is an error
```

### in and not in

- `elem in my_list`: `True` if the element is in the list.
- `elem not in my_list`: `True` if it's absent.

```
my_list = [0, 3, 12, 8, 2]
print(5 in my_list)        # False
print(5 not in my_list)    # True
print(12 in my_list)       # True
```

**Lab:** remove repeated numbers by appending each number to a new list only if it's `not in` that list yet.

## Lists in Advanced Applications

### List comprehensions

**List comprehension:** a list **created on the fly** during execution.

```
[expression for element in list if conditional]
```

```
row = [WHITE_PAWN for i in range(8)]
squares = [x ** 2 for x in range(10)]           # 0, 1, 4, 9, ... 81
twos = [2 ** i for i in range(8)]               # 1, 2, 4, ... 128
odds = [x for x in squares if x % 2 != 0]       # odd squares only
cubed = [num ** 3 for num in range(5)]          # [0, 1, 8, 27, 64]
```

### Multidimensional arrays

- **Two-dimensional array (matrix):** a list of lists, e.g. a chessboard: 8 rows of 8 fields.
- Access needs two indices: **row first, then column**.

```
board = [[EMPTY for i in range(8)] for j in range(8)]
board[0][0] = ROOK
board[4][2] = KNIGHT    # C4
board[3][4] = PAWN      # E5
```

- Comprehensions can be nested: the inner one builds a row, the outer one builds the list of rows.
- When iterating a matrix with `for day in temps:`, each `day` is a **list** (a row), not a scalar.

```
temps = [[0.0 for h in range(24)] for d in range(31)]   # 31 days x 24 hours

highest = -100.0
for day in temps:
    for temp in day:
        if temp > highest:
            highest = temp
```

- **Three-dimensional arrays** add another index. Python doesn't limit the depth.

```
rooms = [[[False for r in range(20)] for f in range(15)] for t in range(3)]
rooms[1][9][13] = True    # building 2, floor 10, room 14
```

# Module 4: Functions, Tuples, Dictionaries, Exceptions, and Data Processing

## Why Functions?

When to write your own function:

1. A fragment of code **appears in more than one place**: isolate it in a function.
2. A piece of code is **too large to read and understand** easily: divide it into smaller problems, each as a separate function.
3. The work is **divided among several programmers**: decompose the problem into separately written functions packed into **modules**.

- **Decomposition:** dividing code (the problem) into well-isolated pieces, each encoded as a function. A well-written function should be viewable in one glance. Too many comments make code larger and harder to read.
- In a team, decomposition shares both the **work** and the **responsibility**.

Where functions come from:

- **Built-in functions:** an integral part of Python (e.g. `print()`), always available.
- **Pre-installed modules:** installed with Python; need extra steps to use.
- **User-defined functions:** written directly in your code.
- **lambda** functions (connected with classes and covered in PE2).

## Defining and Invoking Functions

```
def function_name():
    function_body
```

- Starts with the keyword **`def`** (define), then the function name (same naming rules as variables), parentheses, and a **colon**.
- The **body** is the indented block; the function **ends where the nesting ends**.
- Python reads and remembers definitions but **only runs a function when it's invoked**.

```
def message():
    print("Enter a value: ")

print("We start here.")
message()
print("We end here.")
```

How an invocation works: Python remembers where it was, **jumps** into the function, **executes** the body, and **returns** to the point right after the invocation.

Two catches:

- **You can't invoke a function that isn't known yet.** Python reads top to bottom; calling `message()` before its `def` gives **NameError: name 'message' is not defined**.
- **A function and a variable can't share a name.** `message = 1` after defining `message()` makes the function unavailable.

Functions can be defined anywhere in the file, mixed with other code, as long as they're defined before they're called.

## Parameters and Arguments

- **Parameters** live **inside** functions. They're defined in the parentheses of the `def` statement and get their values at invocation.
- **Arguments** exist **outside** functions and carry the values passed to parameters.
- You must provide **as many arguments as there are parameters** (unless defaults are set). Too few gives **TypeError: message() missing 1 required positional argument: 'number'**.

```
def message(what, number):
    print("Enter", what, "number", number)

message("telephone", 11)    # Enter telephone number 11
message("price", 5)         # Enter price number 5
```

**Shadowing:** a parameter with the same name as an outside variable hides that variable, but **only inside the function**.

```
def message(number):
    print("Enter a number:", number)

number = 1234
message(1)       # Enter a number: 1
print(number)    # 1234
```

### Ways of passing arguments

| Technique | How it works |
|---|---|
| **Positional** | The i-th argument goes to the i-th parameter. Order matters. |
| **Keyword** | `name=value`; the parameter name decides. Order doesn't matter. Using a non-existent name raises **TypeError: ... got an unexpected keyword argument**. |
| **Mixed** | Allowed, but **positional arguments must come before keyword arguments**. |

```
def adding(a, b, c):
    print(a, "+", b, "+", c, "=", a + b + c)

adding(1, 2, 3)            # 1 + 2 + 3 = 6
adding(c = 1, a = 2, b = 3)  # 2 + 3 + 1 = 6
adding(3, c = 1, b = 2)    # 3 + 2 + 1 = 6
adding(3, a = 1, b = 2)    # TypeError: adding() got multiple values for argument 'a'
```

- A keyword argument before a positional one (`subtra(a=5, 2)`) is a **SyntaxError**.

### Default parameter values

```
def introduction(first_name="John", last_name="Smith"):
    print("Hello, my name is", first_name, last_name)

introduction()                     # Hello, my name is John Smith
introduction("Henry")              # Hello, my name is Henry Smith
introduction(last_name="Hopkins")  # Hello, my name is John Hopkins
```

An omitted argument takes the parameter's **default (predefined) value**.

## Returning Results

The **`return`** instruction (a keyword) has two variants:

- **`return` without an expression:** immediately **terminates** the function.
- **`return expression`:** terminates the function **and returns the expression's value** as the function's result.

```
def happy_new_year(wishes = True):
    print("Three...")
    print("Two...")
    print("One...")
    if not wishes:
        return
    print("Happy New Year!")

def boring_function():
    return 123

x = boring_function()   # x is 123
```

- You may **ignore** a function's result; it's simply lost.
- A function meant to return a useful value must use `return expression`.

```
def wishes():
    print("My Wishes")
    return "Happy Birthday"

wishes()           # prints only: My Wishes
print(wishes())    # prints: My Wishes, then Happy Birthday
```

### None

- **`None`** (a keyword) is not a real value, so it **can't be used in expressions**: `print(None + 2)` raises **TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'**.
- It's safe only when **assigned to a variable** (or returned) and when **compared** with a variable (`if value is None:`).
- A function with no `return expression` **implicitly returns `None`**.

```
def strange_function(n):
    if(n % 2 == 0):
        return True

print(strange_function(2))   # True
print(strange_function(1))   # None
```

### Lists with functions

- A list can be an **argument**. Passing an int where a list is expected (`list_sum(5)`) raises **TypeError: 'int' object is not iterable**.
- A list can be a **result**.

```
def strange_list_fun(n):
    strange_list = []
    for i in range(0, n):
        strange_list.insert(0, i)
    return strange_list

print(strange_list_fun(5))   # [4, 3, 2, 1, 0]
```

**Labs:** `is_year_leap(year)`, `days_in_month(year, month)` (returns `None` for invalid input; uses a list of month lengths), `day_of_year(year, month, day)`, `is_prime(num)` (check divisors from 2 up to the square root), and fuel-consumption converters (1 mile = 1609.344 m, 1 gallon = 3.785411784 l).

## Scopes

**Scope of a name:** the part of the code where the name is recognizable.

- A function's **parameters and local variables** exist only inside it. Using them outside gives **NameError**.
- A variable from **outside** a function is visible **inside** it, **except** when the function defines a variable of the same name.
- Reading an outside variable works; **assigning** to it inside the function creates the function's own variable instead.

```
def my_function():
    var = 2
    print("Do I know that variable?", var)

var = 1
my_function()   # Do I know that variable? 2
print(var)      # 1
```

### global

`global name` (or `global name1, name2`) inside a function makes Python use the outside variable instead of creating a new one, for reading **and** assigning.

```
def my_function():
    global var
    var = 2
    print("Do I know that variable?", var)

var = 1
my_function()   # Do I know that variable? 2
print(var)      # 2
```

### How functions treat arguments

- A function receives the argument's **value**. Changing a scalar parameter **doesn't affect** the argument outside.
- For a **list**, assigning a new list to the parameter doesn't affect the original, but **changing the list itself** (e.g. `del my_list_1[0]`) **does**, because both names point to the same list.

```
def my_function(my_list_1):
    del my_list_1[0]

my_list_2 = [2, 3]
my_function(my_list_2)
print(my_list_2)   # [3]
```

## Sample Functions

- A **backslash** at the end of a line continues the code on the next line.
- `in` is a keyword, so a parameter can't be named `in` (the course uses `inch`).

```
def bmi(weight, height):
    if height < 1.0 or height > 2.5 or \
    weight < 20 or weight > 200:
        return None
    return weight / height ** 2

def lb_to_kg(lb):
    return lb * 0.45359237

def ft_and_inch_to_m(ft, inch = 0.0):
    return ft * 0.3048 + inch * 0.0254

def is_a_triangle(a, b, c):
    return a + b > c and b + c > a and c + a > b

def heron(a, b, c):
    p = (a + b + c) / 2
    return (p * (p - a) * (p - b) * (p - c)) ** 0.5
```

- A triangle exists only if **the sum of any two sides is longer than the third**.
- Right-angle test: the **hypotenuse is the longest side**, and c² = a² + b² (Pythagorean theorem).
- **Heron's formula** gives a triangle's area. `area_of_triangle(1., 1., 2. ** .5)` gives `0.49999999999999983`, not 0.5, because of **floating-point** specifics.

### Factorial and Fibonacci

- **Factorial:** 0! = 1, 1! = 1, n! = 1 × 2 × ... × n.
- **Fibonacci:** Fib1 = 1, Fib2 = 1, Fibi = Fibi-1 + Fibi-2 (1, 1, 2, 3, 5, 8, 13, 21, 34...).

```
def factorial_function(n):
    if n < 0:
        return None
    if n < 2:
        return 1
    product = 1
    for i in range(2, n + 1):
        product *= i
    return product

def fib(n):
    if n < 1:
        return None
    if n < 3:
        return 1
    elem_1 = elem_2 = 1
    the_sum = 0
    for i in range(3, n + 1):
        the_sum = elem_1 + elem_2
        elem_1, elem_2 = elem_2, the_sum
    return the_sum
```

### Recursion

**Recursion:** a function **invoking itself**. A recursive function needs a **base case** (termination condition), or it never stops.

```
def fib(n):
    if n < 1:
        return None
    if n < 3:
        return 1
    return fib(n - 1) + fib(n - 2)

def factorial_function(n):
    if n < 0:
        return None
    if n < 2:
        return 1
    return n * factorial_function(n - 1)    # n! = (n-1)! × n
```

- Recursion gives clean, elegant code, but it's easy to make a function that never terminates, and **recursive calls consume a lot of memory**.

## Tuples and Dictionaries

- **Sequence type:** data that can store several values (or none) and be **browsed element by element**; anything the `for` loop can scan. The list is one.
- **Mutability:** whether data can be changed during execution.
  - **Mutable:** can be updated **in situ** ("in position"), e.g. `list.append(1)`.
  - **Immutable:** can't be changed in situ.

### Tuples

**Tuple:** an **immutable** sequence type; an ordered, unchangeable collection. Like a list that can't be modified.

```
tuple_1 = (1, 2, 4, 8)
tuple_2 = 1., .5, .25, .125     # commas alone also make a tuple
empty_tuple = ()
one_element_tuple_1 = (1, )      # the comma is required
one_element_tuple_2 = 1.,
```

- Without the comma, `(1)` is just an int, not a tuple.
- Elements can be of **different types**, including lists and other tuples, and can be variables or expressions.
- Indexing, negative indices, slices, and `for` loops work as with lists.
- **Modifying** a tuple fails: `append()` raises **AttributeError: 'tuple' object has no attribute 'append'**; assigning an element raises **TypeError**. `del` can delete the **whole** tuple.
- `len()`, `+` (join), `*` (multiply), `in` and `not in` all work.

```
my_tuple = (1, 10, 100)
t1 = my_tuple + (1000, 10000)
t2 = my_tuple * 3
print(len(t2))            # 9
print(t1)                 # (1, 10, 100, 1000, 10000)
print(t2)                 # (1, 10, 100, 1, 10, 100, 1, 10, 100)
print(10 in my_tuple)     # True
print(-10 not in my_tuple) # True
```

- Tuples can appear on the **left side of an assignment**: `t1, t2, t3 = t2, t3, t1`.
- `tuple(iterable)` converts to a tuple; `list(iterable)` converts to a list.

### Dictionaries

**Dictionary:** a **mutable** collection of **key-value** pairs. It's **not a sequence type**.

```
dictionary = {"cat": "chat", "dog": "chien", "horse": "cheval"}
phone_numbers = {'boss': 5551234567, 'Suzy': 22657854310}
empty_dictionary = {}
```

- Pairs go in **curly braces**, separated by **commas**; keys and values are separated by **colons**.
- Each **key must be unique**.
- A key can be **any immutable type** (number or string, but **not a list**).
- **Keys are case-sensitive**: `'Suzy'` differs from `'suzy'`.
- A dictionary is a **one-way tool**: you look up values by key, not keys by value.
- `len()` returns the number of pairs.
- Since **Python 3.6**, dictionaries are **ordered** by default; before that, order wasn't guaranteed.
- **Hanging indent:** spreading a long dictionary over vertically aligned lines.

| Operation | Code |
|---|---|
| Get a value | `dictionary['cat']` or `dictionary.get('cat')`. A non-existent key in brackets is an **error**. |
| Check a key | `if word in dictionary:` |
| Change a value | `dictionary['cat'] = 'minou'` |
| Add a pair | `dictionary['swan'] = 'cygne'` (assigning to a new key; lists don't allow this) |
| Add with a method | `dictionary.update({"duck": "canard"})` |
| Remove a pair | `del dictionary['dog']`. Removing a non-existent key is an error. Values can't exist without keys. |
| Remove the last item | `dictionary.popitem()` (random item before Python 3.6.7) |
| Remove all items | `dictionary.clear()` |
| Copy | `dictionary.copy()` |

| Method | Returns |
|---|---|
| `keys()` | An iterable of all keys. |
| `values()` | An iterable of all values. |
| `items()` | **Tuples**, each a key-value pair. |

```
for key in sorted(dictionary.keys()):
    print(key, "->", dictionary[key])

for english, french in dictionary.items():
    print(english, "->", french)
```

### Tuples and dictionaries together

Example: a dictionary keyed by student name, with each value a **tuple of scores**. A new score is added with `school_class[name] += (score,)`; a new student gets `school_class[name] = (score,)`. Averages are computed by iterating over each tuple.

## Exceptions

Two sides of errors:

- **Errors in data:** correct code fed bad data (e.g. letters instead of a number).
- **Errors in code (bugs):** mistakes made while writing. Removing them is **debugging**.

```
value = int(input('Enter a natural number: '))
print('The reciprocal of', value, 'is', 1/value)
```

Entering letters or nothing gives **ValueError: invalid literal for int() with base 10: ''**. The first word on the last line of a traceback is the **exception** name.

- `type(value) is int` checks a value's type, but Python **doesn't recommend preliminary validation**.

> **Key line:** Python's rule: *"It's better to beg for forgiveness than to ask for permission"*, i.e. handle an error when it happens rather than trying to avoid it.

### try and except

```
try:
    value = int(input('Enter a natural number: '))
    print('The reciprocal of', value, 'is', 1/value)
except ValueError:
    print('I do not know what to do.')
except ZeroDivisionError:
    print('Division by zero is not allowed in our Universe.')
except:
    print('Something strange has happened here... Sorry!')
```

- **`try`:** the risky code. An error here **doesn't terminate** the program; control jumps to the matching `except`, and the rest of `try` is skipped.
- **`except`:** handles the exception. It's reached only when an exception happens in `try`.
- After either block finishes, execution continues normally.
- An error is called an **exception**; its occurrence is **raising** it.
- Any number of named `except` branches is allowed, but **each exception can be named only once**. Only **one** branch runs.
- The unnamed (**anonymous/default**) `except` handles anything else and **must be last**.
- Several exceptions can share a branch: `except (ValueError, ZeroDivisionError):`.

### Common exceptions

| Exception | Raised when |
|---|---|
| **ZeroDivisionError** | Dividing by zero with `/`, `//`, or `%`. |
| **ValueError** | A function gets an argument of the right type but an unacceptable value (e.g. `int("abc")`). |
| **TypeError** | Data of an unacceptable type, e.g. a float as a list index: `short_list[0.5]`. |
| **AttributeError** | Calling a method that doesn't exist, e.g. `short_list.depend(3)`. |
| **SyntaxError** | A line violates Python's grammar. Don't handle it; fix the code. |
| **KeyboardInterrupt** | The user presses the interrupt key (Ctrl-C). |

- **Syntax errors (parsing errors)** happen when a statement is incorrect: `print("Hello, World!)` gives **SyntaxError: EOL while scanning string literal**, with an arrow at the problem.
- **Exceptions** happen even when code is syntactically correct, during execution: `print(1/0)` gives **ZeroDivisionError: division by zero**.

## Testing and Debugging

- Testing can only prove that code **contains** errors, not that it's error-free.
- Authors can't objectively verify their own work, so programmers need **testers**. Testers are a developer's best friends.
- Test **all execution paths**. For an if-elif-else on temperature, test a positive value, a negative value, and zero.
- Because Python is **interpreted**, it may never check lines that don't run. A typo like `prin("Below zero")` goes unnoticed unless that branch executes.

### Debugging

- **Debugger:** software that controls execution: run line by line, inspect and change variables, stop on conditions. IDLE has one (the **Debug** menu). It also shows the **call stack**.
- **Interactive debugging:** debugging that needs the developer's interaction (with a debugger).
- **Print debugging:** inserting extra `print()` calls to show the path and variable values. Remove or comment them out afterward.

Tips:

1. **Tell someone** what the code should do and what it does (or use a rubber duck: **Rubber Duck Debugging**).
2. **Isolate the problem**: run the suspect part separately, comment out code, use fixed values, test functions with predictable arguments.
3. If the bug is new, **analyze recent changes**.
4. **Take a break**.
5. **Be optimistic**.

### Unit testing

**Unit testing:** tests are an inseparable part of the code, and preparing test data is part of coding. Every change should be followed by running all the unit tests. Python's dedicated module is **`unittest`**.
