import { useState, useEffect, useRef } from "react";
import {
  Layout,
  Card,
  Button,
  List,
  Badge,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Collapse,
  Popconfirm,
  Empty,
} from "antd";
import {
  LogoutOutlined,
  DollarTwoTone,
  PlusCircleFilled,
  MinusCircleFilled,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  QrcodeOutlined,
} from "@ant-design/icons";
import { Html5QrcodeScanner } from "html5-qrcode";
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
  const isMobile = window.innerWidth <= 800;

  const [activeTable, setActiveTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [scanStarted, setScanStarted] = useState(false);

  const scannerRef = useRef(null);

  /* ===== HELPERS ===== */
  const calcTotal = (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const isTableBusy = (table) => orders.some((o) => o.table === table && o.status === "ACTIVE");

  /* ===== QR SCANNER ===== */
  useEffect(() => {
    if (!scanStarted) return;

    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 220 }, false);

      scanner.render(
        (decodedText) => {
          const tableNum = decodedText.trim();

          if (isTableBusy(tableNum)) {
            alert("Bu stol band");
            return;
          }

          setActiveTable(tableNum);
          setOrderItems([]);
          setScanStarted(false);
        },
        () => {},
      );

      scannerRef.current = scanner;
    }

    return () => {
      scannerRef.current?.clear();
      scannerRef.current = null;
    };
  }, [scanStarted, orders]);

  /* ===== ORDER LOGIC ===== */
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

  /* ===== UI ===== */
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#14532d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          Rayhon — Ofitsiant
        </Title>
        <Button danger size="small" icon={<LogoutOutlined />}>
          Chiqish
        </Button>
      </Header>

      <Content style={{ padding: 12 }}>
        <Row gutter={[12, 12]}>
          {/* ===== SCAN ===== */}
          <Col xs={24} md={12}>
            <Card title="Skanerlash">
              {!scanStarted ? (
                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  size="large"
                  block
                  onClick={() => setScanStarted(true)}>
                  Skanerlashni boshlash
                </Button>
              ) : (
                <div id="qr-reader" />
              )}
            </Card>
          </Col>

          {/* ===== SERVICE ===== */}
          <Col xs={24} md={12}>
            {activeTable && (
              <Card title={`Stol ${activeTable} uchun zakaz`} style={{ marginBottom: 12 }}>
                <Row gutter={[8, 8]}>
                  {menuItems.map((item) => (
                    <Col xs={12} key={item.id}>
                      <Button block disabled={!item.available} onClick={() => addItem(item)}>
                        {item.name}{" "}
                        {item.available ? (
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                        ) : (
                          <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                        )}
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
                        <Button size="small" onClick={() => changeQty(item.id, -1)}>
                          <MinusCircleFilled />
                        </Button>,
                        <Button size="small" onClick={() => changeQty(item.id, 1)}>
                          <PlusCircleFilled />
                        </Button>,
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

                <Button type="primary" block onClick={submitOrder}>
                  Zakaz yuborish
                </Button>
              </Card>
            )}

            <Title level={5}>Faol stollar</Title>
            {activeOrders.length === 0 ? (
              <Empty description="Band stollar yo‘q" />
            ) : (
              <Collapse accordion>
                {activeOrders.map((o) => (
                  <Panel
                    key={o.id}
                    header={
                      <Space>
                        <Text strong>Stol {o.table}</Text>
                        <Badge status="processing" text={formatPrice(o.total)} />
                      </Space>
                    }>
                    <Button block onClick={() => addMoreOrder(o)}>
                      Yana zakaz
                    </Button>

                    <Popconfirm title="Stolni yopasizmi?" onConfirm={() => requestBill(o.id)}>
                      <Button danger block>
                        <DollarTwoTone /> Stolni yopish
                      </Button>
                    </Popconfirm>
                  </Panel>
                ))}
              </Collapse>
            )}

            <Title level={5} style={{ marginTop: 12 }}>
              Jarayonda
            </Title>
            {inProgressOrders.map((o) => (
              <Card key={o.id}>
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
