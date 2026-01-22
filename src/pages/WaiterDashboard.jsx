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

const menuItems = [
  { id: 1, name: "Osh", price: 15000, available: true },
  { id: 2, name: "Kabob", price: 18000, available: false },
  { id: 3, name: "Shurva", price: 12000, available: true },
  { id: 4, name: "Manti", price: 14000, available: true },
  { id: 5, name: "Somsa", price: 8000, available: false },
  { id: 6, name: "Choy", price: 3000, available: true },
];

export default function WaiterDashboard() {
  const isMobile = window.innerWidth <= 420;

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
      <Header
        style={{
          background: "#14532d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "0 12px" : "0 24px",
        }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          Rayhon — Ofitsiant
        </Title>
        <Button danger size={isMobile ? "small" : "middle"} icon={<LogoutOutlined />}>
          Chiqish
        </Button>
      </Header>

      <Content style={{ padding: isMobile ? 8 : 12 }}>
        {/* ===== TABLE SELECT ===== */}
        <Card title="Stol tanlash" style={{ marginBottom: 12 }}>
          <Space wrap>
            <Input
              placeholder="Stol raqami"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              style={{ width: isMobile ? 120 : 160 }}
            />
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              size={isMobile ? "small" : "middle"}
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

        {/* ===== ORDER FORM ===== */}
        {activeTable && (
          <Card title={`Stol ${activeTable} uchun zakaz`} style={{ marginBottom: 12 }}>
            <Row gutter={[8, 8]}>
              {menuItems.map((item) => (
                <Col xs={24} sm={12} key={item.id}>
                  <Button
                    block
                    disabled={!item.available}
                    onClick={() => addItem(item)}
                    style={{ padding: isMobile ? "6px 4px" : undefined }}>
                    <Text style={{ fontSize: isMobile ? 13 : 15 }}>
                      {item.name}{" "}
                      <span style={{ color: item.available ? "green" : "red" }}>
                        {item.available ? "✅" : "❌"}
                      </span>
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: isMobile ? 11 : 13 }}>
                      {formatPrice(item.price)}
                    </Text>
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
                    <Button size={isMobile ? "small" : "middle"} onClick={() => changeQty(item.id, -1)}>
                      -
                    </Button>,
                    <Button size={isMobile ? "small" : "middle"} onClick={() => changeQty(item.id, 1)}>
                      +
                    </Button>,
                  ]}>
                  <Text style={{ fontSize: isMobile ? 13 : 14 }}>
                    {item.qty}x {item.name}
                  </Text>
                  <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>
                    {formatPrice(item.qty * item.price)}
                  </Text>
                </List.Item>
              )}
            />

            <Divider />
            <Title level={5} style={{ fontSize: isMobile ? 14 : 16 }}>
              Jami: {formatPrice(calcTotal(orderItems))}
            </Title>

            <Space style={{ width: "100%" }}>
              <Button danger block size={isMobile ? "small" : "middle"} onClick={cancelOrder}>
                Bekor qilish
              </Button>
              <Button type="primary" block size={isMobile ? "small" : "middle"} onClick={submitOrder}>
                Zakaz yuborish
              </Button>
            </Space>
          </Card>
        )}

        {/* ===== ACTIVE & IN_PROGRESS ===== */}
        <Row gutter={[12, 12]}>
          {/* ACTIVE */}
          <Col xs={24} md={12}>
            <Title level={4}>Faol stollar</Title>
            <Collapse accordion>
              {activeOrders.map((o) => (
                <Panel
                  key={o.id}
                  header={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text strong>Stol {o.table}</Text>
                      <Badge status="processing" text={formatPrice(o.total)} />
                    </div>
                  }>
                  <List
                    size="small"
                    dataSource={o.items}
                    renderItem={(i) => (
                      <List.Item style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text>
                          {i.qty}x {i.name}
                        </Text>
                        <Text strong>{formatPrice(i.qty * i.price)}</Text>
                      </List.Item>
                    )}
                  />

                  <Space direction="vertical" style={{ width: "100%" }} size={6}>
                    <Button block onClick={() => addMoreOrder(o)}>
                      Yana zakaz berish
                    </Button>

                    <Popconfirm
                      title="Hisobni yopishga ishonchingiz komilmi?"
                      okText="Ha"
                      cancelText="Yo'q"
                      onConfirm={() => requestBill(o.id)}>
                      <Button danger block>
                        💰 Stolni yopish
                      </Button>
                    </Popconfirm>
                  </Space>
                </Panel>
              ))}
            </Collapse>
          </Col>

          {/* IN PROGRESS */}
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
                    renderItem={(i) => (
                      <List.Item style={{ display: "flex", justifyContent: "space-between" }}>
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
