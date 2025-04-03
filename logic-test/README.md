# Process With Delay

This project implements a utility function `processWithDelay` that processes an array of numbers with a configurable delay between each number. It supports progress tracking, cancellation, and handles invalid inputs gracefully.

## Features

- **Configurable Delay**: Specify the delay time (in milliseconds) between processing each number.
- **Progress Tracking**: Track the progress of the processing using a callback function.
- **Cancellation Support**: Cancel the ongoing process at any time using a `CancelToken`.
- **Graceful Handling of Empty Arrays**: Logs a message and resolves immediately if the input array is empty.
- **Input Validation**: Throws an error for invalid inputs (e.g., non-array or non-numeric values).

---

## Function: `processWithDelay`

### Syntax
```typescript
async function processWithDelay(
    numbers: number[],
    delay: number = 1000,
    onProgress?: (processed: number, total: number) => void,
    cancelToken?: CancelToken
): Promise<void>
```

### Example Usage
```typescript
await processWithDelay([1, 2, 3, 4, 5], 1000, (processed, total) => {
    console.log(`Progress: ${processed}/${total}`);
});

await processWithDelay([], 1000);

const cancelToken: CancelToken = { cancelled: false };
const promise = processWithDelay([1, 2, 3, 4, 5], 1000, undefined, cancelToken);

// Cancel the process after 2.5 seconds
setTimeout(() => {
    cancelToken.cancelled = true;
}, 2500);

await promise;
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
✨ All numbers processed!
✨ Ready for case 2
Running Case 2: Empty array
✨ No numbers to process!
✨ Ready for case 3
Running Case 3: Cancellation
1
2
Process cancelled!
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
