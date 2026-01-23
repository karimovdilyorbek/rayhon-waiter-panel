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
import { LogoutOutlined, DollarTwoTone, PlusCircleFilled, MinusCircleFilled } from "@ant-design/icons";
import { Html5QrcodeScanner } from "html5-qrcode";
import { formatPrice } from "../utils/formatPrice";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const menuItems = [
  { id: 1, name: "Osh", price: 15000, available: true },
  { id: 2, name: "Kabob", price: 18000, available: true },
  { id: 3, name: "Shurva", price: 12000, available: true },
  { id: 4, name: "Manti", price: 14000, available: true },
  { id: 5, name: "Somsa", price: 8000, available: true },
  { id: 6, name: "Choy", price: 3000, available: true },
];

export default function WaiterDashboard() {
  const isMobile = window.innerWidth <= 420;

  const [activeTab, setActiveTab] = useState("scan"); // scan | service
  const [activeTable, setActiveTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const scannerRef = useRef(null);

  /* ================= HELPERS ================= */
  const calcTotal = (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const isTableBusy = (table) => orders.some((o) => o.table === table && o.status === "ACTIVE");

  /* ================= QR SCANNER ================= */
  useEffect(() => {
    if (activeTab !== "scan") return;

    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);

      scanner.render(
        (decodedText) => {
          const tableNum = decodedText.trim();

          if (isTableBusy(tableNum)) {
            alert("Bu stol band");
            return;
          }

          setActiveTable(tableNum);
          setOrderItems([]);
          setActiveTab("service");
        },
        () => {},
      );

      scannerRef.current = scanner;
    }

    return () => {
      scannerRef.current?.clear();
      scannerRef.current = null;
    };
  }, [activeTab, orders]);

  /* ================= ORDER LOGIC ================= */
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

  /* ================= UI ================= */
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
        <Button danger size="small" icon={<LogoutOutlined />}>
          Chiqish
        </Button>
      </Header>

      <Content style={{ padding: 12 }}>
        {/* TABS */}
        <Space style={{ marginBottom: 12 }}>
          <Button type={activeTab === "scan" ? "primary" : "default"} onClick={() => setActiveTab("scan")}>
            Scan
          </Button>
          <Button type={activeTab === "service" ? "primary" : "default"} onClick={() => setActiveTab("service")}>
            Xizmat
          </Button>
        </Space>

        {/* SCAN PANEL */}
        {activeTab === "scan" && (
          <Card title="QR skanerlash">
            <div id="qr-reader" />
            <Text type="secondary">Stol QR kodini skaner qiling</Text>
          </Card>
        )}

        {/* SERVICE PANEL */}
        {activeTab === "service" && (
          <>
            {activeTable && (
              <Card title={`Stol ${activeTable} uchun zakaz`} style={{ marginBottom: 12 }}>
                <Row gutter={[8, 8]}>
                  {menuItems.map((item) => (
                    <Col xs={24} sm={12} key={item.id}>
                      <Button block onClick={() => addItem(item)}>
                        {item.name} <br />
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

            <Row gutter={[12, 12]}>
              {/* FAOL */}
              <Col xs={24} md={12}>
                <Title level={4}>Faol stollar</Title>
                {activeOrders.length === 0 ? (
                  <Empty description="Band stollar yo‘q" />
                ) : (
                  <Collapse accordion>
                    {activeOrders.map((o) => (
                      <Panel
                        key={o.id}
                        header={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}>
                            <Text strong>Stol {o.table}</Text>
                            <Badge status="processing" text={formatPrice(o.total)} />
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

                        <Button block onClick={() => addMoreOrder(o)}>
                          Yana zakaz berish
                        </Button>

                        <Popconfirm title="Stolni yopasizmi?" onConfirm={() => requestBill(o.id)}>
                          <Button danger block style={{ marginTop: 6 }}>
                            <DollarTwoTone /> Stolni yopish
                          </Button>
                        </Popconfirm>
                      </Panel>
                    ))}
                  </Collapse>
                )}
              </Col>

              {/* JARAYONDA */}
              <Col xs={24} md={12}>
                <Title level={4}>Jarayonda</Title>
                {inProgressOrders.map((o) => (
                  <Card key={o.id} style={{ marginBottom: 8 }}>
                    <Text strong>Stol {o.table}</Text>
                    <br />
                    <Text type="secondary">Kassirda — {formatPrice(o.total)}</Text>
                    <Divider />
                    <List
                      size="small"
                      dataSource={o.items}
                      renderItem={(i) => (
                        <List.Item>
                          {i.qty}x {i.name}
                        </List.Item>
                      )}
                    />
                  </Card>
                ))}
              </Col>
            </Row>
          </>
        )}
      </Content>
    </Layout>
  );
}
