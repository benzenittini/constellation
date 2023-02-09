
export async function poll(condition: () => Promise<boolean> | boolean, onSuccess: () => void, onFailure: () => void, sleep = 200, maxPolls = 20, currentCount = 0) {
    if (await condition()) {
        onSuccess();
    } else if (currentCount > maxPolls) {
        onFailure();
    } else {
        setTimeout(() => poll(condition, onSuccess, onFailure, sleep, maxPolls, currentCount+1), sleep);
    }
}