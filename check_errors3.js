const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');

const serve = serveStatic('.', { 'index': ['index.html'] });
const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res));
});

server.listen(8081, async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('pageerror', error => {
        console.log(`PAGE EXCEPTION: ${error.message}`);
        console.log(error.stack);
    });

    const pages = [
        'carga.html'
    ];

    for (const p of pages) {
        console.log(`Checking ${p}...`);
        await page.goto(`http://localhost:8081/${p}`, { waitUntil: 'networkidle' }).catch(e => console.log('Navigation error', e));
    }

    await browser.close();
    server.close();
});
