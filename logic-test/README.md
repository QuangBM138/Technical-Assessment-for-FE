# Process With Delay

This project implements a utility function `processWithDelay` that processes an array of numbers with a configurable delay between each number. It supports progress tracking, cancellation, and handles invalid inputs gracefully.

## Features

- **Configurable Delay**: Specify the delay time (in milliseconds) between processing each number. Defaults to `1000` milliseconds if not provided.
- **Cancellation Support**: Cancel the ongoing process at any time using a `CancelToken`.
- **Graceful Handling of Empty Arrays**: Logs a message and resolves immediately if the input array is empty.
- **Input Validation**: Throws an error for invalid inputs (e.g., non-array or arrays containing non-numeric values).

---

## Compilation

To compile the TypeScript file, use the following command:

tsc processWithDelay.ts

To run the compiled JavaScript file, use the following command:

```bash
node processWithDelay.js
```
