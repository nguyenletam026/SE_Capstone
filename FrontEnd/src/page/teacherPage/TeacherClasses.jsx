import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Space, Modal, Form, Input, notification, Spin, Empty } from 'antd';
import { PlusOutlined, EditOutlined, TeamOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../services/localStorageService';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingClassId, setEditingClassId] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchClasses();
  }, []);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/teacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      const data = await response.json();
      setClasses(data.result || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách lớp học. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const showCreateModal = () => {
    setEditingClassId(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  const showEditModal = (record) => {
    setEditingClassId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  const handleSubmit = async (values) => {
    try {
      const token = getToken();
      const url = editingClassId 
        ? `${process.env.REACT_APP_API_URL}/api/classes/${editingClassId}` 
        : `${process.env.REACT_APP_API_URL}/api/classes`;
      
      const method = editingClassId ? 'PUT' : 'POST';
      
      const params = new URLSearchParams();
      params.append('className', values.name);
      params.append('description', values.description || '');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
        body: params,
      });
      
      if (!response.ok) {
        throw new Error('Failed to save class');
      }
      
      notification.success({
        message: 'Thành công',
        description: editingClassId ? 'Cập nhật lớp học thành công' : 'Tạo lớp học mới thành công',
      });
      
      setIsModalVisible(false);
      form.resetFields();
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể lưu lớp học. Vui lòng thử lại sau.',
      });
    }
  };
  
  const confirmDelete = (classId) => {
    Modal.confirm({
      title: 'Xác nhận xóa lớp học',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa lớp học này? Tất cả sinh viên sẽ bị xóa khỏi lớp.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteClass(classId),
    });
  };
  
  const deleteClass = async (classId) => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      
      notification.success({
        message: 'Thành công',
        description: 'Xóa lớp học thành công',
      });
      
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa lớp học. Vui lòng thử lại sau.',
      });
    }
  };
  
  const viewClassDetails = (classId) => {
    navigate(`/teacher-classes/${classId}`);
  };
  
  const columns = [
    {
      title: 'Tên lớp học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số sinh viên',
      dataIndex: 'students',
      key: 'students',
      render: (students) => students?.length || 0,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<TeamOutlined />}
            onClick={() => viewClassDetails(record.id)}
          >
            Chi tiết
          </Button>
          <Button 
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Card
        title="Quản lý lớp học"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreateModal}
          >
            Tạo lớp mới
          </Button>
        }
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : classes.length === 0 ? (
          <Empty 
            description="Chưa có lớp học nào. Tạo lớp mới để bắt đầu."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={showCreateModal}>
              Tạo lớp học
            </Button>
          </Empty>
        ) : (
          <Table 
            columns={columns} 
            dataSource={classes} 
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showTotal: (total) => `Tổng số ${total} lớp học`,
            }}
          />
        )}
      </Card>
      
      <Modal
        title={editingClassId ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên lớp học"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}
          >
            <Input placeholder="Nhập tên lớp học" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả lớp học" />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingClassId ? 'Cập nhật' : 'Tạo lớp'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 