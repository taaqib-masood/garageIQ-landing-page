// Runs the complete landing script with browser surfaces stubbed and every
// request intercepted. No production API calls or real waitlist entries.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../../public/main.js'), 'utf8');

class Element {
    constructor() {
        this.listeners = new Map();
        this.children = [];
        this.style = {};
        this.textContent = '';
        this.hidden = false;
        this.disabled = false;
        const classes = new Set();
        this.classList = {
            add: (...names) => names.forEach(name => classes.add(name)),
            remove: (...names) => names.forEach(name => classes.delete(name)),
            contains: name => classes.has(name)
        };
    }
    addEventListener(type, listener) { this.listeners.set(type, listener); }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute() {}
    focus() { this.focused = true; }
    blur() { this.focused = false; }
    querySelectorAll() { return []; }
}

async function run({ status = 201, networkError = false, analyticsError = false,
                     storageDenied = false, valid = true, persona = 'driver',
                     referrer = 'https://www.google.ae/search?q=private-email%40example.com',
                     returning = false, doubleSubmit = false } = {}) {
    const requests = [];
    const secondary = [];
    const form = new Element();
    const email = new Element();
    email.value = valid ? 'driver@example.com' : 'not-an-email';
    email.checkValidity = () => valid;
    const emirate = new Element();
    emirate.value = 'dubai';
    emirate.options = [{ value: 'dubai' }];
    const button = new Element();
    const error = new Element();
    const fields = {
        'input[type="email"]': email,
        'select[name="emirate"]': emirate,
        'button[type="submit"]': button,
        '.waitlist-error': error,
        'input[name="persona"]:checked': persona ? { value: persona } : null
    };
    form.querySelector = selector => fields[selector] || null;
    const store = new Map(returning ? [['giq_waitlist_email', email.value]] : []);
    const storage = {
        getItem(key) { if (storageDenied) throw Error('storage denied'); return store.get(key) ?? null; },
        setItem(key, value) { if (storageDenied) throw Error('storage denied'); store.set(key, value); },
        removeItem(key) { if (storageDenied) throw Error('storage denied'); store.delete(key); }
    };
    const document = {
        referrer,
        documentElement: new Element(),
        addEventListener(type, callback) { if (type === 'DOMContentLoaded') this.ready = callback; },
        querySelector: selector => selector === '.waitlist-form' ? form : null,
        querySelectorAll: () => [],
        getElementById: id => id === 'waitlist' ? new Element() : null,
        createElement: () => new Element(),
        createElementNS: () => new Element(),
        createTextNode: text => ({ textContent: text })
    };
    let releaseInsert;
    const insertPending = doubleSubmit ? new Promise(resolve => { releaseInsert = resolve; }) : null;
    const context = {
        document,
        location: { hash: '' },
        navigator: {},
        sessionStorage: storage,
        localStorage: storage,
        crypto: { randomUUID: () => 'test-session' },
        URL,
        console: { error() {}, log() {} },
        setTimeout: () => 0,
        clearTimeout() {},
        setInterval: () => 0,
        clearInterval() {},
        IntersectionObserver: class { observe() {} disconnect() {} unobserve() {} },
        window: {
            matchMedia: () => ({ matches: true }),
            addEventListener() {},
            va: (type, payload) => secondary.push({ type, payload })
        },
        async fetch(url, options) {
            requests.push({ url, body: JSON.parse(options.body) });
            if (url.endsWith('/landing_events')) {
                if (analyticsError) throw Error('analytics unavailable');
                return { ok: true, status: 201 };
            }
            assert.ok(url.endsWith('/waitlist'), 'all fetches must be intercepted known requests');
            if (insertPending) await insertPending;
            if (networkError) throw Error('signup unavailable');
            return { ok: status >= 200 && status < 300, status, json: async () => ({ code: 'test_error' }) };
        }
    };
    vm.runInNewContext(script, context, { filename: 'public/main.js', timeout: 1000 });
    document.ready();
    const submit = form.listeners.get('submit');
    assert.equal(typeof submit, 'function');
    if (!returning) {
        const first = submit({ preventDefault() {} });
        const second = doubleSubmit ? submit({ preventDefault() {} }) : null;
        if (releaseInsert) releaseInsert();
        await first;
        if (second) await second;
    }
    const events = requests.filter(request => request.url.endsWith('/landing_events')).map(request => request.body);
    for (const event of events) {
        assert.deepEqual(Object.keys(event).sort(), ['emirate', 'name', 'persona', 'referrer', 'session_id']);
        assert.ok(!JSON.stringify(event).includes('@'), 'analytics cannot contain an email or referrer query');
        assert.equal(event.referrer, referrer ? (() => { try { return new URL(referrer).hostname; } catch { return null; } })() : null);
    }
    assert.ok(!JSON.stringify(secondary).includes('@'), 'secondary analytics cannot contain email');
    assert.equal(events.filter(event => event.name === 'landing_view').length, 1, 'one denominator event per page load');
    return { events, secondary, form, error, button, email, requests };
}

(async () => {
    let scenarios = 0;
    const check = async (options, expectedNew, success) => {
        const result = await run(options);
        const newSignups = result.events.filter(event => event.name === 'waitlist_new_signup');
        assert.equal(newSignups.length, expectedNew, JSON.stringify(options));
        if (expectedNew) {
            const expectedPersona = Object.hasOwn(options, 'persona') ? options.persona || 'unknown' : 'driver';
            assert.equal(newSignups[0].persona, expectedPersona);
            assert.equal(newSignups[0].emirate, 'dubai');
            assert.equal(newSignups[0].session_id, options.storageDenied ? null : 'test-session');
        }
        assert.equal(result.form.classList.contains('is-success'), success);
        scenarios++;
        return result;
    };
    await check({ status: 200 }, 1, true);
    await check({ status: 201 }, 1, true);
    const duplicate = await check({ status: 409 }, 0, true);
    assert.equal(duplicate.events.filter(event => event.name === 'waitlist_success').length, 1);
    const text = element => [element.textContent, ...(element.children || []).map(text)].join(' ');
    assert.ok(text(duplicate.form).includes("You're already on the list."));
    const invalid = await check({ valid: false }, 0, false);
    assert.equal(invalid.requests.filter(request => request.url.endsWith('/waitlist')).length, 0);
    assert.equal(invalid.email.focused, true);
    const failure = await check({ status: 500 }, 0, false);
    assert.equal(failure.error.hidden, false);
    assert.equal(failure.button.disabled, false);
    await check({ networkError: true }, 0, false);
    await check({ analyticsError: true }, 1, true);
    await check({ storageDenied: true }, 1, true);
    await check({ referrer: 'https://www.bing.com/search?q=brakes#private' }, 1, true);
    await check({ referrer: 'https://example.com/article?email=driver%40example.com' }, 1, true);
    await check({ referrer: '' }, 1, true);
    await check({ referrer: 'malformed url' }, 1, true);
    const owner = await check({ persona: 'garage_owner' }, 1, true);
    assert.equal(owner.events.filter(event => event.name === 'waitlist_new_signup' && event.persona === 'driver').length, 0);
    const unknown = await check({ persona: null }, 1, true);
    assert.equal(unknown.events.find(event => event.name === 'waitlist_new_signup').persona, 'unknown');
    await check({ returning: true }, 0, true);
    const repeated = await check({ doubleSubmit: true }, 1, true);
    assert.equal(repeated.requests.filter(request => request.url.endsWith('/waitlist')).length, 1);
    console.log(`PASS: ${scenarios} landing measurement scenarios; all fetches intercepted.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
