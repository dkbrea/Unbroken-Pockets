// A client-side entry point for Turbopack builds. Includes logic to load chunks,
// but does not include development-time features like hot module reloading.
import '../lib/require-instrumentation-client';
// TODO: Remove use of `any` type.
import { initialize, version, router, emitter, hydrate } from './';
// TODO: This seems necessary, but is a module in the `dev` directory.
import { displayContent } from './dev/fouc';
window.next = {
    version: "" + version + "-turbo",
    // router is initialized later so it has to be live-binded
    get router () {
        return router;
    },
    emitter
};
self.__next_set_public_path__ = ()=>{};
self.__webpack_hash__ = '';
initialize({}).then(()=>{
    // for the page loader
    ;
    self.__turbopack_load_page_chunks__ = (page, chunksData)=>{
        const chunkPromises = chunksData.map(__turbopack_load__);
        Promise.all(chunkPromises).catch((err)=>console.error('failed to load chunks for page ' + page, err));
    };
    return hydrate({
        beforeRender: displayContent
    });
}).catch((err)=>{
    console.error('Error was not caught', err);
});

//# sourceMappingURL=next-turbopack.js.map