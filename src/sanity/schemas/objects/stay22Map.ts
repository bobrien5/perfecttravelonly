/* eslint-disable @typescript-eslint/no-explicit-any */
const stay22Map = {
  name: 'stay22Map',
  title: 'Stay22 Map',
  type: 'object',
  fields: [
    {
      name: 'address',
      title: 'Address or destination',
      type: 'string',
      description: 'For example: Punta Cana, Dominican Republic',
      validation: (r: any) => r.required(),
    },
    { name: 'checkin', title: 'Check-in (YYYY-MM-DD, optional)', type: 'string' },
    { name: 'checkout', title: 'Check-out (YYYY-MM-DD, optional)', type: 'string' },
  ],
  preview: {
    select: { address: 'address' },
    prepare({ address }: { address?: string }) {
      return { title: address ? `Stay22 Map: ${address}` : 'Stay22 Map' };
    },
  },
};

export default stay22Map;
