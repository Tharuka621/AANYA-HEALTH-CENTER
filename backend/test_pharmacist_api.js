const http = require('http');

const loginQuery = JSON.stringify({
    email: 'pharmacist@aanya.com',
    password: 'Pharmacist@123'
});

const loginReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginQuery)
    }
}, (res) => {
    let loginData = '';
    res.on('data', d => loginData += d);
    res.on('end', () => {
        const token = JSON.parse(loginData).token;

        // Fetch prescriptions
        const prescReq = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/pharmacist/prescriptions/pending',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (pRes) => {
            let prescData = '';
            pRes.on('data', d => prescData += d);
            pRes.on('end', () => {
                console.log(JSON.stringify(JSON.parse(prescData), null, 2));
            });
        });
        prescReq.end();
    });
});

loginReq.write(loginQuery);
loginReq.end();
