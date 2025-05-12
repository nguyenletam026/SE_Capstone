import React, { useEffect, useState } from 'react';
import { 
  Card, Table, Tag, Input, Button, Select, 
  Space, Spin, Empty, Row, Col, Statistic, Alert
} from 'antd';
import { 
  SearchOutlined, 
  BarChartOutlined, 
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../services/localStorageService';

const { Option } = Select;

const stressLevelColors = {
  'HIGH': 'red',
  'MEDIUM': 'orange',
  'LOW': 'green',
  'NO_DATA': 'gray'
};

export default function TeacherStressAnalysis() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    highStress: 0,
    mediumStress: 0,
    lowStress: 0,
    noData: 0,
    trend: 'stable'
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchClasses();
    fetchAllStudentsStressData();
  }, []);
  
  const fetchClasses = async () => {
    try {
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
    }
  };
  
  const fetchAllStudentsStressData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/all-students-stress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stress data');
      }
      
      const data = await response.json();
      const studentsData = data.result?.students || [];
      
      // Calculate statistics
      const highStress = studentsData.filter(s => s.stressLevel === 'HIGH').length;
      const mediumStress = studentsData.filter(s => s.stressLevel === 'MEDIUM').length;
      const lowStress = studentsData.filter(s => s.stressLevel === 'LOW').length;
      const noData = studentsData.filter(s => s.stressLevel === 'NO_DATA' || !s.stressLevel).length;
      
      setStats({
        total: studentsData.length,
        highStress,
        mediumStress,
        lowStress,
        noData,
        trend: data.result?.trend || 'stable'
      });
      
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching stress data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClassStudentsStressData = async (classId) => {
    try {
      setLoading(true);
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
      const studentsData = data.result || [];
      
      // Calculate statistics
      const highStress = studentsData.filter(s => s.stressLevel === 'HIGH').length;
      const mediumStress = studentsData.filter(s => s.stressLevel === 'MEDIUM').length;
      const lowStress = studentsData.filter(s => s.stressLevel === 'LOW').length;
      const noData = studentsData.filter(s => s.stressLevel === 'NO_DATA' || !s.stressLevel).length;
      
      setStats({
        total: studentsData.length,
        highStress,
        mediumStress,
        lowStress,
        noData,
        trend: 'unknown' // We don't have trend for single class
      });
      
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching stress data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClassChange = (value) => {
    setSelectedClass(value);
    
    if (value === 'all') {
      fetchAllStudentsStressData();
    } else {
      fetchClassStudentsStressData(value);
    }
  };
  
  const viewStudentDetail = (studentId) => {
    navigate(`/teacher-student/${studentId}`);
  };
  
  const columns = [
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
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      filters: classes.map(c => ({ text: c.name, value: c.name })),
      onFilter: (value, record) => record.className === value,
    },
    {
      title: 'Mức độ căng thẳng',
      dataIndex: 'stressLevel',
      key: 'stressLevel',
      render: (stressLevel) => (
        <Tag color={stressLevelColors[stressLevel] || 'gray'}>
          {stressLevel === 'HIGH' ? 'Cao' : 
           stressLevel === 'MEDIUM' ? 'Trung bình' : 
           stressLevel === 'LOW' ? 'Thấp' : 'Không có dữ liệu'}
        </Tag>
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
  
  return (
    <div>
      <Card title="Phân tích mức độ căng thẳng sinh viên">
        <Row gutter={[16, 16]}>
          <Col span={24} md={6}>
            <Card>
              <Statistic 
                title="Tổng số sinh viên"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col span={24} md={6}>
            <Card>
              <Statistic 
                title="Mức độ cao"
                value={stats.highStress}
                valueStyle={{ color: 'red' }}
                suffix={`/${stats.total}`}
              />
            </Card>
          </Col>
          
          <Col span={24} md={6}>
            <Card>
              <Statistic 
                title="Mức độ trung bình"
                value={stats.mediumStress}
                valueStyle={{ color: 'orange' }}
                suffix={`/${stats.total}`}
              />
            </Card>
          </Col>
          
          <Col span={24} md={6}>
            <Card>
              <Statistic 
                title="Xu hướng"
                value={
                  stats.trend === 'increasing' ? 'Tăng' : 
                  stats.trend === 'decreasing' ? 'Giảm' : 
                  stats.trend === 'unknown' ? 'Chưa xác định' : 'Ổn định'
                }
                valueStyle={{ 
                  color: 
                    stats.trend === 'increasing' ? 'red' : 
                    stats.trend === 'decreasing' ? 'green' : 
                    'gray' 
                }}
                prefix={
                  stats.trend === 'increasing' ? <ArrowUpOutlined /> : 
                  stats.trend === 'decreasing' ? <ArrowDownOutlined /> : 
                  null
                }
              />
            </Card>
          </Col>
        </Row>
        
        {stats.highStress > 0 && (
          <Alert
            message="Cảnh báo"
            description={`Có ${stats.highStress} sinh viên có mức độ căng thẳng cao. Cần chú ý theo dõi.`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ margin: '16px 0' }}
          />
        )}
        
        <div style={{ marginBottom: 16, marginTop: 16 }}>
          <Space>
            <span><strong>Lọc theo lớp:</strong></span>
            <Select 
              style={{ width: 200 }} 
              value={selectedClass}
              onChange={handleClassChange}
            >
              <Option value="all">Tất cả lớp</Option>
              {classes.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Space>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : students.length === 0 ? (
          <Empty description="Không có dữ liệu sinh viên" />
        ) : (
          <Table 
            columns={columns} 
            dataSource={students} 
            rowKey="studentId"
            pagination={{ 
              pageSize: 10,
              showTotal: (total) => `Tổng số ${total} sinh viên`
            }}
          />
        )}
      </Card>
    </div>
  );
} 