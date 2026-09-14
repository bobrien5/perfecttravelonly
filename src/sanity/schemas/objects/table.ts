/* eslint-disable @typescript-eslint/no-explicit-any */
const table = {
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    {
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'tableRow',
          fields: [
            {
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
        },
      ],
      validation: (r: any) => r.required().min(1),
    },
  ],
  preview: {
    select: { rows: 'rows' },
    prepare({ rows }: { rows?: Array<{ cells?: string[] }> }) {
      const first = rows?.[0]?.cells?.join(' | ') || '';
      return { title: `Table: ${first}`.slice(0, 80) };
    },
  },
};

export default table;
