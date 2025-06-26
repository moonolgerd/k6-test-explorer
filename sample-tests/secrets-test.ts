// Simple k6 test that uses secrets from the secrets.env file
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';
import secrets from 'k6/secrets';

export const options: Options = {
    stages: [
        { duration: '10s', target: 2 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.1'],
    },
};

export default async function () {
    // Get secrets using the new k6/secrets module
    const apiKey = await secrets.get('api_key');
    const username = await secrets.get('username');
    const password = await secrets.get('password');
    const baseUrl = await secrets.get('base_url') || 'https://httpbin.org';

    console.log(`Using API key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'not provided'}`);
    console.log(`Username: ${username || 'not provided'}`);
    console.log(`Base URL: ${baseUrl}`);

    if (!apiKey || !username || !password) {
        console.error('Missing required secrets! Make sure to run with --secret-source=file=secrets.env');
        throw new Error('Required secrets not found');
    }

    // Test API call with secrets
    const response = http.post(`${baseUrl}/post`,
        JSON.stringify({
            username: username,
            timestamp: new Date().toISOString()
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        }
    );

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response contains username': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return body.json && body.json.username === username;
            } catch {
                return false;
            }
        },
        'has auth header': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return body.headers && body.headers.Authorization === `Bearer ${apiKey}`;
            } catch {
                return false;
            }
        },
    });

    sleep(1);
}

export function handleSummary(data: any) {
    console.log('✅ Secrets test completed successfully');
    console.log(`📊 Total requests: ${data.metrics.http_reqs.values.count}`);
    console.log(`❌ Failed requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`);

    return {
        'stdout': JSON.stringify(data, null, 2),
    };
}
