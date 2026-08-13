export const SEED_ORDERS = [
  { id: '10486', customer: 'Layla Mansour', detail: 'Bay 5 · silver Nissan Patrol · pickup in 20 min', type: 'Curbside', items: 14, total: 186.5, status: 'Placed', time: '12:41 PM' },
  { id: '10481', customer: 'Hessa Al Nuaimi', detail: 'Bay 3 · white Land Cruiser · waiting 4 min', type: 'Curbside', items: 9, total: 142.0, status: 'Customer Arrived', time: '12:12 PM' },
  { id: '10478', customer: 'Omar Farouk', detail: 'Bay 1 · grey Camry · waiting 1 min', type: 'Curbside', items: 6, total: 88.25, status: 'Customer Arrived', time: '12:04 PM' },
  { id: '10475', customer: 'Fatima Al Amri', detail: 'Villa 22, Al Wasl · Ahmed R. assigned', type: 'Delivery', items: 23, total: 412.75, status: 'Out for Delivery', time: '11:52 AM' },
  { id: '10472', customer: 'Youssef Haddad', detail: 'Apt 1204, Marina Heights · slot 1–3 PM', type: 'Delivery', items: 11, total: 164.0, status: 'Packed', time: '11:38 AM' },
  { id: '10469', customer: 'Noura Al Balushi', detail: 'Villa 7, Jumeirah 2 · leave at door', type: 'Delivery', items: 17, total: 298.4, status: 'Placed', time: '11:21 AM' },
  { id: '10465', customer: 'Rashid Khan', detail: 'Bay 2 · blue Sunny', type: 'Curbside', items: 4, total: 54.9, status: 'Ready for Pickup', time: '11:05 AM' },
]

export const SEED_STOCK = { 1: 'out', 2: 'out', 3: 'low', 4: 'low', 5: 'avail', 6: 'avail', 7: 'out', 8: 'low' }

export const DRAWER_LINES = [
  { qty: '2×', name: 'Almarai Fresh Milk 2L', price: 'AED 24.00' },
  { qty: '1×', name: 'Al Ain Tomatoes 1kg', price: 'AED 7.50' },
  { qty: '3×', name: 'Red Bull Sugarfree 250ml', price: 'AED 27.00' },
  { qty: '1×', name: 'Basmati Rice 5kg', price: 'AED 48.00' },
  { qty: '1×', name: 'Medjool Dates 500g', price: 'AED 32.00' },
]

export const CAT_DEFS = [
  { name: 'Fresh produce', nameAr: 'خضار وفواكه', items: 642, share: '32%', state: 'Visible' },
  { name: 'Dairy & eggs', nameAr: 'ألبان وبيض', items: 388, share: '25%', state: 'Visible' },
  { name: 'Pantry & staples', nameAr: 'مواد غذائية', items: 914, share: '19%', state: 'Visible' },
  { name: 'Beverages', nameAr: 'مشروبات', items: 506, share: '14%', state: 'Visible' },
  { name: 'Household', nameAr: 'مستلزمات منزلية', items: 421, share: '10%', state: 'Visible' },
  { name: 'Bakery', nameAr: 'مخبوزات', items: 178, share: '6%', state: 'Visible' },
  { name: 'Frozen', nameAr: 'مجمدات', items: 293, share: '5%', state: 'Hidden' },
  { name: 'Uncategorised', nameAr: 'غير مصنّف', items: 213, share: '—', state: 'Needs fixing' },
]

export const STOCK_DEFS = [
  { id: 1, name: 'Red Bull Sugarfree 250ml', meta: 'Beverages · barcode 9002490100070 · sold out 12 min ago' },
  { id: 2, name: 'Almarai Laban 1L', meta: 'Dairy · barcode 6281007101001' },
  { id: 7, name: 'Iceberg Lettuce (each)', meta: 'Fresh produce · barcode 2000000001234' },
  { id: 3, name: 'Medjool Dates 500g', meta: 'Pantry · barcode 6291100440021 · festive line' },
  { id: 4, name: 'Sunflower Oil 1.8L', meta: 'Pantry · barcode 8690637001458' },
  { id: 8, name: 'Free Range Eggs 30s', meta: 'Dairy · barcode 6291041500213' },
  { id: 5, name: 'Al Ain Tomatoes 1kg', meta: 'Fresh produce · barcode 2000000004567' },
  { id: 6, name: 'Basmati Rice 5kg', meta: 'Pantry · barcode 8901030765432' },
]

export const PROD_DEFS = [
  {
    id: 'p1', name: 'Red Bull Energy Drink', nameAr: 'ريد بُل مشروب الطاقة', category: 'Beverages', price: '9.00', stock: 'Available',
    variants: [
      { name: 'Red Bull Original 250ml', nameAr: 'ريد بُل أصلي ٢٥٠ مل', price: '9.00', stock: 'Available' },
      { name: 'Red Bull Sugarfree 250ml', nameAr: 'ريد بُل بدون سكر ٢٥٠ مل', price: '9.00', stock: 'Out of Stock' },
      { name: 'Red Bull Watermelon 355ml', nameAr: 'ريد بُل بطيخ ٣٥٥ مل', price: '12.50', stock: 'Low Stock' },
    ],
  },
  { id: 'p2', name: 'Almarai Fresh Milk 2L', nameAr: 'ألمراي حليب طازج ٢ لتر', category: 'Dairy', price: '12.00', stock: 'Available' },
  { id: 'p3', name: 'Al Ain Tomatoes 1kg', nameAr: 'طماطم العين ١ كجم', category: 'Fresh produce', price: '7.50', stock: 'Available' },
  { id: 'p4', name: 'Medjool Dates 500g', nameAr: 'تمر مجدول ٥٠٠ جرام', category: 'Pantry', price: '32.00', stock: 'Low Stock' },
  { id: 'p5', name: 'Basmati Rice 5kg', nameAr: 'أرز بسمتي ٥ كجم', category: 'Pantry', price: '48.00', stock: 'Available' },
  { id: 'p6', name: 'Free Range Eggs 30s', nameAr: 'بيض بلدي ٣٠ حبة', category: 'Uncategorised', price: '24.50', stock: 'Low Stock' },
  { id: 'p7', name: 'Iceberg Lettuce (each)', nameAr: 'خس أيسبرغ', category: 'Fresh produce', price: '6.00', stock: 'Out of Stock' },
]

export const BEST_SELLERS = [
  ['Almarai Fresh Milk 2L', 1284, 100],
  ['Al Ain Tomatoes 1kg', 1042, 81],
  ['Free Range Eggs 30s', 918, 71],
  ['Basmati Rice 5kg', 764, 59],
  ['Red Bull Sugarfree 250ml', 690, 54],
  ['Medjool Dates 500g', 612, 48],
]

export const CATEGORY_PERF = [
  ['Fresh produce', 'AED 92,400', 32, 100],
  ['Dairy & eggs', 'AED 71,800', 25, 78],
  ['Pantry & staples', 'AED 54,200', 19, 59],
  ['Beverages', 'AED 40,300', 14, 44],
  ['Household', 'AED 28,900', 10, 31],
]

export const TOP_CUSTOMERS = [
  { initials: 'FA', name: 'Fatima Al Amri', spend: 'AED 2,340', orders: 31, pref: 'Delivery' },
  { initials: 'HN', name: 'Hessa Al Nuaimi', spend: 'AED 1,980', orders: 24, pref: 'Curbside' },
  { initials: 'YH', name: 'Youssef Haddad', spend: 'AED 1,615', orders: 19, pref: 'Delivery' },
  { initials: 'NB', name: 'Noura Al Balushi', spend: 'AED 1,402', orders: 22, pref: 'Delivery' },
  { initials: 'RK', name: 'Rashid Khan', spend: 'AED 1,190', orders: 16, pref: 'Curbside' },
]

export const CREDIT_ROWS = [
  { initials: 'MA', name: 'Mansour Al Zaabi', phone: '+971 50 448 2210', amount: 1840.5, last: '2 Aug 2026', overdue: true },
  { initials: 'SK', name: 'Salma Kareem', phone: '+971 55 903 1187', amount: 960.0, last: '6 Aug 2026', overdue: true },
  { initials: 'AB', name: 'Ali Bin Haider', phone: '+971 52 771 4409', amount: 612.75, last: '9 Aug 2026', overdue: false },
  { initials: 'RK', name: 'Rashid Khan', phone: '+971 50 220 7781', amount: 435.0, last: '10 Aug 2026', overdue: false },
  { initials: 'NB', name: 'Noura Al Balushi', phone: '+971 54 118 6620', amount: 288.4, last: '11 Aug 2026', overdue: false },
  { initials: 'YH', name: 'Youssef Haddad', phone: '+971 56 340 9912', amount: 96.0, last: '11 Aug 2026', overdue: false },
]

export const HISTORY_ROWS = [
  ['10462', 'Fatima Al Amri', 'Delivery', '11 Aug, 10:24 AM', 'Card', 412.75, 'Delivered'],
  ['10458', 'Rashid Khan', 'Curbside', '11 Aug, 09:47 AM', 'Card', 54.9, 'Handed Over'],
  ['10451', 'Mansour Al Zaabi', 'Delivery', '10 Aug, 07:12 PM', 'Credit', 268.0, 'Delivered'],
  ['10447', 'Hessa Al Nuaimi', 'Curbside', '10 Aug, 05:58 PM', 'Card', 142.0, 'Handed Over'],
  ['10441', 'Salma Kareem', 'Delivery', '10 Aug, 02:33 PM', 'Credit', 189.25, 'Delivered'],
  ['10436', 'Youssef Haddad', 'Delivery', '9 Aug, 08:05 PM', 'Card', 164.0, 'Delivered'],
  ['10430', 'Omar Farouk', 'Curbside', '9 Aug, 06:41 PM', 'Card', 88.25, 'Handed Over'],
  ['10424', 'Noura Al Balushi', 'Delivery', '9 Aug, 11:19 AM', 'Credit', 298.4, 'Delivered'],
]

export const STAFF_DEFS = [
  { initials: 'AR', name: 'Ahmed Riyad', vehicle: 'Van · DXB 44219', phone: '+971 50 118 2204', avail: 'On delivery', active: 2, done: 14, avg: '22m', orders: [['10475', 'Fatima Al Amri · Al Wasl', 'Out for Delivery'], ['10472', 'Youssef Haddad · Marina', 'Packed']] },
  { initials: 'BS', name: 'Bilal Sharif', vehicle: 'Bike · DXB 90112', phone: '+971 55 774 6690', avail: 'Available', active: 0, done: 11, avg: '18m', orders: [] },
  { initials: 'KM', name: 'Karim Mostafa', vehicle: 'Van · DXB 33780', phone: '+971 52 664 1187', avail: 'On delivery', active: 1, done: 9, avg: '25m', orders: [['10469', 'Noura Al Balushi · Jumeirah 2', 'Placed']] },
  { initials: 'TA', name: 'Tariq Aziz', vehicle: 'Bike · DXB 51204', phone: '+971 56 220 3341', avail: 'Off shift', active: 0, done: 6, avg: '20m', orders: [] },
]

export const PAYMENTS = [
  { name: 'Card payments', note: 'Visa, Mastercard · settles next day', state: 'Active', style: 'background:#E6F6DE;color:#2E7A12;font-size:12.5px;font-weight:800;padding:7px 12px;border-radius:9px;' },
  { name: 'Shop credit (ledger)', note: 'Trusted customers pay later · limit AED 2,000', state: 'Active', style: 'background:#E6F6DE;color:#2E7A12;font-size:12.5px;font-weight:800;padding:7px 12px;border-radius:9px;' },
  { name: 'Cash on delivery', note: 'Not offered for curbside', state: 'Off', style: 'background:#EEF0EC;color:#7B857F;font-size:12.5px;font-weight:800;padding:7px 12px;border-radius:9px;' },
]

export const ADD_CATS = ['Fresh produce', 'Dairy & eggs', 'Pantry & staples', 'Beverages', 'Household', 'Bakery', 'Frozen']

export const NEW_VARIANTS = [
  { name: 'Original 250ml', nameAr: 'أصلي ٢٥٠ مل', price: '9.00', stock: 'Available', stockStyle: 'display:inline-flex;background:#E6F6DE;color:#2E7A12;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;' },
  { name: 'Sugarfree 250ml', nameAr: 'بدون سكر ٢٥٠ مل', price: '9.00', stock: 'Available', stockStyle: 'display:inline-flex;background:#E6F6DE;color:#2E7A12;font-size:12.5px;font-weight:800;padding:6px 11px;border-radius:9px;' },
]

export const ORDERS_SPARK = [42, 55, 38, 70, 62, 84, 58, 76, 91, 68, 100, 74]

export const CAT_COLORS = ['#47BB1C', '#0B5E86', '#7A4BD0', '#E39A0B', '#B3261E', '#4C5850']
