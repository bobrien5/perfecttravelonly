/* eslint-disable @typescript-eslint/no-explicit-any */
const blogTag = {
  name: 'blogTag',
  title: 'Blog Tag',
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
    {
      name: 'wpTagId',
      title: 'WP Tag ID',
      type: 'number',
      description: 'WordPress tag ID for sync. Auto-populated during migration.',
      readOnly: true,
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'brand' },
  },
};
export default blogTag;
