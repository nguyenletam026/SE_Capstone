import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, Card, Table, Tag, Divider, Input, Space, 
  Modal, Form, notification, Tabs, Spin, Empty, Row, Col, Statistic
} from 'antd';
import { 
  UserAddOutlined, 
  DeleteOutlined, 
  BarChartOutlined, 
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { getToken } from '../../services/localStorageService';

const { TabPane } = Tabs;

const stressLevelColors = {
  'HIGH': 'red',
  'MEDIUM': 'orange',
  'LOW': 'green',
  'NO_DATA': 'gray'
};

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [stressData, setStressData] = useState([]);
  const [stressOverview, setStressOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
    useEffect(() => {
    fetchClassData();
    fetchStressData();
    fetchStressOverview();
  }, [classId]);
  
  const fetchClassData = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch class data');
      }
      
      const data = await response.json();
      setClassData(data.result);
    } catch (error) {
      console.error('Error fetching class data:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải thông tin lớp học. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStressOverview = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/${classId}/stress-overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stress overview');
      }
      
      const data = await response.json();
      setStressOverview(data.result);
    } catch (error) {
      console.error('Error fetching stress overview:', error);
    }
  };

  const fetchStressData = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/${classId}/stress-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stress data');
      }
      
      const data = await response.json();
      setStressData(data.result || []);
    } catch (error) {
      console.error('Error fetching stress data:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải dữ liệu căng thẳng. Vui lòng thử lại sau.',
      });
    }
  };
  
  const showAddStudentModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  const addStudent = async (values) => {
    try {
      const token = getToken();
      
      // Create URL parameters instead of JSON
      const params = new URLSearchParams();
      params.append('studentUsername', values.studentUsername);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/${classId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
        body: params,
      });
      
      if (!response.ok) {
        throw new Error('Failed to add student');
      }
      
      notification.success({
        message: 'Thành công',
        description: 'Thêm sinh viên vào lớp thành công',
      });
        setIsModalVisible(false);
      form.resetFields();
      fetchClassData();
      fetchStressData();
      fetchStressOverview();
    } catch (error) {
      console.error('Error adding student:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể thêm sinh viên. Vui lòng kiểm tra lại tên đăng nhập.',
      });
    }
  };
  
  const confirmRemoveStudent = (studentId) => {
    Modal.confirm({
      title: 'Xác nhận xóa sinh viên',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => removeStudent(studentId),
    });
  };
  
  const removeStudent = async (studentId) => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove student');
      }
        notification.success({
        message: 'Thành công',
        description: 'Xóa sinh viên khỏi lớp thành công',
      });
      
      fetchClassData();
      fetchStressData();
      fetchStressOverview();
    } catch (error) {
      console.error('Error removing student:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa sinh viên. Vui lòng thử lại sau.',
      });
    }
  };
  
  const viewStudentDetail = (studentId) => {
    navigate(`/teacher-student/${studentId}`);
  };
  
  const studentColumns = [
    {
      title: 'Tên sinh viên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => viewStudentDetail(record.id)}
          >
            Chi tiết
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmRemoveStudent(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  
  const stressDataColumns = [
    {
      title: 'Tên sinh viên',
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm theo tên"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Xóa
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.studentName.toLowerCase().includes(value.toLowerCase()),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    },    {
      title: 'Mức độ căng thẳng',
      dataIndex: 'stressLevel',
      key: 'stressLevel',
      render: (stressLevel, record) => (
        <div>
          <Tag color={stressLevelColors[stressLevel] || 'gray'}>
            {stressLevel === 'HIGH' ? 'Cao' : 
             stressLevel === 'MEDIUM' ? 'Trung bình' : 
             stressLevel === 'LOW' ? 'Thấp' : 'Không có dữ liệu'}
          </Tag>
          {record.dailyAverageStressScore && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Điểm TB: {record.dailyAverageStressScore.toFixed(2)}
            </div>
          )}
        </div>
      ),
      filters: [
        { text: 'Cao', value: 'HIGH' },
        { text: 'Trung bình', value: 'MEDIUM' },
        { text: 'Thấp', value: 'LOW' },
        { text: 'Không có dữ liệu', value: 'NO_DATA' },
      ],
      onFilter: (value, record) => record.stressLevel === value,
      sorter: (a, b) => {
        const order = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1, 'NO_DATA': 0 };
        return order[a.stressLevel] - order[b.stressLevel];
      },
    },
    {
      title: 'Số lần phân tích hôm nay',
      dataIndex: 'totalAnalysesToday',
      key: 'totalAnalysesToday',
      render: (count) => (
        <span style={{ 
          color: count > 0 ? '#1890ff' : '#999',
          fontWeight: count > 0 ? 'bold' : 'normal'
        }}>
          {count || 0}
        </span>
      ),
      sorter: (a, b) => (a.totalAnalysesToday || 0) - (b.totalAnalysesToday || 0),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'Chưa có dữ liệu',
      sorter: (a, b) => {
        if (!a.lastUpdated) return 1;
        if (!b.lastUpdated) return -1;
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<BarChartOutlined />}
          onClick={() => viewStudentDetail(record.studentId)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!classData) {
    return (
      <Empty 
        description="Không tìm thấy thông tin lớp học"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => navigate('/teacher-classes')}>
          Quay lại danh sách lớp
        </Button>
      </Empty>
    );
  }
  
  return (
    <div>
      <Button 
        style={{ marginBottom: 16 }} 
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/teacher-classes')}
      >
        Quay lại danh sách lớp
      </Button>
      
      <Card title={`Lớp học: ${classData.name}`}>
        <p><strong>Mô tả:</strong> {classData.description || 'Không có mô tả'}</p>
        <p><strong>Ngày tạo:</strong> {new Date(classData.createdAt).toLocaleDateString('vi-VN')}</p>
        <p><strong>Tổng số sinh viên:</strong> {classData.students?.length || 0}</p>
        
        <Divider />
        
        <Tabs defaultActiveKey="1">
          <TabPane tab="Danh sách sinh viên" key="1">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={showAddStudentModal}
              >
                Thêm sinh viên
              </Button>
            </div>
            
            {classData.students?.length === 0 ? (
              <Empty 
                description="Chưa có sinh viên nào trong lớp này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table 
                columns={studentColumns} 
                dataSource={classData.students} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}
          </TabPane>
            <TabPane tab="Phân tích căng thẳng" key="2">
            {stressOverview && (
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card>
                    <Statistic 
                      title="Điểm TB lớp"
                      value={stressOverview.classAverageStressScore ? stressOverview.classAverageStressScore.toFixed(2) : 'N/A'}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>                <Col span={6}>
                  <Card>
                    <Statistic 
                      title="Mức độ cao"
                      value={stressOverview.studentsWithHighStress || 0}
                      valueStyle={{ color: 'red' }}
                      suffix={`/${classData?.students?.length || 0}`}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic 
                      title="Mức độ trung bình"
                      value={stressOverview.studentsWithMediumStress || 0}
                      valueStyle={{ color: 'orange' }}
                      suffix={`/${classData?.students?.length || 0}`}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic 
                      title="Xu hướng"
                      value={
                        stressOverview.trend === 'INCREASING' ? 'Tăng' : 
                        stressOverview.trend === 'DECREASING' ? 'Giảm' : 'Ổn định'
                      }
                      valueStyle={{ 
                        color: 
                          stressOverview.trend === 'INCREASING' ? 'red' : 
                          stressOverview.trend === 'DECREASING' ? 'green' : 'gray'
                      }}
                      prefix={
                        stressOverview.trend === 'INCREASING' ? <ArrowUpOutlined /> : 
                        stressOverview.trend === 'DECREASING' ? <ArrowDownOutlined /> : null
                      }
                    />
                  </Card>
                </Col>
              </Row>
            )}
            
            {stressData.length === 0 ? (
              <Empty 
                description="Chưa có dữ liệu căng thẳng cho lớp này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table 
                columns={stressDataColumns} 
                dataSource={stressData} 
                rowKey="studentId"
                pagination={{ pageSize: 10 }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
      
      <Modal
        title="Thêm sinh viên vào lớp"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={addStudent}
        >
          <Form.Item
            name="studentUsername"
            label="Tên đăng nhập sinh viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập sinh viên' }]}
          >
            <Input placeholder="Nhập tên đăng nhập sinh viên" />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm sinh viên
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 