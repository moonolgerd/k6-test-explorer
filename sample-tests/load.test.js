import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // below normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 }, // normal load
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 }, // around the breaking point
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 }, // beyond the breaking point
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 }, // scale down. Recovery stage.
  ],
};

export default function () {
  group('API Tests', function () {
    group('GET requests', function () {
      const response = http.get('https://httpbin.org/get');
      check(response, {
        'GET status is 200': (r) => r.status === 200,
        'GET response time < 1000ms': (r) => r.timings.duration < 1000,
      });
    });

    group('POST requests', function () {
      const payload = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
      });
      
      const params = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = http.post('https://httpbin.org/post', payload, params);
      check(response, {
        'POST status is 200': (r) => r.status === 200,
        'POST response time < 2000ms': (r) => r.timings.duration < 2000,
      });
    });
  });

  sleep(1);
}
