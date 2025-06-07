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
      console.error('Error fetching teachers:', error);      notification.error({
        message: 'Error',
        description: 'Unable to load teacher list',
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
      }      notification.success({
        message: 'Success',
        description: editingTeacherId
          ? 'Teacher information updated successfully'
          : 'Teacher account created successfully',
      });

      setModalVisible(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);      notification.error({
        message: 'Error',
        description: 'Unable to save teacher information',
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
      }      notification.success({
        message: 'Success',
        description: 'Teacher account deleted successfully',
      });

      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      notification.error({
        message: 'Error',
        description: 'Unable to delete teacher account',
      });
    }
  };
  const columns = [
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Role',
      key: 'role',
      render: () => <Tag color="blue">Teacher</Tag>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this teacher?"
              onConfirm={() => handleDeleteTeacher(record.id)}
              okText="Yes"
              cancelText="No"
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
    <div>      <Card
        title="Manage Teachers"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Add Teacher
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
      </Card>      <Modal
        title={editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter username"
              disabled={!!editingTeacherId}
            />
          </Form.Item>          {!editingTeacherId && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingTeacherId ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManageTeacher; 