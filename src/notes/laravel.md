# Laravel (ITELEC 3C): Study Notes

# Module 1: Introduction to Laravel

## What is Laravel?

- **Laravel:** an open-source PHP web application framework.
- Created by Taylor Otwell in 2011.
- Follows the Model-View-Controller (MVC) architectural pattern.
- Aims to make web development easier and more elegant.
- Website: https://laravel.com/

## Why Laravel?

Laravel developers mainly build custom websites or applications using PHP, alongside other languages. Writing custom code from scratch could take ages, so a framework saves time.

| Feature | What it gives you |
|---|---|
| **Built-in Modules** | Built-in packages add ready-made features without writing code from scratch. |
| **Route Handling** | Simple route names instead of long path names. All route names can be changed in one dedicated file, not many places. |
| **Security Features** | User authentication, role authorizations, email verifications, password hashing and more. |
| **Database Migrations** | With version control, migrations are much easier to manage. |
| **Template Engine** | The **Blade** template engine makes lightweight page templates easy to create and maintain. |
| **Eloquent ORM** (Object Relational Mapping) | Write database queries in PHP syntax instead of SQL. Faster to manage and query databases. |

## Key Features

- Clean and elegant syntax
- Built-in authentication and authorization
- Eloquent ORM for database handling
- Blade templating engine
- Artisan CLI for automation
- Routing, Middleware, Caching, and more

## Development Environment

Prerequisites:

- PHP 8.1 or higher (PHP >= 8.1)
- Composer
- MySQL or any supported DB
- Web server (Apache/Nginx) or Laravel Sail (Docker)
- IDE (e.g., VS Code, PHPStorm)
- Node (compiles your application's frontend assets)

**Composer:** a tool at the foundation of most modern PHP development. Used to install Laravel, update Laravel, and bring in external dependencies.

## Creating a New Project

**Option 1: Composer `create-project`.** Creates a new project with a particular skeleton. Makes a subdirectory of the current directory named `projectName`.

```bash
composer create-project laravel/laravel projectName
```

**Option 2: Laravel Installer tool.** Needs Composer installed globally. Install the installer, then create the project. Makes a subdirectory named `projectName` with a bare Laravel project in it.

```bash
composer global require "laravel/installer"
laravel new projectName
```

## MVC

An MVC framework divides the whole application into three components:

| Component | Role |
|---|---|
| **Model** | Interacts with the database. |
| **View** | The user interface. Everything a user can see on the screen. |
| **Controller** | Connects Model and View and contains all the business logic. Also called the "Heart of the application in MVC". |

Source given: https://www.geeksforgeeks.org/php/introduction-to-laravel-and-mvc-framework/

**Advantages of MVC:**

- Organizing large-scale web application projects.
- Easier to perform modification.
- Modification in any part won't affect any other part of the code.
- Helps a faster development process.
- Helps Asynchronous Method Invocation.

## Folder Structure

The default structure is a starting point for both large and small apps. Laravel imposes almost no restrictions on where a class is located, as long as Composer can autoload the class.

| Directory | Contains |
|---|---|
| `app` | Core code of your application. Almost all classes live here. |
| `config` | All configuration files. |
| `database` | Migrations, model factories, and seeds. |
| `public` | `index.php`, the entry point for all requests, which also configures autoloading. Also houses assets such as images, JavaScript and CSS. |
| `resources` | Views, plus raw, un-compiled assets such as CSS or JavaScript. |
| `routes` | All route definitions. Two files by default: `web.php` and `console.php`. |
| `storage` | Logs, compiled Blade templates, file based sessions, file caches, and other framework-generated files. |
| `tests` | Automated tests. Pest or PHPUnit unit tests and feature tests are provided out of the box. |
| `vendor` | Your Composer dependencies. |

# Module 2: Routes

Chapter outline: What is Routes, Basic Routing, Route Parameter, Fallback Route, Route Groups, Route Cache.

## What is Routing?

- **Routing:** the process of directing an incoming request to a specific controller method.
- Routes define the URLs your application can respond to and how they are handled.
- They let you handle HTTP requests and send appropriate responses.

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

## HTTP Verbs

**HTTP verbs** (HTTP methods) indicate the desired action to perform on a resource in an HTTP request.

| Verb | Purpose |
|---|---|
| GET | Request a resource (or a list of resources) or retrieve data. |
| POST | Create a resource or submit data. |
| PUT | Overwrite a resource or update data. |
| PATCH | Modify a resource or update data. |
| DELETE | Delete a resource. |

## Named Routes

**Named routes:** generate URLs or redirects for specific routes easily.

```php
Route::get('/profile', [UserController::class, 'show'])->name('profile');
$url = route('profile');
```

## Route Parameters

Define dynamic routes using parameters.

```php
Route::get('/user/{id}', function ($id) {
    return 'User '.$id;
});
```

**Optional parameters:** add `?` after the name and give the variable a default.

```php
Route::get('/user/{name?}', function ($name = 'Guest') {
    return 'User '.$name;
});
```

## Regular Expression Constraints

Constrain the format of a route parameter with the `where` method. It accepts the parameter name and a regular expression.

```php
Route::get('/user/{id}', function ($id) {
    return 'User ID: ' . $id;
})->where('id', '[0-9]+');
```

- `/user/123` is valid.
- `/user/abc` is invalid (404 error).

Other examples from the slides:

```php
Route::get('/user/{name}', function (string $name) {
    // ...
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function (string $id) {
    // ...
})->where('id', '[0-9]+');

Route::get('/post/{slug}', function ($slug) {
    return 'Post Slug: ' . $slug;
})->where('slug', '[a-zA-Z0-9\-]+');
```

- `/post/my-first-post` is valid.
- `/post/my_first_post` is invalid (404 error).

## Fallback Route

Place it at the **end** of your route definitions so it catches any request not handled by earlier routes.

```php
Route::fallback(function () {
    return response()->view('errors.404', [], 404);
});
```

## Route Caching

Cache the routes for faster application load time in production.

```bash
php artisan route:cache
php artisan route:clear
```

- `route:cache`: caches the routes.
- `route:clear`: clears the route cache.

## Best Practices for Routing

- **Consistency:** use consistent naming conventions for routes.
- **Route Organization:** group related routes and use route names effectively.
- **Security:** always validate input in routes to prevent security vulnerabilities.

# Module 3: Views and Controllers

## Views

- Views separate your controller/application logic from your presentation logic.
- Stored in the `resources/views` directory.
- Usually written in the **Blade** templating language.

**Creating a view:**

- Use the `.blade.php` extension, in `resources/views`.
- Or generate one with Artisan:

```bash
php artisan make:view greeting
```

The `.blade.php` extension tells the framework the file is a Blade template. Blade templates contain HTML plus Blade directives for echoing values, `if` statements, iterating over data, and more.

**Rendering a view:** return it from a route or controller with the global `view` helper.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

## Blade Templates

- Blade is the simple, powerful templating engine included with Laravel.
- It does not restrict you from using plain PHP in your templates.
- Blade templates are compiled into plain PHP and cached until modified, so Blade adds essentially zero overhead.

### Raw PHP

Use the `@php` directive to run a block of plain PHP in a template.

```php
@php
   $counter = 1;
@endphp
```

### Displaying Data

Wrap the variable in curly braces.

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

```blade
Hello, {{ $name }}.
```

You can echo the result of any PHP function, or any PHP code, inside a Blade echo.

```blade
The current UNIX timestamp is {{ time() }}.
```

### If Statements

Directives: `@if`, `@elseif`, `@else`, `@endif`.

```blade
@if (count($records) === 1)
   I have one record!
@elseif (count($records) > 1)
   I have multiple records!
@else
   I don't have any records!
@endif
```

### Switch Statements

Directives: `@switch`, `@case`, `@break`, `@default`, `@endswitch`.

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

### Loops

```blade
@foreach($users as $user)
    <li>{{ $user->name }}</li>
@endforeach
```

### Comments

Unlike HTML comments, Blade comments are **not** included in the HTML returned by your application.

```blade
{{-- This comment will not be present in the rendered HTML --}}
```

### CSRF Field

Any HTML form should include a hidden CSRF token field so the CSRF protection middleware can validate the request. The `@csrf` directive generates it.

```blade
<form method="POST" action="/profile">
   @csrf
   ...
</form>
```

### Method Field

HTML forms can't make PUT, PATCH, or DELETE requests. Add a hidden `_method` field to spoof these verbs. The `@method` directive creates it.

```blade
<form action="/foo/bar" method="POST">
   @method('PUT')
   ...
</form>
```

### Blade Directive Summary

| Directive | Purpose |
|---|---|
| `{{ }}` | Echo a value or PHP result. |
| `@php` ... `@endphp` | Run a block of plain PHP. |
| `@if` / `@elseif` / `@else` / `@endif` | Conditionals. |
| `@switch` / `@case` / `@break` / `@default` / `@endswitch` | Switch statements. |
| `@foreach` ... `@endforeach` | Loop over data. |
| `{{-- --}}` | Blade comment (not in rendered HTML). |
| `@csrf` | Hidden CSRF token field. |
| `@method('PUT')` | Hidden `_method` field to spoof PUT, PATCH, DELETE. |

Reference: https://laravel.com/docs/11.x/

## Controllers

- Instead of closures in route files, organize request handling in **controller** classes.
- A controller groups related request handling logic in a single class. Example: a `UserController` handles showing, creating, updating, and deleting users.
- Stored by default in `app/Http/Controllers`.

### Writing Controllers

Generate one with the `make:controller` Artisan command (`UserController` is the controller name).

```bash
php artisan make:controller UserController
```

A controller may have any number of public methods that respond to HTTP requests.

```php
<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Define a route to the controller method:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

### Full CRUD Controller Example

```php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Display a listing of the users.
    public function index()
    {
        $users = User::all();
        return view('users.index', compact('users'));
    }

    // Show the form for creating a new user.
    public function create()
    {
        return view('users.create');
    }

    // Store a newly created user in storage.
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
        ]);
        User::create($validatedData);
        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    // Display the specified user.
    public function show($id)
    {
        $user = User::findOrFail($id);
        return view('users.show', compact('user'));
    }

    // Show the form for editing the specified user.
    public function edit($id)
    {
        $user = User::findOrFail($id);
        return view('users.edit', compact('user'));
    }

    // Update the specified user in storage.
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
        ]);
        $user->update($validatedData);
        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    // Remove the specified user from storage.
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
```

| Method | Purpose |
|---|---|
| `index` | List the users. |
| `create` | Show the create form. |
| `store` | Validate and save a new user. |
| `show` | Show one user. |
| `edit` | Show the edit form. |
| `update` | Validate and update a user. |
| `destroy` | Delete a user. |

# Module 4: Validation

## What is Validation?

- **Validation:** checking that input data from users follows specific rules before saving it to the database or processing it further.
- Laravel's validation system is robust and flexible, and helps maintain data integrity and security.
- Laravel offers several approaches. The most common is the `validate` method available on all incoming HTTP requests.
- `validate` is provided by the `Illuminate\Http\Request` object.
- If the rules pass, your code keeps executing normally.
- If validation fails, an `Illuminate\Validation\ValidationException` is thrown and the proper error response is sent back to the user automatically.

## Benefits

- Prevents invalid data from being processed or saved in the database.
- Simplifies validation logic with built-in and customizable rules.
- Improves user experience with detailed, specific error messages.
- Keeps code organized by separating validation from business logic.

## Commonly Used Rules

Rules can be written as a single `|` delimited string, or as an array of rules.

| Rule | Meaning |
|---|---|
| `required` | Field is present and not empty. |
| `min` | Minimum value or character length. |
| `max` | Maximum value or character length. |
| `string` | Field is a string. |
| `numeric` | Field is numeric. |
| `digits` | Exact number of digits. |
| `digits_between` | Number of digits falls within a range. |
| `nullable` | May be null, but still validated if a value is given. |
| `regex` | Matches a regular expression pattern. |
| `confirmed` | A confirmation field (like `password_confirmation`) matches the original. |
| `accepted` | Field is accepted (like terms of service). |
| `same` | Two fields have the same value. |
| `different` | Field differs from another field. |

Examples:

```php
'email' => 'required',
'password' => 'required|min:8',
'username' => 'required|max:50',
'name' => 'required|string',
'price' => 'required|numeric',
'phone_number' => 'required|digits:10',
'code' => 'required|digits_between:5,8',
'middle_name' => 'nullable|string|max:50',
'phone_number' => 'required|regex:/^([0-9\s\-\+\]*)$/',
'password' => 'required|confirmed',
'terms' => 'required|accepted',
'password' => 'required|same:password_confirmation',
'new_password' => 'required|different:old_password',
```

**`bail`:** assign it to an attribute to stop running further rules on that attribute after the first validation failure.

## Displaying Validation Errors

- On failure, Laravel automatically redirects the user back to their previous location.
- All validation errors and the request input are automatically flashed to the session.
- An `$errors` variable is shared with all of your application's views.

**`@error` directive:** a quick check for whether error messages exist for a given attribute. Inside it, echo the `$message` variable to show the error.

# Module 5: Migrations and Models

## Migrations

- **Migrations:** version control for your database. They let a team define and share the application's database schema.
- They solve the problem of telling a teammate to manually add a column to their local database after pulling your changes.

### Benefits

| Benefit | Explanation |
|---|---|
| **Consistency** | All developers on a team have the same schema. Avoids discrepancies between development, staging, and production databases. |
| **Collaboration** | Team members can add, modify, or delete tables and columns without conflicting changes, since migrations keep a history of schema changes. Features can be added incrementally. |
| **Rollback Capabilities** | If a migration causes an issue, revert the database to its previous state with rollback commands. |

### Creating a Migration

1. Install **XAMPP** (https://www.apachefriends.org/) and **MySQL Workbench** (https://downloads.mysql.com/archives/workbench/).
2. Create a MySQL connection and database.
3. Create the migration. For a product table:

```bash
php artisan make:migration create_product_table
```

### Migration File Structure

- **`up()` method:** code that defines the changes applied when the migration runs, such as creating tables, adding columns, or creating indexes.
- **`down()` method:** code that reverses what `up()` did. Essential for keeping the database intact during rollbacks.

### Common Data Types

| Code | Creates |
|---|---|
| `$table->id();` | Auto-incrementing primary key (big integer). |
| `$table->string('name');` | VARCHAR column, default length 255 characters. |
| `$table->text('description');` | TEXT column for longer text. |
| `$table->integer('age');` | Integer column. |
| `$table->boolean('is_active');` | BOOLEAN column (true/false). |
| `$table->date('birth_date');` | DATE column. |
| `$table->timestamp('created_at');` | TIMESTAMP column. |
| `$table->float('price', 8, 2);` | Floating-point column, 8 digits total and 2 decimal places. |
| `$table->json('preferences');` | JSON column. |

### Column Modifiers

| Modifier | Effect |
|---|---|
| `->primary()` | Sets the column as the table's primary key. |
| `->nullable()` | Column accepts NULL, so it is not required on insert. |
| `->default()` | Sets a default value if none is provided. |
| `->unique()` | All values in the column must be unique. Often used for email or username. |
| `->unsigned()` | Column stores only positive numbers. |
| `->foreignId()` | Creates a foreign key column that connects one table to another. |

Example: this connects `user_id` to the `id` column of the `users` table.

```php
$table->foreignId('user_id')->constrained('users');
```

### Migration Commands

| Command | What it does |
|---|---|
| `php artisan migrate` | Runs all pending migrations and creates/updates the database tables. |
| `php artisan migrate:rollback` | Rolls back migrations. The slide describes this as the rollback for a specific connection when using multiple database connections (you can specify the connection). |
| `php artisan migrate:reset` | Rolls back **all** migrations, not just the last batch. |
| `php artisan migrate:refresh` | Rolls back all migrations, then re-runs them. |

## Models

- **Model:** represents the structure of the data in your application and provides an interface for interacting with the database.
- Each model typically corresponds to one table, where you query and manipulate that table's data.

```bash
php artisan make:model YourModelName
```

### Naming Convention

| Item | Convention | Examples |
|---|---|---|
| Model name | Singular, PascalCase | Product, Student, Course, Enrollment |
| Table name | Plural, snake_case | products, students, courses, enrollments |

### Model Properties

- **`$table`:** specifies the database table connected to the model. Use it when the table name does not follow Laravel's default naming.

```php
protected $table = 'student_records';
```

- **`$fillable`:** lists the columns that can be inserted or updated. Helps protect the application from unwanted data changes.

```php
protected $fillable = ['name', 'email'];
```
