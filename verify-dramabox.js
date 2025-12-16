// using native fetch
const BASE_URL = "https://dramabox.sansekai.my.id/api/dramabox";

async function verify() {
    const testId = "41000113177";
    const endpoints = [
        `/detail?bookId=${testId}`,
        `/book/detail?bookId=${testId}`,
        `/get_detail?bookId=${testId}`,
        `/get_book_detail?bookId=${testId}`,
        `/query_book_detail?bookId=${testId}`,
        `/get_book?bookId=${testId}`,
        `/book?bookId=${testId}`,
        `/info?bookId=${testId}`
    ];

    for (const ep of endpoints) {
        try {
            console.log(`Testing: ${ep}`);
            const res = await fetch(`${BASE_URL}${ep}`);
            if (res.ok) {
                const text = await res.text();
                // Check if JSON
                if (text.startsWith("{") || text.startsWith("[")) {
                    console.log(`[SUCCESS] ${ep} returned JSON!`);
                    console.log(text.substring(0, 200)); // Print start
                } else {
                    console.log(`[FAIL] ${ep} returned non-JSON (likely 404 page).`);
                }
            } else {
                 console.log(`[Status ${res.status}] ${ep}`);
            }
        } catch (e) {
            console.log(`[ERROR] ${ep}: ${e.message}`);
        }
    }
}

verify();
