import React from "react";
import { Layout, Menu, Dropdown, Avatar, Breadcrumb } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Header, Content, Sider } = Layout;

export default function TeacherLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/teacher-home",
      icon: <HomeOutlined />,
      label: <Link to="/teacher-home">Trang chủ</Link>,
    },
    {
      key: "/teacher-classes",
      icon: <TeamOutlined />,
      label: <Link to="/teacher-classes">Quản lý lớp học</Link>,
    },
    {
      key: "/teacher-stress-analysis",
      icon: <BarChartOutlined />,
      label: <Link to="/teacher-stress-analysis">Phân tích căng thẳng</Link>,
    },
  ];

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/teacher-profile">Thông tin tài khoản</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        danger
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const getBreadcrumb = () => {
    const pathNames = location.pathname.split("/").filter((path) => path);

    if (pathNames.length === 0) {
      return [{ title: "Trang chủ", path: "/teacher-home" }];
    }

    const breadcrumbs = [];
    let currentPath = "";

    pathNames.forEach((path, index) => {
      currentPath += `/${path}`;
      let title = "";

      switch (path) {
        case "teacher-home":
          title = "Trang chủ";
          break;
        case "teacher-classes":
          title = "Quản lý lớp học";
          break;
        case "teacher-stress-analysis":
          title = "Phân tích căng thẳng";
          break;
        case "teacher-profile":
          title = "Thông tin tài khoản";
          break;
        case "new-class":
          title = "Tạo lớp mới";
          break;
        case "class-detail":
          title = "Chi tiết lớp học";
          break;
        case "student-detail":
          title = "Chi tiết sinh viên";
          break;
        default:
          title = path;
      }

      breadcrumbs.push({
        title,
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#001529",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => navigate("/teacher-home")}
        >
          Hệ thống Quản lý Sinh viên
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Dropdown
            overlay={profileMenu}
            placement="bottomRight"
            arrow
            trigger={["click"]}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                color: "white",
              }}
            >
              <Avatar
                style={{ marginRight: "8px", backgroundColor: "#87d068" }}
                icon={<UserOutlined />}
                src={user?.avatarUrl}
              />
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          width={230}
          style={{ background: "#fff" }}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: "100%", borderRight: 0, paddingTop: "16px" }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            {getBreadcrumb().map((item, index) => (
              <Breadcrumb.Item key={index}>
                {index === getBreadcrumb().length - 1 ? (
                  item.title
                ) : (
                  <Link to={item.path}>{item.title}</Link>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: "#fff",
              borderRadius: "4px",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
} 