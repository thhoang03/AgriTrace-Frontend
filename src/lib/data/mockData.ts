export type BatchStatus =
  | "Harvested"
  | "Processing"
  | "Packaged"
  | "In Transit"
  | "Distributed"
  | "At Retail"
  | "Recalled";

export interface Batch {
  id: string;
  product: string;
  category: string;
  image: string;
  farm: string;
  farmer: string;
  harvestDate: string;
  quantity: number;
  weight: string;
  status: BatchStatus;
  location: string;
  gps: string;
}

export interface TimelineEvent {
  id: string;
  stage: string;
  icon: string;
  date: string;
  time: string;
  organization: string;
  location: string;
  employee: string;
  description: string;
  temp?: string;
  humidity?: string;
  hash: string;
  prevHash: string;
  verified: boolean;
}

export interface RecallItem {
  id: string;
  batchId: string;
  product: string;
  reason: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  affectedCompanies: number;
  status: "Active" | "Resolved" | "Pending";
  createdDate: string;
}

export interface UserItem {
  id: string;
  avatar: string;
  username: string;
  fullName: string;
  organization: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  phone: string;
  email: string;
}

export const batches: Batch[] = [
  {
    id: "BTH-2024-001",
    product: "Organic Dragon Fruit",
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80",
    farm: "Binh Thuan Dragon Fruit Farm",
    farmer: "Trần Văn Bình",
    harvestDate: "2024-06-15",
    quantity: 2400,
    weight: "2,400 kg",
    status: "At Retail",
    location: "Bình Thuận Province",
    gps: "11.0904° N, 108.0721° E",
  },
  {
    id: "BTH-2024-002",
    product: "Premium Jasmine Rice",
    category: "Grains",
    image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=80&q=80",
    farm: "Mekong Delta Rice Cooperative",
    farmer: "Nguyễn Thị Mai",
    harvestDate: "2024-06-10",
    quantity: 5000,
    weight: "5,000 kg",
    status: "Distributed",
    location: "An Giang Province",
    gps: "10.3759° N, 105.4348° E",
  },
  {
    id: "BTH-2024-003",
    product: "Robusta Coffee",
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1529304344766-6b537de190f8?w=80&q=80",
    farm: "Dak Lak Highland Coffee Estate",
    farmer: "Lê Minh Tuấn",
    harvestDate: "2024-06-01",
    quantity: 800,
    weight: "800 kg",
    status: "Processing",
    location: "Đắk Lắk Province",
    gps: "12.6711° N, 108.0378° E",
  },
  {
    id: "BTH-2024-004",
    product: "Longan Fruit",
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80",
    farm: "Hung Yen Longan Cooperative",
    farmer: "Phạm Thị Hoa",
    harvestDate: "2024-06-20",
    quantity: 1200,
    weight: "1,200 kg",
    status: "In Transit",
    location: "Hưng Yên Province",
    gps: "20.6464° N, 106.0512° E",
  },
  {
    id: "BTH-2024-005",
    product: "Bitter Melon",
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=80&q=80",
    farm: "Da Lat Vegetable Farm",
    farmer: "Đặng Văn Hùng",
    harvestDate: "2024-06-22",
    quantity: 600,
    weight: "600 kg",
    status: "Packaged",
    location: "Lâm Đồng Province",
    gps: "11.9465° N, 108.4419° E",
  },
  {
    id: "BTH-2024-006",
    product: "Durian Monthong",
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80",
    farm: "Tien Giang Durian Orchard",
    farmer: "Võ Văn Nam",
    harvestDate: "2024-05-28",
    quantity: 3200,
    weight: "3,200 kg",
    status: "Recalled",
    location: "Tiền Giang Province",
    gps: "10.4493° N, 106.3422° E",
  },
  {
    id: "BTH-2024-007",
    product: "Black Pepper",
    category: "Spices",
    image: "https://images.unsplash.com/photo-1529304344766-6b537de190f8?w=80&q=80",
    farm: "Phu Quoc Pepper Plantation",
    farmer: "Lý Thị Ngọc",
    harvestDate: "2024-06-18",
    quantity: 400,
    weight: "400 kg",
    status: "Harvested",
    location: "Kiên Giang Province",
    gps: "10.2270° N, 103.9602° E",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "EVT-001",
    stage: "Harvest",
    icon: "🌾",
    date: "Jun 15, 2024",
    time: "06:30 AM",
    organization: "Binh Thuan Dragon Fruit Farm",
    location: "Phan Thiết, Bình Thuận",
    employee: "Trần Văn Bình",
    description: "Manual harvest of Grade A Dragon Fruit. Quality visual inspection performed. Fruit collected in food-grade containers.",
    temp: "28°C",
    humidity: "72%",
    hash: "0x4a7b2c8d9e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b",
    prevHash: "0x0000000000000000000000000000000000000000",
    verified: true,
  },
  {
    id: "EVT-002",
    stage: "Processing",
    icon: "⚙️",
    date: "Jun 16, 2024",
    time: "08:00 AM",
    organization: "Binh Thuan Agricultural Processing Center",
    location: "Phan Thiết, Bình Thuận",
    employee: "Nguyễn Văn Công",
    description: "Washing, sorting, and grading. All fruits meet export standard VietGAP Grade A. Chemical residue test passed.",
    temp: "18°C",
    humidity: "65%",
    hash: "0x5b8c3d9e0f2a4b5c6d7e8f9a0b1c2d3e4f5a6b7c",
    prevHash: "0x4a7b2c8d9e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b",
    verified: true,
  },
  {
    id: "EVT-003",
    stage: "Packaging",
    icon: "📦",
    date: "Jun 16, 2024",
    time: "02:30 PM",
    organization: "Binh Thuan Agricultural Processing Center",
    location: "Phan Thiết, Bình Thuận",
    employee: "Lê Thị Lan",
    description: "Packaged in food-grade boxes with QR label. Weight: 5kg/box. Total 480 boxes. Cold storage at 12°C.",
    temp: "12°C",
    humidity: "80%",
    hash: "0x6c9d4e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    prevHash: "0x5b8c3d9e0f2a4b5c6d7e8f9a0b1c2d3e4f5a6b7c",
    verified: true,
  },
  {
    id: "EVT-004",
    stage: "Transportation",
    icon: "🚚",
    date: "Jun 17, 2024",
    time: "04:00 AM",
    organization: "Vietnam Fresh Logistics Co.",
    location: "Phan Thiết → Ho Chi Minh City",
    employee: "Phạm Văn Đức",
    description: "Cold chain transport in refrigerated truck. Route: Phan Thiết → Ho Chi Minh City (200km). GPS tracked throughout.",
    temp: "10°C",
    humidity: "78%",
    hash: "0x7d0e5f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    prevHash: "0x6c9d4e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    verified: true,
  },
  {
    id: "EVT-005",
    stage: "Distribution",
    icon: "🏭",
    date: "Jun 17, 2024",
    time: "11:00 AM",
    organization: "Saigon Wholesale Market",
    location: "Thủ Đức, Ho Chi Minh City",
    employee: "Trần Thị Bảo",
    description: "Received at central wholesale market. Quality check by market inspectors. Distribution to 24 retail partners.",
    temp: "14°C",
    humidity: "75%",
    hash: "0x8e1f6a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    prevHash: "0x7d0e5f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    verified: true,
  },
  {
    id: "EVT-006",
    stage: "Retail",
    icon: "🏪",
    date: "Jun 18, 2024",
    time: "07:00 AM",
    organization: "VinMart+ Supermarket Chain",
    location: "Ho Chi Minh City — 24 locations",
    employee: "Nguyễn Thị Kim",
    description: "Displayed in fresh produce section. Price tagged with QR for consumer scanning. Expiry: Jun 25, 2024.",
    temp: "16°C",
    humidity: "70%",
    hash: "0x9f2a7b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    prevHash: "0x8e1f6a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    verified: true,
  },
];

export const recalls: RecallItem[] = [
  {
    id: "RCL-2024-001",
    batchId: "BTH-2024-006",
    product: "Durian Monthong",
    reason: "Pesticide residue exceeds VFA standard limit",
    severity: "Critical",
    affectedCompanies: 12,
    status: "Active",
    createdDate: "2024-06-25",
  },
  {
    id: "RCL-2024-002",
    batchId: "BTH-2024-009",
    product: "Green Mango",
    reason: "Mislabeled expiry date",
    severity: "Medium",
    affectedCompanies: 5,
    status: "Resolved",
    createdDate: "2024-06-18",
  },
  {
    id: "RCL-2024-003",
    batchId: "BTH-2024-012",
    product: "Sweet Potato",
    reason: "Possible contamination during processing",
    severity: "High",
    affectedCompanies: 8,
    status: "Pending",
    createdDate: "2024-06-27",
  },
];

export const users: UserItem[] = [
  {
    id: "USR-001",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80",
    username: "admin_van_an",
    fullName: "Nguyễn Văn An",
    organization: "Ministry of Agriculture",
    role: "Administrator",
    status: "Active",
    phone: "+84 901 234 567",
    email: "vanan@mard.gov.vn",
  },
  {
    id: "USR-002",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&q=80",
    username: "farmer_thi_mai",
    fullName: "Nguyễn Thị Mai",
    organization: "Mekong Delta Rice Cooperative",
    role: "Farmer",
    status: "Active",
    phone: "+84 912 345 678",
    email: "thmai@mekongrice.vn",
  },
  {
    id: "USR-003",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&q=80",
    username: "processor_minh_tuan",
    fullName: "Lê Minh Tuấn",
    organization: "Highland Coffee Processors",
    role: "Processor",
    status: "Active",
    phone: "+84 923 456 789",
    email: "minhtuan@hcprocessors.vn",
  },
  {
    id: "USR-004",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=80",
    username: "dist_thi_hoa",
    fullName: "Phạm Thị Hoa",
    organization: "VinMart+ Distribution",
    role: "Distributor",
    status: "Active",
    phone: "+84 934 567 890",
    email: "thihoa@vinmart.vn",
  },
  {
    id: "USR-005",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=80",
    username: "retail_van_hung",
    fullName: "Đặng Văn Hùng",
    organization: "Co.opmart Retail",
    role: "Retailer",
    status: "Inactive",
    phone: "+84 945 678 901",
    email: "vanhung@coopmart.vn",
  },
  {
    id: "USR-006",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&q=80",
    username: "inspector_thi_ngoc",
    fullName: "Lý Thị Ngọc",
    organization: "Vietnam Food Authority",
    role: "Inspector",
    status: "Active",
    phone: "+84 956 789 012",
    email: "thingoc@vfa.gov.vn",
  },
];

export const monthlyProduction = [
  { month: "Jan", quantity: 1820, batches: 42 },
  { month: "Feb", quantity: 1450, batches: 38 },
  { month: "Mar", quantity: 2100, batches: 55 },
  { month: "Apr", quantity: 2450, batches: 61 },
  { month: "May", quantity: 2800, batches: 72 },
  { month: "Jun", quantity: 3100, batches: 85 },
  { month: "Jul", quantity: 2950, batches: 78 },
  { month: "Aug", quantity: 3400, batches: 92 },
  { month: "Sep", quantity: 3200, batches: 88 },
  { month: "Oct", quantity: 2900, batches: 76 },
  { month: "Nov", quantity: 2600, batches: 68 },
  { month: "Dec", quantity: 3600, batches: 98 },
];

export const batchStatusData = [
  { name: "At Retail", value: 1203, color: "#2E7D32" },
  { name: "Distributed", value: 876, color: "#66BB6A" },
  { name: "In Transit", value: 234, color: "#42A5F5" },
  { name: "Processing", value: 189, color: "#FFB300" },
  { name: "Packaged", value: 156, color: "#AB47BC" },
  { name: "Harvested", value: 89, color: "#A5D6A7" },
];

export const inspectionData = [
  { month: "Jan", pass: 38, fail: 3, pending: 1 },
  { month: "Feb", pass: 32, fail: 4, pending: 2 },
  { month: "Mar", pass: 50, fail: 4, pending: 1 },
  { month: "Apr", pass: 58, fail: 2, pending: 1 },
  { month: "May", pass: 68, fail: 3, pending: 1 },
  { month: "Jun", pass: 80, fail: 3, pending: 2 },
];

export const recallTrend = [
  { month: "Jan", recalls: 2 },
  { month: "Feb", recalls: 1 },
  { month: "Mar", recalls: 3 },
  { month: "Apr", recalls: 1 },
  { month: "May", recalls: 2 },
  { month: "Jun", recalls: 3 },
];

export const recentActivities = [
  { id: 1, type: "batch_created", user: "Trần Văn Bình", action: "created new batch", target: "BTH-2024-008 (Mango)", time: "2 mins ago", icon: "📦" },
  { id: 2, type: "inspection_passed", user: "Lý Thị Ngọc", action: "inspection passed", target: "BTH-2024-001 (Dragon Fruit)", time: "15 mins ago", icon: "✅" },
  { id: 3, type: "recall_created", user: "System", action: "recall alert issued for", target: "BTH-2024-006 (Durian)", time: "1 hour ago", icon: "⚠️" },
  { id: 4, type: "qr_scanned", user: "Consumer", action: "QR code scanned for", target: "BTH-2024-002 (Jasmine Rice)", time: "2 hours ago", icon: "📱" },
  { id: 5, type: "supply_event", user: "Phạm Văn Đức", action: "added transport event for", target: "BTH-2024-004 (Longan)", time: "3 hours ago", icon: "🚚" },
  { id: 6, type: "batch_created", user: "Đặng Văn Hùng", action: "created new batch", target: "BTH-2024-007 (Black Pepper)", time: "5 hours ago", icon: "📦" },
];

export interface CategoryMock {
  categoryId: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export const categories: CategoryMock[] = [
  { categoryId: 1, name: "Trái cây tươi", description: "Các loại trái cây tươi thu hoạch trực tiếp từ nông trại", isActive: true },
  { categoryId: 2, name: "Rau củ hữu cơ", description: "Rau củ trồng theo tiêu chuẩn hữu cơ", isActive: true },
  { categoryId: 3, name: "Gạo & Ngũ cốc", description: "Gạo, ngô, đậu các loại", isActive: true },
  { categoryId: 4, name: "Cà phê & Trà", description: "Cà phê nhân, chè các loại", isActive: true },
  { categoryId: 5, name: "Thủy hải sản", description: "Cá, tôm, hải sản đánh bắt và nuôi trồng", isActive: false },
  { categoryId: 6, name: "Gia vị", description: "Tiêu, ớt, muối và các loại gia vị", isActive: true },
  { categoryId: 7, name: "Sữa & Chế phẩm", description: "Sữa tươi, sữa chua, phô mai", isActive: false },
];
