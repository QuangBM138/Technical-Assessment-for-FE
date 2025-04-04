type CancelToken = { cancelled: boolean };
type Delay = number | 1000;
async function processWithDelay(
    numbers: number[],
    delay?: Delay,
    cancelToken?: CancelToken,
): Promise<void> {
    // Handle invalid inputs
    if (!Array.isArray(numbers)) {
        // throw new Error("Invalid input: Expected an array of numbers.");
        console.log("Invalid input: Expected an array of numbers.");
        return Promise.resolve(); // Exit the function if invalid input is found
    }

    for (const num of numbers) {
        if (typeof num !== "number") {
            // throw new Error("Invalid input: Array must contain only numbers.");
            console.log("Invalid input: Array must contain only numbers.");
            return Promise.resolve(); // Exit the function if invalid input is found
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
        const processed = i + 1;
        console.log(`Progress: ${processed}/${total}`);
        // Delay before processing the next number
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.log("All numbers processed!");
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function runCases() {
    // Case 1: Normal execution
    console.log("Running Case 1: Normal execution");
    await processWithDelay([1, 2, 3, 4, 5], 1000);
    console.log("----------------------------------------------------------------");
    // Case 2: Empty array
    console.log("Running Case 2: Empty array");
    await processWithDelay([], 1000);

    console.log("----------------------------------------------------------------");
    // Case 3: Cancellation
    console.log("Running Case 3: Cancellation");
    const cancelToken: CancelToken = { cancelled: false };
    const cancellationPromise = processWithDelay([1, 2, 3, 4, 5], 1000, cancelToken);
    setTimeout(() => {
        cancelToken.cancelled = true;
    }, 2500);
    await cancellationPromise;

    //Case 4: Invalid input (non-array)
    console.log("----------------------------------------------------------------");
    console.log("Running Case 4: Invalid input (non-array)");
    await processWithDelay("invalid input", 1000);

    // Case 5: Invalid input (array with non-number elements)
    console.log("----------------------------------------------------------------");
    console.log("Running Case 5: Invalid input (array with non-number elements)");
    await processWithDelay([1, "two", 3], 1000);

}

// Run all cases sequentially
runCases().catch((error) => console.error("Error:", error.message));


