export const users = [
  {
    id: '410a04b7-8dd4-4b80-8c0d-03ac8974c456',
    name: 'User Test',
    email: 'user@nextmail.com',
    password: 'password123',
  },
];

export const customers = [
  {
    id: '39c4cd7f-2b53-4686-9c0c-7724e65d27e2',
    name: 'Amy Burns',
    email: 'amy@burns.com',
    image_url: '/customers/amy-burns.png',
  },
  {
    id: '13d07535-c59e-4157-a011-f8d2ef4e48c2',
    name: 'Balazs Orban',
    email: 'balazs@orban.com',
    image_url: '/customers/balazs-orban.png',
  },
];

export const invoices = [
  {
    customer_id: '39c4cd7f-2b53-4686-9c0c-7724e65d27e2',
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
  },
  {
    customer_id: '13d07535-c59e-4157-a011-f8d2ef4e48c2',
    amount: 20348,
    status: 'pending',
    date: '2022-11-14',
  },
];

export const revenue = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
];