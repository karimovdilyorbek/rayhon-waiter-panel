import React, { useState } from "react";
import { Layout, Card, Button, Input, List, Badge, Space, Typography, Divider, Row, Col, Collapse } from "antd";
import { QrcodeOutlined, LogoutOutlined } from "@ant-design/icons";
import { formatPrice } from "../utils/formatPrice";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

/* ===== MENU ===== */
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

  /* ===== HELPERS ===== */
  const isTableBusy = (table) => orders.some((o) => o.table === table && o.status === "ACTIVE");

  const calcTotal = (items) => items.reduce((s, i) => s + i.price * i.qty, 0);

  /* ===== ORDER FORM ===== */
  const addItem = (item) => {
    const exist = orderItems.find((i) => i.id === item.id);
    if (exist) {
      setOrderItems(orderItems.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setOrderItems([...orderItems, { ...item, qty: 1 }]);
    }
  };

  const changeQty = (id, diff) => {
    setOrderItems(orderItems.map((i) => (i.id === id ? { ...i, qty: i.qty + diff } : i)).filter((i) => i.qty > 0));
  };

  const cancelOrder = () => {
    setOrderItems([]);
    setActiveTable(null);
  };

  const submitOrder = () => {
    if (!activeTable || orderItems.length === 0) return;

    setOrders([
      ...orders,
      {
        id: Date.now(),
        table: activeTable,
        items: orderItems,
        total: calcTotal(orderItems),
        status: "ACTIVE",
      },
    ]);

    setOrderItems([]);
    setActiveTable(null);
  };

  /* ===== TABLE ACTIONS ===== */
  const requestBill = (id) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: "IN_PROGRESS" } : o)));
  };

  const activeOrders = orders.filter((o) => o.status === "ACTIVE");
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ===== HEADER ===== */}
      <Header
        style={{
          background: "#14532d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          Rayhon – Ofitsiant
        </Title>
        <Button icon={<LogoutOutlined />} danger>
          Chiqish
        </Button>
      </Header>

      <Content style={{ padding: 12 }}>
        {/* ===== TABLE SELECT ===== */}
        <Card title="Stol tanlash" style={{ marginBottom: 12 }}>
          <Space style={{ width: "100%" }}>
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
                if (isTableBusy(tableNumber)) {
                  alert(`Stol ${tableNumber} hozir band`);
                  return;
                }
                setActiveTable(tableNumber);
                setTableNumber("");
              }}>
              Boshlash
            </Button>
          </Space>
        </Card>

        {/* ===== ORDER FORM ===== */}
        {activeTable && (
          <Card title={`Stol ${activeTable} uchun zakaz`} style={{ marginBottom: 12 }}>
            <Row gutter={[8, 8]}>
              {menuItems.map((item) => (
                <Col xs={12} sm={12} key={item.id}>
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
                <List.Item
                  actions={[
                    <Button onClick={() => changeQty(item.id, -1)}>-</Button>,
                    <Button onClick={() => changeQty(item.id, 1)}>+</Button>,
                  ]}>
                  <Text>
                    {item.qty}x {item.name}
                  </Text>
                  <Text strong>{formatPrice(item.qty * item.price)}</Text>
                </List.Item>
              )}
            />

            <Divider />
            <Title level={5}>Jami: {formatPrice(calcTotal(orderItems))}</Title>

            <Space style={{ width: "100%" }}>
              <Button danger block onClick={cancelOrder}>
                Bekor qilish
              </Button>
              <Button type="primary" block onClick={submitOrder}>
                Zakaz yuborish
              </Button>
            </Space>
          </Card>
        )}

        {/* ===== ACTIVE / IN PROGRESS ===== */}
        <Row gutter={[12, 12]}>
          {/* ACTIVE */}
          <Col xs={24} md={12}>
            <Title level={4}>Faol stollar</Title>
            <Collapse accordion>
              {activeOrders.map((o) => (
                <Panel
                  key={o.id}
                  header={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}>
                      <Text strong>Stol {o.table}</Text>
                      <Badge status="processing" text={formatPrice(o.total)} />
                      <Button
                        danger
                        size="small"
                        block
                        onClick={(e) => {
                          e.stopPropagation();
                          requestBill(o.id);
                        }}>
                        Hisob so‘rash
                      </Button>
                    </div>
                  }>
                  <List
                    size="small"
                    dataSource={o.items}
                    renderItem={(i) => (
                      <List.Item>
                        {i.qty}x {i.name}
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          </Col>

          {/* IN PROGRESS */}
          <Col xs={24} md={12}>
            <Title level={4}>Jarayonda</Title>
            {inProgressOrders.map((o) => (
              <Card key={o.id} style={{ marginBottom: 8 }}>
                <Text strong>Stol {o.table}</Text>
                <br />
                <Text type="secondary">Kassirda — {formatPrice(o.total)}</Text>
              </Card>
            ))}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
