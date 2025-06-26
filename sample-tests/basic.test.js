import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s', // for 30 seconds
};

export default function () {
  const response = http.get('https://httpbin.org/json');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}

export function setup() {
  console.log('Setting up test data...');
  return { data: 'test' };
}

export function teardown(data) {
  console.log('Cleaning up test data...', data);
}
