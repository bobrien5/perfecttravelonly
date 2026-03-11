/* eslint-disable @typescript-eslint/no-explicit-any */
const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (r: any) => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (r: any) => r.required() },
    { name: 'description', title: 'Description', type: 'text', rows: 4 },
    { name: 'shortDescription', title: 'Short Description', type: 'text', rows: 2 },
    { name: 'icon', title: 'Icon (Emoji)', type: 'string' },
    { name: 'heroImage', title: 'Hero Image URL', type: 'url' },
    { name: 'dealCount', title: 'Deal Count', type: 'number' },
    { name: 'seoTitle', title: 'SEO Title', type: 'string' },
    { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2 },
  ],
  preview: {
    select: { title: 'name', subtitle: 'icon' },
  },
};
export default category;
