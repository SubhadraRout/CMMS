const KEY = "cms_workorders";

export function getOrders() {
  return JSON.parse(sessionStorage.getItem(KEY) || "[]");
}

export function saveOrders(orders) {
  sessionStorage.setItem(KEY, JSON.stringify(orders));
}

export function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}

export function updateOrder(id, patch) {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, ...patch } : o));
  saveOrders(orders);
  return orders;
}

export function deleteOrder(id) {
  const orders = getOrders().filter((o) => o.id !== id);
  saveOrders(orders);
  return orders;
}
