# Process With Delay

This project implements a utility function `processWithDelay` that processes an array of numbers with a configurable delay between each number. It supports progress tracking, cancellation, and handles invalid inputs gracefully.

## Features

- **Configurable Delay**: Specify the delay time (in milliseconds) between processing each number. Defaults to `1000` milliseconds if not provided.
- **Cancellation Support**: Cancel the ongoing process at any time using a `CancelToken`.
- **Graceful Handling of Empty Arrays**: Logs a message and resolves immediately if the input array is empty.
- **Input Validation**: Throws an error for invalid inputs (e.g., non-array or arrays containing non-numeric values).

---

## Function: `processWithDelay`

### Syntax
```typescript
async function processWithDelay(
    numbers: number[],
    delay?: number | 1000,
    cancelToken?: CancelToken
): Promise<void>
```

### Parameters
- `numbers`: An array of numbers to process.
- `delay` (optional): The delay time (in milliseconds) between processing each number. Defaults to `1000` if not provided.
- `cancelToken` (optional): An object with a `cancelled` property to signal cancellation.

### Example Usage
```typescript
// Case 1: Normal execution
await processWithDelay([1, 2, 3, 4, 5], 1000);

// Case 2: Empty array
await processWithDelay([]);

// Case 3: Cancellation
const cancelToken: CancelToken = { cancelled: false };
const promise = processWithDelay([1, 2, 3, 4, 5], 1000, cancelToken);

// Cancel the process after 2.5 seconds
setTimeout(() => {
    cancelToken.cancelled = true;
}, 2500);

await promise;

// Case 4: Invalid input (non-array)
try {
    await processWithDelay("invalid input", 1000);
} catch (error) {
    console.error(error.message);
}

// Case 5: Invalid input (array with non-number elements)
try {
    await processWithDelay([1, "two", 3]);
} catch (error) {
    console.error(error.message);
}
```

### Output Example
```
Running Case 1: Normal execution
1
Progress: 1/5
2
Progress: 2/5
3
Progress: 3/5
4
Progress: 4/5
5
Progress: 5/5
All numbers processed!

Running Case 2: Empty array
No numbers to process!

Running Case 3: Cancellation
1
2
Process cancelled!

Running Case 4: Invalid input (non-array)
Error: Invalid input: Expected an array of numbers.

Running Case 5: Invalid input (array with non-number elements)
Error: Invalid input: Array must contain only numbers.
```

---

## Compilation

To compile the TypeScript file, use the following command:

```bash
tsc processWithDelay.ts
```

To run the compiled JavaScript file, use the following command:

```bash
node processWithDelay.js
```
