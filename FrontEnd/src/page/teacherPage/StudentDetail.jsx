import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Button, Tabs, Spin, Empty, List, Tag, Col, Row, 
  DatePicker, Statistic, Alert, Timeline, Typography, Divider, Table
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import { getToken } from '../../services/localStorageService';
import dayjs from 'dayjs';
import locale from 'dayjs/locale/vi';
import 'dayjs/locale/vi';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const stressLevelColors = {
  'HIGH': 'red',
  'MEDIUM': 'orange',
  'LOW': 'green',
  'NO_DATA': 'gray'
};

const stressLevelText = {
  'HIGH': 'Cao',
  'MEDIUM': 'Trung bình',
  'LOW': 'Thấp',
  'NO_DATA': 'Không có dữ liệu'
};

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [stressData, setStressData] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [loading, setLoading] = useState({
    student: true,
    answers: true,
    stress: true
  });
  
  useEffect(() => {
    fetchStudentInfo();
    fetchStudentStressData();
  }, [studentId]);
  
  useEffect(() => {
    if (dateRange) {
      fetchStudentAnswers();
    }
  }, [studentId, dateRange]);
  
  const fetchStudentInfo = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student info');
      }
      
      const data = await response.json();
      setStudent(data.result);
    } catch (error) {
      console.error('Error fetching student info:', error);
    } finally {
      setLoading(prevState => ({ ...prevState, student: false }));
    }
  };
  
  const fetchStudentStressData = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stress/user/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stress data');
      }
      
      const data = await response.json();
      setStressData(data.result);
    } catch (error) {
      console.error('Error fetching stress data:', error);
    } finally {
      setLoading(prevState => ({ ...prevState, stress: false }));
    }
  };
  
  const fetchStudentAnswers = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;
    
    try {
      setLoading(prevState => ({ ...prevState, answers: true }));
      const token = getToken();
      const fromDate = dateRange[0].format('YYYY-MM-DD');
      const toDate = dateRange[1].format('YYYY-MM-DD');
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/classes/students/${studentId}/answers?fromDate=${fromDate}&toDate=${toDate}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch answers');
      }
      
      const data = await response.json();
      
      // Group answers by date
      const answersGrouped = {};
      (data.result || []).forEach(answer => {
        const date = dayjs(answer.answerDate).format('YYYY-MM-DD');
        
        if (!answersGrouped[date]) {
          answersGrouped[date] = [];
        }
        
        answersGrouped[date].push(answer);
      });
      
      // Convert to array and sort by date (newest first)
      const answersArray = Object.keys(answersGrouped).map(date => ({
        date,
        answers: answersGrouped[date]
      }));
      
      answersArray.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAnswers(answersArray);
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(prevState => ({ ...prevState, answers: false }));
    }
  };
  
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };
  
  const renderStressLevel = (level) => (
    <Tag color={stressLevelColors[level] || 'gray'}>
      {stressLevelText[level] || 'Không có dữ liệu'}
    </Tag>
  );
  
  if (loading.student) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải thông tin sinh viên..." />
      </div>
    );
  }
  
  if (!student) {
    return (
      <Empty 
        description="Không tìm thấy thông tin sinh viên"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Empty>
    );
  }
  
  const columns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '50%',
    },
    {
      title: 'Câu trả lời',
      dataIndex: 'answerText',
      key: 'answerText',
      width: '30%',
    },
    {
      title: 'Thời gian trả lời',
      dataIndex: 'answerDate',
      key: 'answerDate',
      width: '20%',
      render: (date) => new Date(date).toLocaleTimeString('vi-VN'),
    },
  ];
  
  return (
    <div>
      <Button 
        style={{ marginBottom: 16 }} 
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
      >
        Quay lại
      </Button>
      
      <Card>
        <Row gutter={16} align="middle">
          <Col span={24} md={12}>
            <Title level={3}>{student.firstName} {student.lastName}</Title>
            <Text type="secondary">Tên đăng nhập: {student.username}</Text>
          </Col>
            <Col span={24} md={12} style={{ textAlign: 'right' }}>
            {!loading.stress && stressData && (
              <div>
                <Text strong>Mức độ căng thẳng hiện tại: </Text>
                {renderStressLevel(stressData.currentLevel || 'NO_DATA')}
                {stressData.dailyAverageStressScore && (
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">Điểm TB hôm nay: </Text>
                    <Text strong>{stressData.dailyAverageStressScore.toFixed(2)}</Text>
                  </div>
                )}
                {stressData.totalAnalysesToday && (
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary">Số lần phân tích: </Text>
                    <Text strong>{stressData.totalAnalysesToday}</Text>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
        
        <Divider />
        
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                Phân tích căng thẳng
              </span>
            }
            key="1"
          >
            {loading.stress ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <Spin tip="Đang tải dữ liệu phân tích..." />
              </div>
            ) : !stressData ? (
              <Empty description="Không có dữ liệu phân tích căng thẳng" />
            ) : (
              <div>                <Row gutter={16}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Mức độ căng thẳng hiện tại"
                        value={stressLevelText[stressData.currentLevel] || 'Không có dữ liệu'}
                        valueStyle={{ 
                          color: stressLevelColors[stressData.currentLevel] || 'gray'
                        }}
                      />
                      {stressData.dailyAverageStressScore > 0 && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Điểm TB: {stressData.dailyAverageStressScore.toFixed(2)}
                        </div>
                      )}
                    </Card>
                  </Col>
                  
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Số lần phân tích hôm nay"
                        value={stressData.totalAnalysesToday || 0}
                        valueStyle={{ 
                          color: stressData.totalAnalysesToday > 0 ? '#1890ff' : '#999'
                        }}
                      />
                    </Card>
                  </Col>
                  
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Mức độ trung bình (7 ngày)"
                        value={stressLevelText[stressData.weeklyAverage] || 'Không có dữ liệu'}
                        valueStyle={{ 
                          color: stressLevelColors[stressData.weeklyAverage] || 'gray'
                        }}
                      />
                    </Card>
                  </Col>
                  
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Xu hướng"
                        value={stressData.trend || 'Ổn định'}
                        valueStyle={{ 
                          color: stressData.trend === 'Increasing' ? 'red' : 
                                stressData.trend === 'Decreasing' ? 'green' : 'gray'
                        }}
                      />
                    </Card>
                  </Col>
                </Row>
                
                <Divider>Lịch sử căng thẳng</Divider>
                
                <Timeline mode="left">
                  {(stressData.history || []).map((record, index) => (
                    <Timeline.Item 
                      key={index}
                      color={stressLevelColors[record.level]}
                      label={dayjs(record.date).locale(locale).format('DD/MM/YYYY HH:mm')}
                    >
                      Mức độ căng thẳng: {stressLevelText[record.level]}
                      {record.note && <div><Text italic>{record.note}</Text></div>}
                    </Timeline.Item>
                  ))}
                </Timeline>
                
                {stressData.recommendations && (
                  <div style={{ marginTop: 24 }}>
                    <Alert
                      message="Gợi ý"
                      description={
                        <div>
                          <p><strong>Nhận xét:</strong> {stressData.recommendations.comment || 'Không có nhận xét'}</p>
                          <p><strong>Đề xuất:</strong> {stressData.recommendations.advice || 'Không có đề xuất'}</p>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </div>
                )}
              </div>
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <AreaChartOutlined />
                Câu trả lời hàng ngày
              </span>
            }
            key="2"
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong>Chọn khoảng thời gian: </Text>
              <RangePicker 
                value={dateRange} 
                onChange={handleDateRangeChange}
                style={{ marginLeft: 8 }}
                locale={locale}
              />
            </div>
            
            {loading.answers ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <Spin tip="Đang tải câu trả lời..." />
              </div>
            ) : answers.length === 0 ? (
              <Empty description="Không có câu trả lời trong khoảng thời gian này" />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={answers}
                renderItem={item => (
                  <List.Item>
                    <Card 
                      title={
                        <div>
                          <ClockCircleOutlined /> Ngày {dayjs(item.date).locale(locale).format('DD/MM/YYYY')}
                        </div>
                      }
                    >
                      <Table 
                        columns={columns} 
                        dataSource={item.answers} 
                        rowKey="answerId"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
} 