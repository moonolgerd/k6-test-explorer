import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50,
      timeUnit: '1s',
      stages: [
        { duration: '2m', target: 10 }, // below normal load
        { duration: '1m', target: 50 }, // spike to 50 iterations
        { duration: '2m', target: 10 }, // scale down. Recovery stage.
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'], // error rate must be below 10%
  },
};

export default function () {
  const response = http.get('https://httpbin.org/delay/1');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time meets SLA': (r) => r.timings.duration < 2000,
  });
  
  sleep(Math.random() * 2);
}
