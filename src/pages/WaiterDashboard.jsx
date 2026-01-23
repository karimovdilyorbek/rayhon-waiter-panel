import { useState, useEffect, useRef } from "react";
import { QrCode } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

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

import {
  QrcodeOutlined,
  LogoutOutlined,
  CheckCircleTwoTone,
  DollarTwoTone,
  CloseCircleTwoTone,
  PlusCircleFilled,
  MinusCircleFilled,
} from "@ant-design/icons";

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

export default function RestaurantWaiterApp() {
  const isMobile = window.innerWidth <= 420;

  /* ===== QR STATE ===== */
  const [activeTab, setActiveTab] = useState("scan");
  const scannerRef = useRef(null);

  /* ===== TABLE STATE ===== */
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem("tables");
    return saved ? JSON.parse(saved) : Array(30).fill(false);
  });

  const [tableNumber, setTableNumber] = useState("");
  const [activeTable, setActiveTable] = useState(null);

  /* ===== ORDER STATE ===== */
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inProgressVisibleId, setInProgressVisibleId] = useState(null);

  /* ===== LOCAL STORAGE ===== */
  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
  }, [tables]);

  /* ===== QR SCANNER ===== */
  useEffect(() => {
    if (activeTab === "scan" && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);

      scanner.render(
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {},
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [activeTab]);

  /* ===== QR HANDLE ===== */
  const handleScan = (value) => {
    const tableNum = parseInt(value);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 30) return;
    if (tables[tableNum - 1]) return;

    const newTables = [...tables];
    newTables[tableNum - 1] = true;
    setTables(newTables);

    /* 🔥 MUHIM JOY */
    setTableNumber(String(tableNum));
    setActiveTable(String(tableNum));
    setActiveTab("service");
  };

  /* ===== ORDER LOGIC ===== */
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
      <Header style={{ background: "#14532d" }}>
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          Rayhon — Ofitsiant
        </Title>
      </Header>

      <Content style={{ padding: 12 }}>
        {/* ===== SCAN PANEL ===== */}
        {activeTab === "scan" && (
          <div className="bg-white p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">QR Scan</h2>
            <div id="qr-reader"></div>
          </div>
        )}

        {/* ===== SERVICE PANEL ===== */}
        {activeTab === "service" && activeTable && (
          <Card title={`Stol ${activeTable} uchun zakaz`}>
            <Row gutter={[8, 8]}>
              {menuItems.map((item) => (
                <Col xs={12} key={item.id}>
                  <Button block disabled={!item.available} onClick={() => addItem(item)}>
                    {item.name}
                    <br />
                    {formatPrice(item.price)}
                  </Button>
                </Col>
              ))}
            </Row>

            <Divider />

            <List
              dataSource={orderItems}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button onClick={() => changeQty(item.id, -1)}>
                      <MinusCircleFilled />
                    </Button>,
                    <Button onClick={() => changeQty(item.id, 1)}>
                      <PlusCircleFilled />
                    </Button>,
                  ]}>
                  {item.qty}x {item.name}
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
      </Content>
    </Layout>
  );
}
