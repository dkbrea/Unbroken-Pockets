import { validateAndCoerceTypebox } from "../lib/validateAndCoerceTypes.js";
import quote, { QuoteOptionsSchema } from "../modules/quote.js";
const DEBOUNCE_TIME = 50;
const slugMap = new Map();
export default function quoteCombine(query, queryOptionsOverrides = {}, moduleOptions) {
    const symbol = query;
    if (typeof symbol !== "string")
        throw new Error("quoteCombine expects a string query parameter, received: " +
            JSON.stringify(symbol, null, 2));
    validateAndCoerceTypebox({
        type: "options",
        data: queryOptionsOverrides,
        schema: QuoteOptionsSchema,
        options: this._opts.validation,
    });
    // Make sure we only combine requests with same options
    const slug = JSON.stringify(queryOptionsOverrides);
    let entry = slugMap.get(slug);
    if (!entry) {
        entry = {
            timeout: null,
            queryOptionsOverrides,
            symbols: new Map(),
        };
        slugMap.set(slug, entry);
    }
    if (entry.timeout)
        clearTimeout(entry.timeout);
    const thisQuote = quote.bind(this);
    return new Promise((resolve, reject) => {
        let symbolPromiseCallbacks = entry.symbols.get(symbol);
        /* istanbul ignore else */
        if (!symbolPromiseCallbacks) {
            symbolPromiseCallbacks = [];
            entry.symbols.set(symbol, symbolPromiseCallbacks);
        }
        symbolPromiseCallbacks.push({ resolve, reject });
        entry.timeout = setTimeout(() => {
            slugMap.delete(slug);
            const symbols = Array.from(entry.symbols.keys());
            // @ts-ignore
            thisQuote(symbols, queryOptionsOverrides, moduleOptions)
                .then((results) => {
                for (const result of results) {
                    for (const promise of entry.symbols.get(result.symbol)) {
                        promise.resolve(result);
                        promise.resolved = true;
                    }
                }
                // Check for symbols we asked for and didn't get back,
                // e.g. non-existent symbols (#150)
                for (const [_, promises] of entry.symbols) {
                    for (const promise of promises) {
                        if (!promise.resolved) {
                            promise.resolve(undefined);
                        }
                    }
                }
            })
                .catch((error) => {
                for (const symbolPromiseCallbacks of entry.symbols.values())
                    for (const promise of symbolPromiseCallbacks)
                        promise.reject(error);
            });
        }, DEBOUNCE_TIME);
    });
}
