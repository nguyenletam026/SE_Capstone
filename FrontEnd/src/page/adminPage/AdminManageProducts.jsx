import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Spin,
  Typography,
  Image,
  Space,
  message,
  Popconfirm,
  Card,
  Row,
  Col
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import { toast } from "react-toastify"; // Vẫn giữ lại react-toastify theo code gốc, có thể thay bằng message/notification của AntD
import { formatCurrency } from "../../lib/utils";
import { getToken } from "../../services/localStorageService";
import { motion } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_URL;
const { Title, Text } = Typography;

export default function AdminManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch products" }));
        throw new Error(errorData.message || "Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data.result || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
      });
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
        // Ant Design Upload component expects a specific file object structure
        setFileList([{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: product.imageUrl,
        }]);
      } else {
        setImagePreview(null);
        setFileList([]);
      }
    } else {
      setEditingProduct(null);
      form.resetFields();
      setImagePreview(null);
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
    setImagePreview(null);
    setFileList([]);
  };

  const handleFormSubmit = async (values) => {
    try {
      const token = getToken();
      const formData = new FormData();
      
      const productData = {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
      };
      
      const jsonBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
      formData.append("data", jsonBlob);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      const url = editingProduct
        ? `${API_BASE}/api/products/${editingProduct.id}`
        : `${API_BASE}/api/products`;
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to ${editingProduct ? "update" : "create"} product` }));
        throw new Error(errorData.message || `Failed to ${editingProduct ? "update" : "create"} product`);
      }

      toast.success(`Product ${editingProduct ? "updated" : "created"} successfully`);
      handleCancelModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete product" }));
        throw new Error(errorData.message || "Failed to delete product");
      }
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUploadChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    if (file.status === 'done' || file.status === 'uploading') {
        if (file.originFileObj) {
             const reader = new FileReader();
             reader.onload = (e) => setImagePreview(e.target.result);
             reader.readAsDataURL(file.originFileObj);
        }
    } else if (file.status === 'removed') {
        const isExistingImage = editingProduct && editingProduct.imageUrl && fileList.length === 0;
        if (isExistingImage) {
          // If removing the placeholder for an existing image, keep showing the existing image
          setImagePreview(editingProduct.imageUrl);
        } else {
          setImagePreview(null);
        }
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Image
            width={60}
            height={60}
            src={record.imageUrl || "https://via.placeholder.com/60?text=No+Image"}
            alt={record.name}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            preview={{
                mask: <EyeOutlined />,
            }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" ellipsis={{ tooltip: record.description }} style={{maxWidth: 200}}>
              {record.description}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency(price),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="dashed" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Card bordered={false} className="shadow-lg">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Title level={2} className="m-0 flex items-center">
             <ShoppingOutlined className="mr-3" /> Manage Health Products
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Add New Product
            </Button>
          </Col>
        </Row>

        <Spin spinning={loading} tip="Loading products..." size="large">
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            pagination={{ pageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }}
            scroll={{ x: 'max-content' }}
            className="mt-4"
          />
        </Spin>
      </Card>

      <Modal
        title={
          <Title level={4} className="m-0">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </Title>
        }
        visible={isModalVisible}
        onCancel={handleCancelModal}
        footer={null} // Custom footer below
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please input the product name!" }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input the description!" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[
                  { required: true, message: "Please input the price!" },
                  { type: 'number', min: 0.01, message: "Price must be greater than 0" }
                ]}
              >
                <InputNumber
                  className="w-full"
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Enter price"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[
                  { required: true, message: "Please input the stock quantity!" },
                  { type: 'number', min: 0, message: "Stock cannot be negative" }
                ]}
              >
                <InputNumber className="w-full" placeholder="Enter stock quantity" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="image"
            label="Product Image"
            rules={[{ required: !editingProduct && fileList.length === 0, message: "Please upload an image!" }]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false} // Prevent auto upload, handle manually
              maxCount={1}
              accept="image/*"
            >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          {imagePreview && !fileList.length && editingProduct && editingProduct.imageUrl && ( // Show existing image if no new file is selected for edit
            <div className="mb-4">
                <Text type="secondary">Current Image:</Text>
                <Image width={100} src={imagePreview} alt="Current product" className="mt-2 rounded" />
            </div>
          )}


          <Form.Item className="text-right mt-6">
            <Space>
              <Button onClick={handleCancelModal}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}