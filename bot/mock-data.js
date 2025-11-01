
const mockProducts = [
  { id: 1, name: 'Тормозные колодки', price: 4500.00, sku: 'BP-CER-001' },
  { id: 2, name: 'Масляный фильтр Bosch', price: 750.00, sku: 'OF-SYN-002' },
];

const mockUsers = [
    { id: '1', fullName: 'Иван Иванов', email: 'ivan@example.com', role: 'customer', phone: '+79991234567', telegramId: '@ivanov' },
    { id: '2', fullName: 'Петр Петров', email: 'petr@example.com', role: 'manager' },
    { id: '3', fullName: 'Сергей Сергеев', email: 'sergey@example.com', role: 'superadmin' },
    { id: '4', fullName: 'Александр (Админ)', email: 'admin@example.com', role: 'superadmin' },
    { id: '5', fullName: 'Елена Сидорова (Клиент 1)', email: 'client1@example.com', role: 'customer', phone: '11111' },
    { id: '6', fullName: 'Олег Смирнов (Клиент 2)', email: 'client2@example.com', role: 'customer', phone: '22222' },
];

const mockOrders = [
    { id: 'ord1', orderNumber: 101, userId: '1', items: [ { ...mockProducts[0], quantity: 1 } ], total: 4500, status: 'delivered', createdAt: new Date('2023-10-20T14:48:00.000Z').toISOString() },
    { id: 'ord2', orderNumber: 102, userId: '5', items: [ { ...mockProducts[1], quantity: 1 } ], total: 750, status: 'processing', createdAt: new Date('2023-10-25T10:30:00.000Z').toISOString() },
    { id: 'ord3', orderNumber: 103, userId: '6', items: [ { ...mockProducts[0], quantity: 2 } ], total: 9000, status: 'pending', createdAt: new Date().toISOString() },
];

const mockNews = [
    { id: 1, title: 'Новое поступление: тормозные диски Brembo', excerpt: 'Рады сообщить, что наш ассортимент пополнился...', createdAt: new Date('2023-10-28T10:00:00Z').toISOString() },
    { id: 2, title: 'Как выбрать моторное масло для зимы?', excerpt: 'Наши эксперты подготовили подробное руководство...', createdAt: new Date('2023-10-25T12:30:00Z').toISOString() },
    { id: 3, title: 'Акция: -20% на все фильтры MANN-FILTER', excerpt: 'Только до конца месяца! Успейте купить...', createdAt: new Date('2023-10-22T09:00:00Z').toISOString() },
    { id: 4, title: 'График работы в праздничные дни', excerpt: 'Уважаемые клиенты, информируем вас об изменениях...', createdAt: new Date().toISOString() },
];

module.exports = {
    mockUsers,
    mockOrders,
    mockNews,
};