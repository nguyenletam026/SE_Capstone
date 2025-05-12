import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Table,
  Modal,
  Form,
  Input,
  Space,
  Tooltip,
  Tag,
  notification,
  Popconfirm,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined
} from '@ant-design/icons';
import { getToken } from '../../services/localStorageService';

const AdminManageTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      setTeachers(data.result || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách giáo viên',
      });
    } finally {
      setLoading(false);
    }
  };

  const showCreateModal = () => {
    setEditingTeacherId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingTeacherId(record.id);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      username: record.username,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async (values) => {
    try {
      const token = getToken();
      const url = editingTeacherId
        ? `${process.env.REACT_APP_API_URL}/api/users/${editingTeacherId}`
        : `${process.env.REACT_APP_API_URL}/api/admin/create-teacher`;

      const method = editingTeacherId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save teacher');
      }

      notification.success({
        message: 'Thành công',
        description: editingTeacherId
          ? 'Cập nhật thông tin giáo viên thành công'
          : 'Tạo tài khoản giáo viên thành công',
      });

      setModalVisible(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể lưu thông tin giáo viên',
      });
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }

      notification.success({
        message: 'Thành công',
        description: 'Xóa tài khoản giáo viên thành công',
      });

      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa tài khoản giáo viên',
      });
    }
  };

  const columns = [
    {
      title: 'Họ',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Tên',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Vai trò',
      key: 'role',
      render: () => <Tag color="blue">Giáo viên</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa giáo viên này?"
              onConfirm={() => handleDeleteTeacher(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý giáo viên"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Thêm giáo viên
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={teachers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title={editingTeacherId ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="firstName"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Họ"
            rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập tên đăng nhập"
              disabled={!!editingTeacherId}
            />
          </Form.Item>

          {!editingTeacherId && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTeacherId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManageTeacher; 