import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from '@/sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'vacationpro',
  title: 'VacationPro + AIHQ',

  projectId,
  dataset,

  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('VacationPro')
              .child(
                S.list()
                  .title('VacationPro')
                  .items([
                    S.documentTypeListItem('deal').title('Deals'),
                    S.documentTypeListItem('destination').title('Destinations'),
                    S.documentTypeListItem('category').title('Categories'),
                    S.listItem()
                      .title('Blog Posts')
                      .child(
                        S.documentList()
                          .title('VacationPro Blog Posts')
                          .filter('_type == "blogPost" && (brand == "vacationpro" || !defined(brand))')
                      ),
                  ])
              ),
            S.listItem()
              .title('All-Inclusive HQ')
              .child(
                S.list()
                  .title('All-Inclusive HQ')
                  .items([
                    S.listItem()
                      .title('Blog Posts')
                      .child(
                        S.documentList()
                          .title('AIHQ Blog Posts')
                          .filter('_type == "blogPost" && brand == "allinclusivehq"')
                      ),
                    S.listItem()
                      .title('Categories')
                      .child(
                        S.documentList()
                          .title('AIHQ Blog Categories')
                          .filter('_type == "blogCategory" && brand == "allinclusivehq"')
                      ),
                    S.listItem()
                      .title('Tags')
                      .child(
                        S.documentList()
                          .title('AIHQ Blog Tags')
                          .filter('_type == "blogTag" && brand == "allinclusivehq"')
                      ),
                  ])
              ),
            S.divider(),
            S.documentTypeListItem('blogCategory').title('All Blog Categories'),
            S.documentTypeListItem('blogTag').title('All Blog Tags'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
