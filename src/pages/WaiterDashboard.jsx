import { useState } from "react";
import {
  Layout,
  Card,
  Button,
  Input,
  List,
  Badge,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Collapse,
  Popconfirm,
} from "antd";
import { QrcodeOutlined, LogoutOutlined } from "@ant-design/icons";
import { formatPrice } from "../utils/formatPrice";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

/* ===== MENU ===== */
const menuItems = [
  { id: 1, name: "Osh", price: 15000, available: true },
  { id: 2, name: "Kabob", price: 18000, available: false },
  { id: 3, name: "Shurva", price: 12000, available: true },
  { id: 4, name: "Manti", price: 14000, available: true },
  { id: 5, name: "Somsa", price: 8000, available: false },
  { id: 6, name: "Choy", price: 3000, available: true },
];

export default function WaiterDashboard() {
  const [tableNumber, setTableNumber] = useState("");
  const [activeTable, setActiveTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const [inProgressVisibleId, setInProgressVisibleId] = useState(null);

  const calcTotal = (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const isTableBusy = (table) => orders.some((o) => o.table === table && o.status === "ACTIVE");

  const addItem = (item) => {
    if (!item.available) return;

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

  const cancelOrder = () => {
    setOrderItems([]);
    setActiveTable(null);
  };

  const addMoreOrder = (order) => {
    setActiveTable(order.table);
    setOrderItems(order.items);
    setOrders(orders.filter((o) => o.id !== order.id));
  };

  const requestBill = (id) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: "IN_PROGRESS" } : o)));
  };

  const activeOrders = orders.filter((o) => o.status === "ACTIVE");
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#14532d", display: "flex", justifyContent: "space-between" }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          Rayhon – Ofitsiant
        </Title>
        <Button danger icon={<LogoutOutlined />}>
          Chiqish
        </Button>
      </Header>

      <Content style={{ padding: 12 }}>
        <Card title="Stol tanlash" style={{ marginBottom: 12 }}>
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
                if (isTableBusy(tableNumber)) {
                  alert("Bu stol band");
                  return;
                }
                setActiveTable(tableNumber);
                setTableNumber("");
              }}>
              Boshlash
            </Button>
          </Space>
        </Card>

        {activeTable && (
          <Card title={`Stol ${activeTable} uchun zakaz`} style={{ marginBottom: 12 }}>
            <Row gutter={[8, 8]}>
              {menuItems.map((item) => (
                <Col xs={12} key={item.id}>
                  <Button block disabled={!item.available} onClick={() => addItem(item)}>
                    {item.name}{" "}
                    <Text style={{ color: item.available ? "green" : "red" }}>{item.available ? "✅" : "❌"}</Text>
                    <br />
                    <Text type="secondary">{formatPrice(item.price)}</Text>
                  </Button>
                </Col>
              ))}
            </Row>

            <Divider />

            <List
              dataSource={orderItems}
              locale={{ emptyText: "Zakaz yo'q" }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button size="small" onClick={() => changeQty(item.id, -1)}>
                      -
                    </Button>,
                    <Button size="small" onClick={() => changeQty(item.id, 1)}>
                      +
                    </Button>,
                  ]}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Text>
                      {item.qty}x {item.name}
                    </Text>
                  </div>
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

        <Row gutter={[12, 12]}>
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
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}>
                      <Text strong>Stol {o.table}</Text>
                      <Badge status="processing" text={formatPrice(o.total)} />
                    </div>
                  }>
                  <List
                    size="small"
                    dataSource={o.items}
                    style={{ marginBottom: 12 }}
                    renderItem={(i) => (
                      <List.Item
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}>
                        <Text>
                          {i.qty}x {i.name}
                        </Text>
                        <Text strong>{formatPrice(i.qty * i.price)}</Text>
                      </List.Item>
                    )}
                  />

                  <Space direction="vertical" style={{ width: "100%" }} size={8}>
                    <Button type="default" block onClick={() => addMoreOrder(o)}>
                      Yana zakaz berish
                    </Button>

                    <Popconfirm
                      title="Hisobni yopishga ishonchingiz komilmi?"
                      okText="Ha"
                      cancelText="Yo'q"
                      onConfirm={() => requestBill(o.id)}>
                      <Button danger block>
                        💰 Stolni Yopish
                      </Button>
                    </Popconfirm>
                  </Space>
                </Panel>
              ))}
            </Collapse>
          </Col>

          <Col xs={24} md={12}>
            <Title level={4}>Jarayonda</Title>
            {inProgressOrders.map((o) => (
              <Card
                key={o.id}
                style={{ marginBottom: 8 }}
                onClick={() => setInProgressVisibleId(inProgressVisibleId === o.id ? null : o.id)}>
                <Text strong>Stol {o.table}</Text>
                <br />
                <Text type="secondary">Kassirda — {formatPrice(o.total)}</Text>

                {inProgressVisibleId === o.id && (
                  <List
                    size="small"
                    dataSource={o.items}
                    style={{ marginTop: 8 }}
                    renderItem={(i) => (
                      <List.Item
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}>
                        <Text>
                          {i.qty}x {i.name}
                        </Text>
                        <Text strong>{formatPrice(i.qty * i.price)}</Text>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            ))}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
