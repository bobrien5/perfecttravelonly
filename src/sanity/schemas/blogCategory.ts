/* eslint-disable @typescript-eslint/no-explicit-any */
const blogCategory = {
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (r: any) => r.required() },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r: any) => r.required(),
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      options: { list: ['allinclusivehq', 'vacationpro'] },
      validation: (r: any) => r.required(),
    },
    { name: 'description', title: 'Description', type: 'text', rows: 3 },
    {
      name: 'wpCategoryId',
      title: 'WP Category ID',
      type: 'number',
      description: 'WordPress category ID for sync. Auto-populated during migration.',
      readOnly: true,
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'brand' },
  },
};
export default blogCategory;
