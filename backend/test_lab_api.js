async function testLabEndpoints() {
    try {
        console.log("=== Testing Lab Technician APIs ===");

        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'labtech@aanya.com', password: 'Lab@123' })
        });

        if (!loginRes.ok) {
            console.log("Login failed");
            const errText = await loginRes.text();
            console.error(errText);
            return;
        }

        const data = await loginRes.json();
        const token = data.token;

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        console.log("1. Get Pending Orders...");
        const pending = await fetch('http://localhost:5000/api/lab/orders/pending', { headers });
        const pendingData = await pending.json();
        console.log("Pending Orders:", JSON.stringify(pendingData, null, 2));

        console.log("2. Get Completed Orders...");
        const completed = await fetch('http://localhost:5000/api/lab/orders/completed', { headers });
        const completedData = await completed.json();
        console.log("Completed Orders:", JSON.stringify(completedData, null, 2));

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testLabEndpoints();
