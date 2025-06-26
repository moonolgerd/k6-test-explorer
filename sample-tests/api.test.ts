import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

export const options: Options = {
    stages: [
        { duration: '2m', target: 100 }, // Ramp up to 100 users
        { duration: '5m', target: 100 }, // Stay at 100 users
        { duration: '2m', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    },
};

interface User {
    id: number;
    name: string;
    email: string;
}

export default function (): void {
    // Test API endpoint
    const response = http.get('https://jsonplaceholder.typicode.com/users');

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 2s': (r) => r.timings.duration < 2000,
        'has users': (r) => {
            const users: User[] = JSON.parse(r.body as string);
            return users.length > 0;
        },
    });

    // Test individual user
    const userId: number = Math.floor(Math.random() * 10) + 1;
    const userResponse = http.get(`https://jsonplaceholder.typicode.com/users/${userId}`);

    check(userResponse, {
        'user status is 200': (r) => r.status === 200,
        'user has valid structure': (r) => {
            const user: User = JSON.parse(r.body as string);
            return !!(user.id && user.name && user.email);
        },
    });

    sleep(1);
}

export function setup(): { apiKey: string } {
    // Use k6's built-in logging instead of console
    return { apiKey: 'test-key-123' };
}

export function teardown(data: { apiKey: string }): void {
    // Use k6's built-in logging instead of console
    // In k6, you can use the built-in `console` from k6/experimental/console if needed
}
