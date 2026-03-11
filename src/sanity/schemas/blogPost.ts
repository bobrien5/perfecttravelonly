/* eslint-disable @typescript-eslint/no-explicit-any */
const blogPost = {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'wordpress', title: 'WordPress Sync' },
  ],
  fields: [
    // ── Content ──────────────────────────────────────────────
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      group: 'content',
      options: { list: ['allinclusivehq', 'vacationpro'] },
      initialValue: 'vacationpro',
      validation: (r: any) => r.required(),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (r: any) => r.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: (r: any) => r.required(),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'content',
      options: { list: ['draft', 'published'] },
      initialValue: 'draft',
    },
    { name: 'excerpt', title: 'Excerpt', type: 'text', group: 'content', rows: 3 },
    {
      name: 'body',
      title: 'Content',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (r: any) =>
                      r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
                  },
                  { name: 'blank', type: 'boolean', title: 'Open in new tab' },
                ],
              },
            ],
          },
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    },
    {
      name: 'blogCategory',
      title: 'Category',
      type: 'reference',
      group: 'content',
      to: [{ type: 'blogCategory' }],
    },
    {
      name: 'blogTags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'blogTag' }] }],
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
      group: 'content',
      initialValue: 'VacationPro Editorial',
    },
    { name: 'publishedAt', title: 'Published Date', type: 'datetime', group: 'content' },
    { name: 'readTime', title: 'Read Time', type: 'string', group: 'content' },

    // Legacy fields (hidden, kept for backward compat with existing VacationPro data)
    { name: 'image', title: 'Image URL (Legacy)', type: 'url', hidden: true },
    { name: 'category', title: 'Category (Legacy)', type: 'string', hidden: true },
    { name: 'date', title: 'Published Date (Legacy)', type: 'string', hidden: true },

    // ── SEO ──────────────────────────────────────────────────
    { name: 'seoTitle', title: 'SEO Title', type: 'string', group: 'seo' },
    { name: 'metaDescription', title: 'Meta Description', type: 'text', group: 'seo', rows: 2 },
    { name: 'focusKeyphrase', title: 'Focus Keyphrase', type: 'string', group: 'seo' },

    // ── WordPress Sync ───────────────────────────────────────
    {
      name: 'bodyHtml',
      title: 'Body HTML',
      type: 'text',
      group: 'wordpress',
      description: 'Rendered HTML for WordPress sync. Auto-generated or populated during migration.',
      readOnly: true,
    },
    { name: 'wpPostId', title: 'WordPress Post ID', type: 'number', group: 'wordpress', readOnly: true },
    {
      name: 'wpSyncStatus',
      title: 'Sync Status',
      type: 'string',
      group: 'wordpress',
      options: { list: ['pending', 'synced', 'error'] },
      readOnly: true,
    },
    { name: 'wpLastSyncedAt', title: 'Last Synced', type: 'datetime', group: 'wordpress', readOnly: true },
    { name: 'wpPermalink', title: 'WordPress URL', type: 'url', group: 'wordpress', readOnly: true },
  ],
  orderings: [
    { title: 'Published Date (Newest)', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
    { title: 'Title A-Z', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'brand', media: 'featuredImage' },
  },
};
export default blogPost;
