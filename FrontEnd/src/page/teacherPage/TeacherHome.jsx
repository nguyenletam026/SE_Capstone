import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Button } from 'antd';
import { TeamOutlined, BookOutlined, AlertOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../services/localStorageService';

export default function TeacherHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    stressedStudents: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/classes/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        
        // Use mock data for now
        setStats({
          totalClasses: data.result?.totalClasses || 3,
          totalStudents: data.result?.totalStudents || 42,
          stressedStudents: data.result?.stressedStudents || 7
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set mock data on error
        setStats({
          totalClasses: 3,
          totalStudents: 42,
          stressedStudents: 7
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleManageClasses = () => {
    navigate('/teacher-classes');
  };

  const handleViewStressAnalysis = () => {
    navigate('/teacher-stress-analysis');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Chào mừng đến với Quản lý Sinh viên</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic 
              title="Tổng số lớp học" 
              value={stats.totalClasses} 
              prefix={<BookOutlined />} 
              valueStyle={{ color: '#3f8600' }}
            />
            <Button 
              type="primary" 
              style={{ marginTop: 16 }} 
              onClick={handleManageClasses}
            >
              Quản lý lớp học
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic 
              title="Tổng số sinh viên" 
              value={stats.totalStudents} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
            <Button 
              style={{ marginTop: 16 }} 
              onClick={handleManageClasses}
            >
              Xem danh sách sinh viên
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic 
              title="Sinh viên có mức độ căng thẳng cao" 
              value={stats.stressedStudents} 
              prefix={<AlertOutlined />} 
              valueStyle={{ color: '#cf1322' }}
              suffix={`/ ${stats.totalStudents}`}
            />
            <Button 
              type="primary" 
              danger 
              style={{ marginTop: 16 }} 
              onClick={handleViewStressAnalysis}
            >
              Xem phân tích
            </Button>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Hướng dẫn nhanh" bordered={false}>
            <p>
              <strong>Chào mừng đến với hệ thống quản lý sinh viên!</strong> Dưới đây là các chức năng chính:
            </p>
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Quản lý lớp học:</strong> Tạo lớp mới, thêm sinh viên vào lớp và quản lý danh sách lớp học.</li>
              <li><strong>Phân tích căng thẳng:</strong> Xem mức độ căng thẳng của sinh viên, lịch sử đánh giá và tư vấn.</li>
              <li><strong>Theo dõi tiến độ:</strong> Xem các câu trả lời hàng ngày và phân tích xu hướng căng thẳng theo thời gian.</li>
            </ul>
            <p>Để bắt đầu, hãy nhấp vào "Quản lý lớp học" hoặc "Xem phân tích" để truy cập các tính năng.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 