import destination from './destination';
import category from './category';
import blogPost from './blogPost';
import blogCategory from './blogCategory';
import blogTag from './blogTag';
import stay22Map from './objects/stay22Map';
import table from './objects/table';
import resort from './resort';
// Re-registered 2026-09-22. The July 2026 catalog removal took `deal` out of
// this list but left S.documentTypeListItem('deal') in sanity.config.ts, and
// referencing an unregistered type crashes the structure tool on load, which
// is why the Studio would not open. Deal documents were never deleted, so
// unregistering the schema only hid them from editing.
import deal from './deal';

export const schemaTypes = [destination, category, blogPost, blogCategory, blogTag, stay22Map, table, resort, deal];
