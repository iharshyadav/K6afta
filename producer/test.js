import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    scenarios: {
        load_test: {
            executor: 'constant-vus',
            vus: 300,      
            duration: '5m',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01'],  
    },
};

export default function() {
    const url = 'http://localhost:3000/create-post';
    
    const payload = JSON.stringify({
        title: `Post title ${__VU}-${__ITER}`,
        content: 'This is a test post body',
    });
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const response = http.post(url, payload, params);
    
    check(response, {
        'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    sleep(1);
}