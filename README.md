# Kanban Task Manager Application

#### By Jerry Dormetus

#### A web based Kanban task manager application

## Technologies Used

* HTML
* CSS
* JavaScript
* Custom Elements
* Shadow DOM
* CSS Module Scripts
* Navigo.js
* Rollup
* Terser (via Rollup Plugin)

## Description

A web based task manager application where you can create categories (board), subcategories (columns),
and tasks per subcategory.

## Setup/Installation Requirements

* Clone this repository to your development environment
* Navigate to the root directory of the application
* Execute "npm run install" to install the dependencies
* Execute "npm run start:dev" to create the dist directory with the bundled code
* Execute "npm run start:prod" to create the dist directory with the bundled and minified code
* Execute "npm run start:main" to launch the unbundled unminified source code (context WSL2 with browserSync as the server)

## Known Bugs

* Sometimes the theme toggle on the sidebar doesn't always sync with the theme toggle on the app's header
* Sometimes changing the status of a task doesn't update unless you navigate to another board

## License

Reach out to me with any feedback or questions via my website's contact form at jerrydormetus.com

Copyright (c) Jerry Dormetus