// Sample k6 test using arrow function syntax
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

export interface EqWebUser {
    id: number;
    name: string;
    email: string;
}

export const options: Options = {
    vus: 1,
    duration: '10s',
};

// Arrow function test with typed parameters
export default (users: EqWebUser[]): void => {
    const user = users[Math.floor(Math.random() * users.length)];

    const response = http.get(`https://httpbin.org/json?user=${user.id}`);

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    sleep(1);
};

export function handleSummary(data: any) {
    return {
        'summary.json': JSON.stringify(data),
    };
}
