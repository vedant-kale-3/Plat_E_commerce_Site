export interface MockUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  joined: string;
  orders: Order[];
}

export interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Shipped' | 'Processing';
  total: number;
  items: {
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
}

export const mockUsers: MockUser[] = [
  {
    email: 'Example@gmail.com',
    password: '12345',
    firstName: 'Jake',
    lastName: 'Amy',
    phone: '+1 (415) 555-0142',
    address: {
      street: '28 Maple Grove Avenue',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      country: 'United States',
    },
    joined: 'March 2024',
    orders: [
      {
        id: 'FNA-2041',
        date: 'Jul 12, 2026',
        status: 'Delivered',
        total: 118.94,
        items: [
          { name: 'Swiss Cheese Vine', image: '/A_image_12_75a15381-4701-4eca-a435-ce855c9437cb.jpg', quantity: 2, price: 24.99 },
          { name: 'Netted Ficus', image: '/netted-ficus-tree-32169816686724.jpg', quantity: 1, price: 89.99 },
        ],
      },
      {
        id: 'FNA-1980',
        date: 'Jun 03, 2026',
        status: 'Delivered',
        total: 54.98,
        items: [
          { name: 'Snake Plant', image: '/DSC_0263.jpg', quantity: 2, price: 27.49 },
        ],
      },
    ],
  },
  {
    email: 'admin@gmail.com',
    password: 'admin@123',
    firstName: 'Sam',
    lastName: 'Rivera',
    phone: '+1 (212) 555-0199',
    address: {
      street: '500 Orchid Street, Apt 11B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
    },
    joined: 'January 2024',
    orders: [
      {
        id: 'FNA-2102',
        date: 'Jul 18, 2026',
        status: 'Shipped',
        total: 179.97,
        items: [
          { name: 'Monstera Deliciosa', image: '/A_image_10_06ce6eee-f675-41b8-b461-efb57f8c42a2.webp', quantity: 1, price: 59.99 },
          { name: 'Bird of Paradise', image: '/1_69c03517-6f5a-4f05-baa1-06df9db2c9d2.jpg', quantity: 2, price: 59.99 },
        ],
      },
      {
        id: 'FNA-1875',
        date: 'May 22, 2026',
        status: 'Delivered',
        total: 34.99,
        items: [
          { name: 'Pothos Golden', image: '/1_da069a19-bb37-40a4-b196-7d0610a89582.jpg', quantity: 1, price: 34.99 },
        ],
      },
    ],
  },
  {
    email: 'Customer@gmail.com',
    password: 'Pass123',
    firstName: 'Maya',
    lastName: 'Chen',
    phone: '+1 (312) 555-0177',
    address: {
      street: '77 Lavender Lane',
      city: 'Chicago',
      state: 'IL',
      zip: '60607',
      country: 'United States',
    },
    joined: 'February 2024',
    orders: [
      {
        id: 'FNA-2155',
        date: 'Jul 19, 2026',
        status: 'Processing',
        total: 84.98,
        items: [
          { name: 'Swiss Cheese Vine', image: '/A_image_12_75a15381-4701-4eca-a435-ce855c9437cb.jpg', quantity: 1, price: 24.99 },
          { name: 'Snake Plant', image: '/DSC_0263.jpg', quantity: 2, price: 29.99 },
        ],
      },
    ],
  },
];

export function findUser(email: string, password: string): MockUser | null {
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}
