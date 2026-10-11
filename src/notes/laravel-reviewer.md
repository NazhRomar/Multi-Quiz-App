# Laravel Reviewer: ITELEC 3, Modules 1 to 5

# Module 1: Introduction to Laravel

What Laravel is, why developers choose it, how to set up a project, the MVC pattern, and how a Laravel application is organized on disk.

## What is Laravel?

Laravel is an **open-source PHP web application framework**, created by **Taylor Otwell in 2011**. It follows the **Model-View-Controller (MVC)** architectural pattern and aims to make web development easier and more elegant.

- **Creator:** Taylor Otwell
- **Year:** 2011
- **Pattern:** MVC
- **Language:** PHP

## Why Laravel? (Key Features)

Writing every feature of a custom PHP app from scratch takes time, and a framework like Laravel saves that time. Because Laravel has such an extensive feature set, it's best suited for **big projects** rather than small, simple ones.

- **Built-in Modules:** ready-made packages let you add features without writing everything from scratch.
- **Route Handling:** simple route names (instead of long paths) that can all be changed from one dedicated file.
- **Security Features:** user authentication, role authorization, email verification, password hashing, and more.
- **Database Migrations:** version-controlled, so schema changes are easy to manage.
- **Template Engine (Blade):** lightweight, easy-to-maintain templates.
- **Eloquent ORM:** write database queries using PHP syntax instead of raw SQL.

> **Exam tip:** "Eloquent" = ORM (PHP syntax for DB queries). "Blade" = templating engine. "Artisan" = CLI tool. Don't mix these three up.

## Key Features of Laravel (Summary)

- Clean, elegant syntax
- Built-in authentication and authorization
- Eloquent ORM for database handling
- Blade templating engine
- Artisan CLI for automation
- Routing, Middleware, Caching, and more

## Setting Up a Development Environment

Prerequisites to start:

- PHP `>= 8.1`
- Composer
- MySQL or any supported database
- Web server (Apache/Nginx) or Laravel Sail (Docker)
- An IDE (e.g., VS Code, PHPStorm)
- Node.js (to compile frontend assets)

## Composer

**Composer** is a tool that's at the foundation of most modern PHP development. It's used to install Laravel, update Laravel, and bring in external dependencies (packages).

## Creating a New Laravel Project

**Option A: using Composer's `create-project`:**

```bash
composer create-project laravel/laravel projectName
```

This creates a new subdirectory named `{projectName}`.

**Option B: using the Laravel Installer Tool.** First install the tool globally with Composer, then use it to spin up a project.

```bash
composer global require "laravel/installer"
laravel new projectName
```

This also creates a new subdirectory named `{projectName}` containing a bare Laravel project.

## MVC (Model-View-Controller)

An MVC-based framework divides an application into three components:

| Component | Role |
|---|---|
| Model | Interacts with the database. |
| View | The user interface: everything a user can see on screen. |
| Controller | Connects the Model and View; holds the business logic. Known as the *"heart of the application"* in MVC. |

**Advantages of using the MVC framework:**

- Organizing large-scale web application projects.
- Easier to perform modification: changes in one part won't affect other parts of the code.
- Helps produce a faster development process.
- Helps enable asynchronous method invocation.

## Laravel Folder Structure

Laravel's default structure is a great starting point for both large and small apps, but it imposes almost no restrictions on where classes live, as long as Composer can autoload them.

| Folder | Contains |
|---|---|
| `app/` | The core code of your application. Almost all of your application's classes live here. |
| `config/` | All of your application's configuration files. |
| `database/` | Database migrations, model factories, and seeders. |
| `public/` | Contains `index.php`, the entry point for every request; also houses images, JS, and CSS assets. |
| `resources/` | Your views plus raw, un-compiled assets such as CSS or JavaScript. |
| `routes/` | All route definitions. Ships with `web.php` and `console.php` by default. |
| `storage/` | Logs, compiled Blade templates, file-based sessions, file caches, and other generated files. |
| `tests/` | Automated tests: Pest or PHPUnit unit and feature tests are included out of the box. |
| `vendor/` | Your Composer dependencies. |

# Module 2: Laravel Routes

Routing, HTTP verbs, named routes, route parameters, constraints, fallback routes, and route caching.

## What is Routing?

Routing is the process of directing an incoming request to a specific controller method. In Laravel, routes define the URLs your application can respond to and how they are handled: they let you handle HTTP requests and send appropriate responses. Routes are fundamental to web applications, since they ensure proper navigation and handling of user requests.

## Basic Routing

Routes are defined in `routes/web.php` for web routes and `routes/api.php` for API routes.

```php
Route::get('/welcome', function () {
    return view('welcome');
});
```

- `Route::get`: defines a route that responds to a GET request.
- `/welcome`: the URL path.
- `function()`: a closure that returns a response.

## The HTTP Verbs

HTTP verbs (methods) indicate the desired action to perform on a given resource.

| Verb | Purpose |
|---|---|
| GET | Request a resource (or list of resources) / retrieve data. |
| POST | Create a resource or submit data. |
| PUT | Overwrite a resource or update data. |
| PATCH | Modify a resource or partially update data. |
| DELETE | Delete a resource. |

## Named Routes

Named routes let you generate URLs or redirects for a specific route easily.

```php
Route::get('/profile', [UserController::class, 'show'])->name('profile');

$url = route('profile');
```

## Route Parameters

Define dynamic routes using parameters wrapped in curly braces:

```php
Route::get('/user/{id}', function ($id) {
    return 'User '.$id;
});
```

**Optional parameters** use a `?` and a default value in the closure:

```php
Route::get('/user/{name?}', function ($name = 'Guest') {
    return 'User '.$name;
});
```

## Regular Expression Constraints

You may constrain the format of a route parameter using the `where()` method. It accepts the parameter name and a regular expression.

```php
Route::get('/user/{id}', function ($id) {
    return 'User ID: ' . $id;
})->where('id', '[0-9]+');

// /user/123 → valid
// /user/abc → invalid, 404 error
```

```php
Route::get('/post/{slug}', function ($slug) {
    return 'Post Slug: ' . $slug;
})->where('slug', '[a-zA-Z0-9\-]+');

// /post/my-first-post  → valid
// /post/my_first_post → invalid, 404 error
```

## Fallback Route

Place this route at the **end** of your route definitions so it catches any request not handled by previous routes.

```php
Route::fallback(function () {
    return response()->view('errors.404', [], 404);
});
```

## Route Caching and Best Practices

Caching routes improves performance: faster application load time in production.

```bash
php artisan route:cache   # cache the routes
php artisan route:clear   # clear the route cache
```

**Best practices:**

- **Consistency:** use consistent naming conventions for routes.
- **Route Organization:** group related routes and use route names effectively.
- **Security:** always validate input in routes to prevent security vulnerabilities.

# Module 3: Views and Controllers

Blade templating (directives, data display, forms) and controllers (creating, writing, and wiring RESTful actions).

## Views

Views separate your controller/application logic from your presentation logic. They live in the `resources/views` directory and are usually written using the **Blade** templating language.

## Creating and Rendering Views

Blade view files use the `.blade.php` extension and live in `resources/views`.

```bash
php artisan make:view greeting
```

The `.blade.php` extension tells the framework the file contains a Blade template. Blade templates hold HTML plus Blade directives that let you echo values, create "if" statements, iterate over data, and more.

Return a view from a route or controller with the `view()` helper:

```php
Route::get('/', function () {
   return view('greeting', ['name' => 'James']);
});
```

## Blade Templates

Blade is the simple, yet powerful templating engine included with Laravel. Unlike some PHP templating engines, Blade does **not** restrict you from using plain PHP in your templates. Blade templates are compiled into plain PHP and cached until modified, so Blade adds essentially zero overhead.

**Raw PHP:** embed plain PHP with `@php` / `@endphp`:

```blade
@php
   $counter = 1;
@endphp
```

## Displaying Data

Wrap a variable in curly braces to display data passed to a view:

```php
Route::get('/', function () {
   return view('welcome', ['name' => 'Samantha']);
});
```

```blade
Hello, {{ $name }}.
```

You aren't limited to variables. You can echo the result of any PHP function inside a Blade echo statement:

```blade
The current UNIX timestamp is {{ time() }}.
```

## Control Structures

**If statements:** `@if`, `@elseif`, `@else`, `@endif`:

```blade
@if (count($records) === 1)
   I have one record!
@elseif (count($records) > 1)
   I have multiple records!
@else
   I don't have any records!
@endif
```

**Switch statements:** `@switch`, `@case`, `@break`, `@default`, `@endswitch`:

```blade
@switch($i)
   @case(1)
       First case...
       @break
   @case(2)
       Second case...
       @break
   @default
       Default case...
@endswitch
```

**Loops:** `@foreach` / `@endforeach`:

```blade
@foreach($users as $user)
    <li>{{ $user->name }}</li>
@endforeach
```

## Comments, CSRF and Method Fields

**Comments:** Blade comments are never included in the rendered HTML:

```blade
{{-- This comment will not be present in the rendered HTML --}}
```

**CSRF Field:** every HTML form should include a hidden CSRF token so the CSRF protection middleware can validate the request. Use `@csrf`:

```blade
<form method="POST" action="/profile">
   @csrf
   ...
</form>
```

**Method Field:** HTML forms can't natively send PUT, PATCH, or DELETE, so use `@method` to spoof the verb:

```blade
<form action="/foo/bar" method="POST">
   @method('PUT')
   ...
</form>
```

## Laravel Controllers

Instead of defining all request-handling logic as closures in route files, you can organize that behavior using **controller** classes. Controllers group related request-handling logic into a single class. For example, a `UserController` might handle showing, creating, updating, and deleting users. By default, controllers live in `app/Http/Controllers`.

**Writing controllers:** generate one with the Artisan command:

```bash
php artisan make:controller UserController
```

```php
<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
   // Show the profile for a given user.
   public function show(string $id): View
   {
       return view('user.profile', [
           'user' => User::findOrFail($id)
       ]);
   }
}
```

Wire a route to that controller method:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

## RESTful Controller Methods

A common convention is a set of standard "resource" methods on a controller:

| Method | Purpose |
|---|---|
| `index()` | Display a listing of all users. `User::all()` |
| `create()` | Show the form for creating a new user. |
| `store(Request $request)` | Validate input and save a newly created user. |
| `show($id)` | Display the specified user. |
| `edit($id)` | Show the form for editing the specified user. |
| `update(Request $request, $id)` | Validate input and update the specified user. |
| `destroy($id)` | Remove the specified user from storage. |

```php
public function store(Request $request)
{
    $validatedData = $request->validate([
        'name'  => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
    ]);
    User::create($validatedData);
    return redirect()->route('users.index')->with('success', 'User created successfully.');
}

public function destroy($id)
{
    $user = User::findOrFail($id);
    $user->delete();
    return redirect()->route('users.index')->with('success', 'User deleted successfully.');
}
```

> **Exam tip:** `findOrFail($id)` fetches a model or automatically aborts with a 404 if it isn't found. It shows up in `show`, `edit`, and `update`.

# Module 4: Model and Migration

Version-control your database with migrations, then connect each table to an Eloquent model.

## Migrations

**Migrations are version control for your database.** They let your team define and share the application's database schema as code. Without them, you would have to tell a teammate to manually add a column to their local database after they pull your changes. Migrations solve exactly that problem.

A migration is a PHP file in `database/migrations/` that describes a change to the schema (create a table, add a column, drop an index) in a structured, organized way.

## Benefits of Using Migrations

| Benefit | What it means |
|---|---|
| **Consistency** | Every developer on the team gets the same database schema, so there are no differences between development, staging and production databases. |
| **Collaboration** | Team members can add, modify or delete tables and columns without conflicting changes, since migrations keep a history of schema changes. Features can be added incrementally. |
| **Rollback capabilities** | If a migration causes a problem, you can revert the database to its previous state with a rollback command, which keeps things stable. |

## Setting Up the Database (XAMPP and MySQL Workbench)

**Step 1: Install the tools.** [XAMPP](https://www.apachefriends.org/) (gives you the MySQL server, plus Apache) and [MySQL Workbench](https://downloads.mysql.com/archives/workbench/) (a visual client for managing the database).

**Step 2: Create a MySQL connection and a database.** Start the *MySQL* module in the XAMPP Control Panel, open Workbench, create a connection to `127.0.0.1:3306` (user `root`, empty password by default in XAMPP), then create a new schema/database. Or run this SQL:

```sql
CREATE DATABASE laravel_db;
```

**Step 3: Point Laravel to it in `.env`:**

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=root
DB_PASSWORD=
```

> Laravel 11+ uses **SQLite** by default (`DB_CONNECTION=sqlite`). To use MySQL you must change it to `mysql` and fill in the other `DB_*` values. After editing `.env`, run `php artisan config:clear` if the old settings seem stuck.

## Creating a Migration

**Step 4: Generate the migration file.** Creating a product table looks like this:

```bash
php artisan make:migration create_product_table
```

The file is created in `database/migrations/` with a timestamp at the start of its name (for example `2026_09_24_060755_create_product_table.php`), so migrations run in the order they were created.

> The convention is a **plural** table name, so `create_products_table` is preferred over `create_product_table`. When the name starts with `create_` and ends with `_table`, Laravel fills in `Schema::create()` for you. You can also force it with `--create=products`, or modify an existing table with `--table=products`.

```bash
php artisan make:migration create_products_table
php artisan make:migration add_price_to_products_table --table=products   # alter an existing table
```

## Migration File Structure

A migration class has two key methods:

| Method | Purpose |
|---|---|
| `up()` | Contains the code that defines the changes applied when the migration runs: creating tables, adding columns or creating indexes. |
| `down()` | Contains the code that **reverses** what `up()` did. It is essential for keeping the database intact during rollbacks. |

```php
public function up(): void
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->text('description')->nullable();
        $table->float('price', 8, 2);
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('products');
}
```

## Common Column Data Types

| Method | Creates |
|---|---|
| `$table->id();` | An auto-incrementing primary key (big integer). |
| `$table->string('name');` | A VARCHAR column with a default length of 255 characters. |
| `$table->text('description');` | A TEXT column for longer text. |
| `$table->integer('age');` | An integer column. |
| `$table->boolean('is_active');` | A BOOLEAN column (true/false). |
| `$table->date('birth_date');` | A DATE column. |
| `$table->timestamp('created_at');` | A TIMESTAMP column. |
| `$table->float('price', 8, 2);` | A floating-point column with 8 digits total and 2 decimal places. |
| `$table->json('preferences');` | A JSON column. |
| `$table->timestamps();` | *Also useful:* adds the nullable `created_at` and `updated_at` columns. |

## Column Modifiers

Modifiers customize how a column behaves. They are chained onto the column definition.

| Modifier | What it does |
|---|---|
| `->primary()` | Sets the column as the primary key of the table. |
| `->nullable()` | Allows NULL values, so the column is not required when inserting data. |
| `->default()` | Sets a default value if none is provided. |
| `->unique()` | Makes sure all values in the column are unique (e.g. email, username). |
| `->unsigned()` | Allows only positive numbers. |
| `->foreignId()` | Creates a foreign key column that connects one table to another. |

```php
$table->string('email')->unique();
$table->string('middle_name')->nullable();
$table->boolean('is_active')->default(true);
$table->foreignId('user_id')->constrained('users');   // user_id -> users.id
```

## Running and Rolling Back Migrations

| Command | What it does |
|---|---|
| `php artisan migrate` | Runs all pending migrations and creates/updates the database tables. |
| `php artisan migrate:rollback` | Rolls back the **last batch** of migrations. Add `--database=name` to use a specific connection. |
| `php artisan migrate:reset` | Rolls back **all** migrations, not just the last batch. |
| `php artisan migrate:refresh` | Rolls back all migrations, then re-runs them. |
| `php artisan migrate:fresh` | *Also useful:* drops all tables, then re-runs every migration (faster than refresh, since it skips `down()`). |
| `php artisan migrate:status` | *Also useful:* shows which migrations have run. |

## Model

A **model** represents the structure of your data and gives you an interface for working with the database. Each model typically corresponds to **one table**, where you can query and manipulate data. In Laravel, models use **Eloquent ORM** (Object-Relational Mapping).

```bash
php artisan make:model YourModelName
php artisan make:model Product -m   # model + migration in one command
```

The model file is created in `app/Models/`.

## Migration and Model Naming Rules

|  | Convention | Example |
|---|---|---|
| **Model name** | Singular, PascalCase | Product, Student, Course, Enrollment |
| **Table name** | Plural, snake_case | products, students, courses, enrollments |

> Laravel connects a model to its table automatically from the name: model `Product` → table `products`. When you break this convention, you must tell the model with `$table`.

## Model Properties

| Property | Purpose |
|---|---|
| `$table` | Specifies the database table connected to the model. Used when the table name does not follow Laravel's default naming. Example: `protected $table = 'student_records';` |
| `$fillable` | Lists the columns that can be inserted or updated (mass assignment). Helps protect the application from unwanted data changes. Example: `protected $fillable = ['name', 'email'];` |

```php
class Student extends Model
{
    protected $table = 'student_records';
    protected $fillable = ['name', 'email'];
}
```

## Using a Model (Eloquent Basics)

Once the table is migrated and the model exists, you can query it without writing SQL:

```php
use App\Models\Student;

Student::all();                                    // get every row
Student::find(1);                                  // get one row by id
Student::create(['name' => 'Ana', 'email' => 'ana@example.com']);   // needs $fillable
Student::where('name', 'Ana')->first();            // filter
$student->delete();                                // remove a row
```

> `create()` only saves the fields listed in `$fillable`. Anything else throws a mass-assignment error.

## Module 4 File Directories and Setup Commands

Where the files for this module live, and the commands that create them.

### .env

Holds your database connection settings (`DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`). Never commit it.

```bash
cp .env.example .env
php artisan key:generate
php artisan config:clear
```

### config/database.php

Defines the available database connections and reads its values from `.env`. You rarely edit it directly.

*Comes with Laravel. No `make:` command.*

### database/migrations/

Your migration files, one per schema change, with timestamps in their names.

```bash
php artisan make:migration create_products_table
php artisan migrate
php artisan migrate:rollback
```

### app/Models/

Your Eloquent models (singular, PascalCase). Each one maps to a table.

```bash
php artisan make:model Product
php artisan make:model Product -m   # + migration
php artisan make:model Product -mfs # + migration, factory, seeder
```

### database/factories/ and database/seeders/

Optional. Factories generate fake rows and seeders insert them into the new table.

```bash
php artisan make:factory ProductFactory --model=Product
php artisan make:seeder ProductSeeder
php artisan db:seed
```

### Full setup in order

```bash
composer create-project laravel/laravel projectName
cd projectName
# start MySQL in XAMPP, create the database in Workbench, edit .env
php artisan make:model Product -m
# fill in up() in database/migrations/..._create_products_table.php
php artisan migrate
php artisan serve
```

# Module 5: Validation

Check user input against rules before it reaches your database, and show helpful errors.

## Laravel Validation

**Validation** is the process of checking that the input data provided by users follows specific rules *before* saving it to the database or processing it further. Laravel offers a robust and flexible validation system that helps maintain data integrity and security.

Laravel provides several approaches to validating incoming data. The most common is the `validate` method available on all incoming HTTP requests.

## Benefits of Laravel Validation

- Prevents invalid data from being processed or saved in the database.
- Simplifies validation logic with built-in and customizable rules.
- Improves the user experience with detailed, specific error messages.
- Keeps code organized by separating validation concerns from business logic.

## The validate() Method

Use the `validate` method provided by the `Illuminate\Http\Request` object. If the rules pass, your code keeps executing normally. If validation fails, an `Illuminate\Validation\ValidationException` is thrown and the proper error response is sent back to the user automatically.

```php
$request->validate([
    'name'     => 'required|string|max:255',
    'email'    => 'required|email|unique:users',
    'password' => 'required|min:8|confirmed',
]);
```

## Validation in a Controller (store method)

Here is the `validate` method inside a controller's `store()` method:

```php
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body'  => 'required',
    ]);

    // The blog post is valid...

    return redirect('/posts');
}
```

> If validation fails, the code after `validate()` never runs. The user is redirected back automatically. The returned `$validated` array contains only the fields that passed validation.

## Rules as Arrays

Validation rules may also be written as an **array of rules** instead of a single `|` delimited string:

```php
$validatedData = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body'  => ['required'],
]);
```

> Use the array form when a rule contains a `|` character, such as a `regex` pattern. A pipe inside a string would be mistaken for a rule separator.

## Commonly Used Validation Rules

| Rule | What it does | Example |
|---|---|---|
| `required` | Field must be present and not empty. | `'email' => 'required'` |
| `min` | Minimum value or character length. | `'password' => 'required\|min:8'` |
| `max` | Maximum value or character length. | `'username' => 'required\|max:50'` |
| `string` | Field must be a string. | `'name' => 'required\|string'` |
| `numeric` | Field must be numeric. | `'price' => 'required\|numeric'` |
| `digits` | Exact number of digits. | `'phone_number' => 'required\|digits:10'` |
| `digits_between` | Number of digits within a range. | `'code' => 'required\|digits_between:5,8'` |
| `nullable` | Allows null, but still validates the value if one is provided. | `'middle_name' => 'nullable\|string\|max:50'` |
| `regex` | Validates the value against a regular expression. | `'phone' => ['required', 'regex:/^[0-9\s\-\+]+$/']` |
| `confirmed` | A matching confirmation field (e.g. `password_confirmation`) must exist. | `'password' => 'required\|confirmed'` |
| `accepted` | Must be accepted (e.g. terms of service). | `'terms' => 'required\|accepted'` |
| `same` | Two fields must have the same value. | `'password' => 'required\|same:password_confirmation'` |
| `different` | Field must differ from another field. | `'new_password' => 'required\|different:old_password'` |
| `email` | *Also useful:* must be a valid email address. | `'email' => 'required\|email'` |
| `unique` | *Also useful:* value must not already exist in a table (`table,column`). | `'email' => 'unique:users'` |

> **Remember:** rules are separated by `|`, and `digits` checks an *exact* length while `digits_between` checks a *range*.

## The bail Rule

Sometimes you want to stop running validation rules on an attribute after the **first failure**. Assign the `bail` rule to the attribute:

```php
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body'  => 'required',
]);
```

## Displaying the Validation Errors

When validation fails, Laravel automatically redirects the user back to their previous location. All of the validation errors and the request input are **flashed to the session**. An `$errors` variable is shared with all of your application's views.

```blade
<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
```

## The @error Directive

Use the `@error` Blade directive to check quickly whether validation error messages exist for a given attribute. Inside an `@error` block, echo the `$message` variable to display the error:

```blade
<label for="title">Post Title</label>

<input id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

| Variable | Holds |
|---|---|
| `$errors` | All the validation errors (a message bag shared with every view). |
| `$message` | The error message for one field, inside `@error('field')`. |

## Extra: Custom Messages and Keeping Old Input

You can pass a second array to `validate()` to replace the default error messages, and use `old()` to refill the form after a failed submit:

```php
$request->validate([
    'title' => 'required|max:255',
], [
    'title.required' => 'Please enter a title.',
    'title.max'      => 'The title is too long.',
]);

<input type="text" name="title" value="{{ old('title') }}">
```

> `old('field')` returns the value the user typed before the redirect, so they do not have to re-type everything.

## Module 5 File Directories and Setup Commands

Where the validation code lives, and the commands to create each piece.

### app/Http/Controllers/

The `store()` and `update()` methods are where you call `$request->validate()`.

```bash
php artisan make:controller ProductController --resource
```

### routes/web.php

The route that receives the form submission (POST). Defined by hand in `routes/web.php`.

```bash
# Route::post('/posts', [PostController::class, 'store']);
php artisan route:list
```

### resources/views/

The Blade form view with `@csrf`, `@error` and `old()`, plus `$errors` for showing messages.

```bash
php artisan make:view posts.create   # resources/views/posts/create.blade.php
```

### app/Http/Requests/

**Form Request classes** move the validation rules out of the controller. Each class has a `rules()` method (and `authorize()`).

```bash
php artisan make:request StorePostRequest
# then in the controller:
# public function store(StorePostRequest $request) { $data = $request->validated(); }
```

### lang/

Holds the default error message text (`lang/en/validation.php`). Publish it to customize messages for every rule.

```bash
php artisan lang:publish
```

### app/Rules/

**Custom rule classes** for checks Laravel does not provide.

```bash
php artisan make:rule PhoneNumber
```

### Quick setup in order

```bash
php artisan make:model Post -m
php artisan make:controller PostController --resource
php artisan make:view posts.create
# add the route in routes/web.php
# add $request->validate([...]) inside store()
php artisan migrate
php artisan serve
```

# Laravel File Directories

A breakdown of Laravel's project structure: what each folder and file does in your Laravel application.

## Root-Level Directories

| Folder | What it holds |
|---|---|
| `app/` | **Core application code:** models, controllers, middleware, and service providers. |
| `bootstrap/` | **Framework bootstrapping:** `app.php` bootstraps the framework. Also houses the `cache/` directory for performance optimization files. |
| `config/` | **Configuration files:** database, mail, services, app settings, etc. Each file returns an array of configuration options. |
| `database/` | **Database-related files:** migrations, model factories, and seeders for testing and populating your database. |
| `node_modules/` | **Frontend dependencies:** Node.js packages installed via npm/yarn, used for compiling frontend assets (CSS, JS). Usually excluded from version control. |
| `public/` | **Publicly accessible files:** the document root for your web server. Contains `index.php` (entry point) and public assets like images, CSS, and JavaScript files. |
| `resources/` | **Raw, uncompiled assets:** views (Blade templates), raw CSS/JS, and language files. |
| `routes/` | **Route definitions:** all route definitions for your application. |
| `storage/` | **Generated files and logs:** compiled Blade templates, file-based sessions, file caches, logs, and user-generated files. |
| `tests/` | **Automated tests:** your PHPUnit or Pest feature and unit tests. |
| `vendor/` | **Composer dependencies:** all PHP packages installed via Composer, including Laravel itself. Never edit these directly; they're managed by Composer. Excluded from version control. |
| `references/` | **Project documentation and references:** a custom folder for project-specific guides or reference material (not a default Laravel directory). |

Key subfolders:

| Subfolder | What it holds |
|---|---|
| `app/Http/` | Controllers, middleware, form requests |
| `app/Models/` | Eloquent models |
| `app/Providers/` | Service providers that bootstrap your app |
| `app/Mail/` | Mailable classes for emails |
| `database/migrations/` | Database migration files (version control for DB) |
| `database/factories/` | Model factories for generating fake data |
| `database/seeders/` | Database seeders for populating tables |
| `resources/views/` | Blade template files (`.blade.php`) |
| `resources/css/` | Raw CSS files before compilation |
| `resources/js/` | Raw JavaScript files before compilation |
| `routes/web.php` | Web interface routes (with sessions, CSRF) |
| `routes/console.php` | Closure-based console commands |
| `storage/app/` | Files generated by your application |
| `storage/framework/` | Framework-generated files and caches |
| `storage/logs/` | Application log files |

## app/: Subfolders and Files

The `app/` folder holds the core code of your application. Artisan `make:` commands place each generated class into the matching subfolder automatically, so you never need to create these files by hand.

### app/Http/Controllers/

**Controllers** receive the request that a route in `web.php` points to, talk to the Models, and return a View or response. Controller classes are named in *StudlyCase* and end with `Controller`.

- `Controller.php`: the base controller class that every other controller extends. It comes with Laravel, so there is no command for it.
- `ContactController.php`: your controller for the contact feature (form + sending the email).
- `StudentController.php`: your controller for student registration.

```bash
php artisan make:controller ContactController
php artisan make:controller StudentController --resource   # adds index, create, store, show, edit, update, destroy
php artisan make:controller StudentController -r --model=Student_JAC   # resource + type-hinted model
php artisan make:controller HomeController --invokable   # single __invoke() method
php artisan make:controller Admin/UserController   # creates it inside a sub-folder (app/Http/Controllers/Admin)
```

> **Http/** also holds `Middleware/` (`php artisan make:middleware CheckAge`) and `Requests/` (`php artisan make:request StoreStudentRequest`) once you generate them.

### app/Mail/

**Mailable classes:** each class represents one email: its subject, sender, the Blade view it uses, and the data passed in. Usually one class per email, for example `ContactMail.php`. The email's HTML lives in `resources/views/emails/` (e.g. `emails/contact.blade.php`), and the mail server settings (`MAIL_*`) live in `.env`.

```bash
php artisan make:mail ContactMail
php artisan make:mail ContactMail --markdown=emails.contact   # also creates the Markdown view
# Sending it from a controller:
# Mail::to($address)->send(new ContactMail($data));
```

### app/Models/

**Eloquent models:** each model class represents one database table and lets you read/write rows as PHP objects (the "M" in MVC). The model name is singular; the table name is usually the plural.

- `User.php`: default model for the `users` table (ships with Laravel).
- `Student_JAC.php`: your model for student records.
- `Course_JAC.php`: your model for courses.
- `Enrollment_JAC.php`: your model linking students and courses.

```bash
php artisan make:model Student_JAC
php artisan make:model Student_JAC -m      # model + migration
php artisan make:model Student_JAC -mfsc   # model + migration + factory + seeder + controller
php artisan make:model Student_JAC --all   # model + migration + factory + seeder + policy + controller + form requests
```

> Eloquent guesses the table name from the class name. With custom names like `Student_JAC` and a table called `students_jac`, you normally set it yourself: `protected $table = 'students_jac';`. Remember `$fillable` for mass assignment.

### app/Providers/

**Service providers** bootstrap your application: they register services, bind classes into the service container, and run start-up code. The default `AppServiceProvider.php` is where you put your own boot-time settings. In Laravel 11+, providers are listed in `bootstrap/providers.php`.

```bash
php artisan make:provider CustomServiceProvider
```

## database/: Subfolders and Files

Everything related to your database structure and starter data.

> **Golden rule:** migrations create the tables, factories make fake data, seeders insert it.

### database/migrations/

**Version control for your database.** Each file has an `up()` method (apply the change) and a `down()` method (reverse it). The file name starts with a timestamp so migrations run in the order they were created.

- `0001_01_01_000000_create_users_table.php`: default. Users (plus password resets and sessions tables).
- `0001_01_01_000001_create_cache_table.php`: default. Table used by the database cache driver.
- `0001_01_01_000002_create_jobs_table.php`: default. Table used by the database queue driver.
- `..._students_jac.php, ..._courses_jac.php, ..._enrollments_jac.php`: your own tables for students, courses and enrollments.
- `..._update_jac.php`: your alter-table migration, which modifies a table that already exists.

```bash
php artisan make:migration create_students_jac_table   # new table (Schema::create is auto-filled)
php artisan make:migration update_jac --table=students_jac   # change an existing table
php artisan make:cache-table   # recreates the default cache table migration
php artisan make:queue-table   # recreates the default jobs table migration

# Running them
php artisan migrate            # run all pending migrations
php artisan migrate:status     # which have run
php artisan migrate:rollback   # undo the last batch
php artisan migrate:reset      # undo all migrations
php artisan migrate:fresh      # drop all tables and re-run everything
```

> Using `make:model Name -m` creates the model *and* its migration in one command.

### database/factories/

**Model factories** define how to generate fake rows (using Faker) for testing and for filling tables with sample data. The default is `UserFactory.php`. A model needs the `HasFactory` trait to use its factory.

```bash
php artisan make:factory StudentFactory --model=Student_JAC
# Using it:
# Student_JAC::factory()->count(10)->create();
```

### database/seeders/

**Seeders** insert starter or sample data. `DatabaseSeeder.php` is the main seeder, and it calls the others with `$this->call([...])`.

```bash
php artisan make:seeder StudentSeeder
php artisan db:seed                          # run DatabaseSeeder
php artisan db:seed --class=StudentSeeder    # run one seeder
php artisan migrate:fresh --seed             # rebuild tables, then seed
```

### database/database.sqlite

The **SQLite database file**. Laravel 11+ uses SQLite by default (`DB_CONNECTION=sqlite` in `.env`), so your whole database is this single file.

*No Artisan `make:` command: the installer creates it for you. If it is missing, create an empty file with that name, or run `php artisan migrate` and accept the prompt to create it.*

### database/.gitignore

Tells Git to ignore the `*.sqlite` files so your local database is not committed. It ships with Laravel.

*No Artisan `make:` command: it is part of the default project.*

## public/: Subfolders and Files

The **document root** of your web server. Anything inside `public/` can be requested directly by the browser, so only put public files here. Nothing in this folder is made by a `make:` command, except the storage link below.

### public/index.php

The **front controller**. Every request enters here: it loads Composer's autoloader, boots the app from `bootstrap/app.php`, and hands the request to Laravel's router. You almost never edit it.

*No Artisan `make:` command: it comes with every Laravel project.*

### public/.htaccess

Apache rewrite rules that send every request that is not an existing file to `index.php`. This is what makes clean URLs like `/contact` work.

*No Artisan `make:` command: it comes with Laravel.*

### public/favicon.ico and public/robots.txt

`favicon.ico` is the small icon shown on the browser tab. `robots.txt` tells search-engine crawlers which pages they may visit.

*No Artisan `make:` command: they come with Laravel; replace or edit them by hand.*

### public/build/

**Compiled frontend assets.** Vite writes the bundled, minified CSS and JS here from `resources/css` and `resources/js`. Do not edit these files, since they are regenerated each build.

```bash
npm run build   # compile assets for production into public/build
npm run dev     # dev server with hot reload (no build needed while it runs)
```

### public/images/

Your own static images. This is a custom folder, not part of a fresh Laravel install. Use it in Blade with `asset('images/logo.png')`.

*No Artisan `make:` command: create the folder by hand and drop your images in.*

### public/storage (symbolic link)

Not in your tree yet. It makes files saved in `storage/app/public` (such as uploads) reachable from the browser.

```bash
php artisan storage:link
```

## resources/: Subfolders and Files

Your **raw, un-compiled** frontend files: Blade views, CSS and JavaScript source.

### resources/views/

**Blade templates** (the "V" in MVC). Files end in `.blade.php`, and you render them with `return view('contact');`. Subfolders use dot notation: `view('emails.contact')`.

- `welcome.blade.php`: the default home page (shipped with Laravel).
- `contact.blade.php / contact-success.blade.php`: contact form and its thank-you page.
- `student-registration.blade.php / student-success.blade.php`: student form and its success page.
- `portfolio, projects, hobbies, games (.blade.php)`: your portfolio pages.

```bash
php artisan make:view contact
php artisan make:view contact-success
php artisan make:view emails.contact   # creates resources/views/emails/contact.blade.php
```

### resources/views/emails/

A subfolder that groups **email templates** separate from your pages. `contact.blade.php` is the HTML body used by the mailable in `app/Mail/`.

```bash
php artisan make:view emails.contact
# or let the mailable create it:
php artisan make:mail ContactMail --markdown=emails.contact
```

### resources/css/

**Source CSS.** `app.css` is the main stylesheet. Vite compiles it into `public/build`, and you load it in a layout with `@vite(['resources/css/app.css', 'resources/js/app.js'])`.

*No Artisan `make:` command: create and edit the files by hand, then run `npm run dev` or `npm run build`.*

### resources/js/

**Source JavaScript.** Typically `app.js` is the entry point, and Vite bundles it into `public/build`.

*No Artisan `make:` command: create and edit the files by hand, then compile with Vite.*

## routes/, bootstrap/, storage/, tests/ and More

The remaining folders and the files that set up your project.

### routes/

Where URLs are mapped to code (the "R" in routing).

- `web.php`: browser routes, with sessions and CSRF protection. Most of your routes go here.
- `console.php`: closure-based Artisan commands.

```bash
php artisan route:list        # show every registered route
php artisan install:api       # adds routes/api.php (+ Sanctum)
php artisan install:broadcasting   # adds routes/channels.php
```

### bootstrap/

`app.php` configures routing, middleware and exceptions. `providers.php` lists the service providers. `cache/` holds auto-generated framework cache files.

```bash
php artisan optimize         # cache config, routes, views and events
php artisan optimize:clear   # clear all of those caches
```

### storage/

Generated files. `app/` holds files created by your app (uploads go in `app/public`), `framework/` holds the cache, sessions and compiled Blade views, and `logs/` holds `laravel.log`.

```bash
php artisan storage:link   # public/storage -> storage/app/public
php artisan view:clear     # delete compiled Blade views
php artisan cache:clear    # clear the application cache
```

### tests/

`Feature/` tests exercise a whole request (a route, a form). `Unit/` tests check a single small piece of code.

```bash
php artisan make:test ContactTest           # Feature test
php artisan make:test ContactTest --unit    # Unit test
php artisan test                            # run the tests
```

### config/

Settings files (`app.php`, `database.php`, `mail.php`…), each returning an array. Values usually come from `.env` via `env('KEY')`.

```bash
php artisan config:publish         # publish optional config files
php artisan config:cache           # cache the config
php artisan config:clear           # clear the cached config
```

### .env

Environment settings for this machine: `APP_KEY`, database, mail credentials, and so on. Never commit it. It is created from `.env.example`.

```bash
cp .env.example .env        # copy the example (Windows: copy .env.example .env)
php artisan key:generate    # generate APP_KEY in .env
```

### vendor/ and node_modules/

`vendor/` holds the PHP packages from Composer (including Laravel). `node_modules/` holds the JavaScript packages from npm. Both are regenerated, so they are not committed.

```bash
composer install   # recreates vendor/ from composer.lock
npm install        # recreates node_modules/ from package.json
```

## Artisan make: Commands (Quick Reference)

Artisan decides which folder the file goes into, based on the command. Always `php artisan make:...` and the file appears in the right place with the right boilerplate.

| Command (after `php artisan`) | Creates | Location |
|---|---|---|
| `make:controller NameController` | Controller | `app/Http/Controllers/` |
| `make:model Name -m` | Model (+ migration) | `app/Models/ (+ database/migrations/)` |
| `make:migration create_x_table` | Migration | `database/migrations/` |
| `make:factory NameFactory` | Factory | `database/factories/` |
| `make:seeder NameSeeder` | Seeder | `database/seeders/` |
| `make:view name` | Blade view | `resources/views/` |
| `make:mail NameMail` | Mailable | `app/Mail/` |
| `make:middleware Name` | Middleware | `app/Http/Middleware/` |
| `make:request NameRequest` | Form request (validation) | `app/Http/Requests/` |
| `make:provider NameServiceProvider` | Service provider | `app/Providers/` |
| `make:policy NamePolicy` | Policy | `app/Policies/` |
| `make:test NameTest` | Test | `tests/Feature/ (or Unit/ with --unit)` |
| `make:command Name` | Custom Artisan command | `app/Console/Commands/` |
| `make:job Name` | Queued job | `app/Jobs/` |

```bash
php artisan list                       # every available command
php artisan make:controller --help     # options for one command
```

> **Exam tip:** `make:controller` → **app/Http/Controllers**, `make:model` → **app/Models**, `make:migration` → **database/migrations**, `make:view` → **resources/views**.

## Root Configuration Files

| File | What it is |
|---|---|
| `.editorconfig` | Editor configuration for maintaining consistent coding styles across different editors and IDEs. |
| `.env` | **Environment variables:** stores sensitive configuration like database credentials, API keys, app environment (local/production). **Never commit this to version control.** |
| `.env.example` | Example environment file showing what variables are needed. Copy this to create your own `.env` file. |
| `.gitattributes` | Git configuration for path-specific settings like line endings and diff behavior. |
| `.gitignore` | Tells Git which files and directories to ignore (e.g., `vendor/`, `node_modules/`, `.env`). |
| `.npmrc` | npm configuration file for Node package manager settings. |
| `artisan` | **Artisan CLI tool:** Laravel's command-line interface. Run `php artisan` to see all available commands for generating code, running migrations, clearing caches, etc. |
| `boost.json` | Configuration file (custom or package-specific, not a default Laravel file). |
| `composer.json` | **PHP dependencies:** lists all PHP packages your project requires. Run `composer install` to install them. |
| `composer.lock` | Locks the exact versions of packages installed. Commit this to ensure everyone uses the same package versions. |
| `package-lock.json` | Locks exact versions of npm packages. Automatically generated when you install npm packages. |
| `package.json` | **Node.js dependencies:** lists frontend packages and build scripts. Run `npm install` to install them. |
| `phpunit.xml` | PHPUnit testing framework configuration. Defines test suites, coverage settings, and environment variables for testing. |
| `CLAUDE.md` | Custom documentation file (not a default Laravel file); may contain project notes or AI assistant instructions. |
| `PORTFOLIO_README.md` | Project documentation: describes your portfolio project, setup instructions, and features. |
| `README.md` | Main project documentation: the first file people see on GitHub. Describes what your project does and how to use it. |
| `vite.config.js` | **Vite configuration:** modern frontend build tool configuration. Compiles and bundles your CSS and JavaScript assets. |

## Important File Paths to Remember

| What | Where |
|---|---|
| Models | `app/Models/` |
| Controllers | `app/Http/Controllers/` |
| Views | `resources/views/` |
| Routes | `routes/web.php` |
| Config | `config/` |
| Migrations | `database/migrations/` |
| Public Assets | `public/` |
| Environment | `.env` |

> **Exam tip:** remember the MVC pattern locations: **M**odels in `app/Models/`, **V**iews in `resources/views/`, **C**ontrollers in `app/Http/Controllers/`.

## Typical Development Workflow

1. **Define a route** in `routes/web.php`
2. **Create a controller**: `php artisan make:controller MyController`
3. **Build your model**: `php artisan make:model MyModel -m` (with migration)
4. **Create views** in `resources/views/` using Blade templates
5. **Configure environment** variables in `.env`
6. **Run migrations**: `php artisan migrate`
7. **Compile assets**: `npm run dev` or `npm run build`
