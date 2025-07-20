// ES module version of the app
// You can run it with: node --input-type=module <filename>.js

const rssFeedUrl = 'https://techcrunch.com/category/artificial-intelligence/feed/';

import { URL } from 'url';

function getTLD(hostname) {
    const parts = hostname.split('.').filter(p => p);
    if (parts.length < 2) return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    let suffixLength = 1;
    const last = parts[parts.length - 1];
    const second = parts[parts.length - 2];
    const knownMultiSeconds = new Set(['co', 'com', 'org', 'net', 'edu', 'gov', 'ac', 'me']);
    if (last.length === 2 && knownMultiSeconds.has(second)) {
        suffixLength = 2;
    }
    if (last === 'gov') {
        suffixLength = 1;
    }
    const tldIndex = parts.length - suffixLength - 1;
    if (tldIndex < 0) return null;
    const tld = parts[tldIndex];
    return tld.charAt(0).toUpperCase() + tld.slice(1);
}

function parseAndUppercaseHostname(feedUrl) {
    try {
        const parsedUrl = new URL(feedUrl);
        const hostname = parsedUrl.hostname;
        return getTLD(hostname);
    } catch (err) {
        console.error('Invalid URL:', err.message);
        return null;
    }
}

const result = parseAndUppercaseHostname(rssFeedUrl);

if (result) {
    console.log('Uppercased hostname:', result);
}
