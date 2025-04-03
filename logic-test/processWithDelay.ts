type CancelToken = { cancelled: boolean };

async function processWithDelay(
    numbers: number[],
    delay: number = 1000,
    onProgress?: (processed: number, total: number) => void,
    cancelToken?: CancelToken
): Promise<void> {
    // Handle invalid inputs
    if (!Array.isArray(numbers)) {
        throw new Error("Invalid input: Expected an array of numbers.");
    }

    for (const num of numbers) {
        if (typeof num !== "number") {
            throw new Error("Invalid input: Array must contain only numbers.");
        }
    }

    // Handle empty arrays gracefully
    if (numbers.length === 0) {
        console.log("No numbers to process!");
        return Promise.resolve();
    }

    const total = numbers.length;
    for (let i = 0; i < total; i++) {
        // Check for cancellation
        if (cancelToken?.cancelled) {
            console.log("Process cancelled!");
            return;
        }

        // Process the current number
        console.log(numbers[i]);

        // Report progress
        onProgress?.(i + 1, total);

        // Delay before processing the next number
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.log("All numbers processed!");
}

async function runCases() {
    // Case 1: Normal execution
    console.log("Running Case 1: Normal execution");
    await processWithDelay([1, 2, 3, 4, 5], 1000, (processed, total) => console.log(`Progress: ${processed}/${total}`));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("----------------------------------------------------------------");
    // Show "ready for case 2" and wait 1 second
    console.log("Ready for case 2");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Case 2: Empty array
    console.log("Running Case 2: Empty array");
    await processWithDelay([], 1000);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("----------------------------------------------------------------");
    // Wait 1 second before case 3
    console.log("Ready for case 3");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Case 3: Cancellation
    console.log("Running Case 3: Cancellation");
    const cancelToken: CancelToken = { cancelled: false };
    const cancellationPromise = processWithDelay([1, 2, 3, 4, 5], 1000, undefined, cancelToken);
    setTimeout(() => {
        cancelToken.cancelled = true;
    }, 2500);
    await cancellationPromise;
}

// Run all cases sequentially
runCases().catch((error) => console.error("Error:", error.message));


