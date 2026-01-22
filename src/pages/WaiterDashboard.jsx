import React, { useState } from "react";
import { Layout, Card, Button, Input, List, Badge, Space, Typography, Divider, Row, Col } from "antd";
import { QrcodeOutlined, LogoutOutlined } from "@ant-design/icons";
import { formatPrice } from "../utils/formatPrice";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  { id: 1, name: "Osh", price: 15000 },
  { id: 2, name: "Kabob", price: 18000 },
  { id: 3, name: "Shurva", price: 12000 },
  { id: 4, name: "Manti", price: 14000 },
  { id: 5, name: "Somsa", price: 8000 },
  { id: 6, name: "Choy", price: 3000 },
];

export default function WaiterDashboard() {
  const [tableNumber, setTableNumber] = useState("");
  const [activeTable, setActiveTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const addItem = (item) => {
    const exist = orderItems.find((i) => i.id === item.id);
    if (exist) {
      setOrderItems(orderItems.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setOrderItems([...orderItems, { ...item, qty: 1 }]);
    }
  };

  const total = orderItems.reduce((s, i) => s + i.price * i.qty, 0);

  const submitOrder = () => {
    if (!activeTable || orderItems.length === 0) return;

    setOrders([
      ...orders,
      {
        id: Date.now(),
        table: activeTable,
        items: orderItems,
        total,
      },
    ]);

    setOrderItems([]);
    setActiveTable(null);
  };

  const requestBill = (order) => {
    alert(`Stol ${order.table} uchun hisob kassirga yuborildi`);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#14532d",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>
          Rayhon – Ofitsiant
        </Title>
        <Button icon={<LogoutOutlined />} danger>
          Chiqish
        </Button>
      </Header>

      <Content style={{ padding: 16 }}>
        {/* Stol tanlash */}
        <Card title="Stol tanlash" style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="Stol raqami"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => {
                if (!tableNumber) return;
                setActiveTable(tableNumber);
                setTableNumber("");
              }}>
              Boshlash
            </Button>
          </Space>
        </Card>

        {/* Zakaz berish */}
        {activeTable && (
          <Card title={`Stol ${activeTable} uchun zakaz`} style={{ marginBottom: 16 }}>
            <Row gutter={[8, 8]}>
              {menuItems.map((item) => (
                <Col span={12} key={item.id}>
                  <Button block onClick={() => addItem(item)}>
                    {item.name}
                    <br />
                    <Text type="secondary">{formatPrice(item.price)}</Text>
                  </Button>
                </Col>
              ))}
            </Row>

            <Divider />

            <List
              dataSource={orderItems}
              locale={{ emptyText: "Zakaz yo‘q" }}
              renderItem={(item) => (
                <List.Item>
                  <Text>
                    {item.qty}x {item.name}
                  </Text>
                  <Text strong>{formatPrice(item.qty * item.price)}</Text>
                </List.Item>
              )}
            />

            <Divider />
            <Title level={4}>Jami: {formatPrice(total)}</Title>

            <Button type="primary" block size="large" onClick={submitOrder}>
              Zakaz yuborish
            </Button>
          </Card>
        )}

        {/* Faol stollar */}
        <Title level={4}>Faol stollar</Title>
        <Space direction="vertical" style={{ width: "100%" }}>
          {orders.map((order) => (
            <Card key={order.id}>
              <Text strong>Stol {order.table}</Text>

              <List
                size="small"
                dataSource={order.items}
                renderItem={(i) => (
                  <List.Item>
                    {i.qty}x {i.name}
                  </List.Item>
                )}
              />

              <Badge status="processing" text={`Jami: ${formatPrice(order.total)}`} />

              <Button danger block style={{ marginTop: 8 }} onClick={() => requestBill(order)}>
                Hisob so‘rash
              </Button>
            </Card>
          ))}
        </Space>
      </Content>
    </Layout>
  );
}
