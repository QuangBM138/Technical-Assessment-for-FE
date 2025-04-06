# Technical Assessment for Front-End Developer Role

## Overview

This repository contains two projects designed for a technical assessment:

1. **Process With Delay**: A utility function implemented in TypeScript that processes an array of numbers with a configurable delay, supporting cancellation and input validation.
2. **Users Table**: A Vue 3 application that displays a table of users with features like search, sorting, pagination, infinite scrolling, and dark mode.

---

## Projects

### 1. Process With Delay

#### Description
The **Process With Delay** project is a TypeScript utility function that processes an array of numbers with a configurable delay between each number. It supports cancellation, progress tracking, and input validation.

#### Features
- **Configurable Delay**: Specify the delay time (in milliseconds) between processing each number.
- **Cancellation Support**: Cancel the ongoing process at any time using a `CancelToken`.
- **Graceful Handling of Empty Arrays**: Logs a message and resolves immediately if the input array is empty.
- **Input Validation**: Throws an error for invalid inputs (e.g., non-array or arrays containing non-numeric values).

#### Setup
1. Navigate to the `logic-test` directory:
   ```sh
   cd logic-test
   ```
2. Compile the TypeScript file:
    ```sh
    tsc processWithDelay.ts
    ```
3. Run the compiled JavaScript file:
    ```sh
    node processWithDelay.js
    ```

### 2. Users Table

#### Description
The **Users Table** project is a Vue 3 application built with Vite. It provides a user-friendly interface to display and manage user data fetched from a mock API.

#### Features
- **Search**: Filter users by name or email.
- **Sorting**: Sort users by name, balance, email, registration date, or status.
- **Pagination & Infinite Scroll**: Toggle between pagination and infinite scrolling modes.
- **Dark Mode**: Switch between light and dark themes.
- **Edit & Delete**: Edit user details or delete users with confirmation modals.
- **Responsive Design**: Optimized for various screen sizes.

#### Setup
1. Navigate to the `users-table` directory:
   ```sh
   cd users-table
   ```
2. Install dependencies:
   ```sh
   yarn
   ```
3. Run the development server:
   ```sh
   cyarn dev
   ```
# Live Demo
https://technical-assessment-for-fe.vercel.app/