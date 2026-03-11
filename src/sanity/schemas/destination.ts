/* eslint-disable @typescript-eslint/no-explicit-any */
const destination = {
  name: 'destination',
  title: 'Destination',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (r: any) => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (r: any) => r.required() },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'region', title: 'Region', type: 'string' },
    { name: 'heroImage', title: 'Hero Image URL', type: 'url' },
    { name: 'description', title: 'Description', type: 'text', rows: 6 },
    { name: 'shortDescription', title: 'Short Description', type: 'text', rows: 2 },
    { name: 'dealCount', title: 'Deal Count', type: 'number', description: 'Number of deals to display' },
    { name: 'categories', title: 'Available Categories', type: 'array', of: [{ type: 'string' }] },
    { name: 'faq', title: 'FAQ', type: 'array', of: [{ type: 'object', fields: [{ name: 'question', title: 'Question', type: 'string' }, { name: 'answer', title: 'Answer', type: 'text' }] }] },
    { name: 'seoTitle', title: 'SEO Title', type: 'string' },
    { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2 },
  ],
  preview: {
    select: { title: 'name', subtitle: 'country' },
  },
};
export default destination;
