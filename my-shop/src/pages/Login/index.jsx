import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Typography, 
  message, 
  Tooltip, 
  Row, 
  Col,
  Form,
  Input,
  Checkbox
} from "antd";
import { 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  InfoCircleOutlined 
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: values }),
      });

      const data = await response.json();

      if (data.success) {
        message.success(data.message);
        
        // Lưu thông tin user
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('refresh_token', data.refreshToken);
        
        // Chuyển hướng
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Lỗi kết nối, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const suffixColor = 'rgba(0, 0, 0, 0.25)';

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh", 
      background: "#f0f2f5" 
    }}>
      <Card style={{ width: 400, padding: "24px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
          Đăng Nhập
        </Title>
        
        <Form
          form={form}
          name="loginForm"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          initialValues={{
            email: '',
            password: '',
            keepLogin: false
          }}
        >
          <Row gutter={[0, 16]} style={{ margin: 0 }}>
            {/* Email Field */}
            <Col span={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input 
                  placeholder="Nhập email" 
                  size="large"
                  suffix={
                    <Tooltip title="Email của bạn">
                      <InfoCircleOutlined style={{ color: suffixColor }} />
                    </Tooltip>
                  }
                />
              </Form.Item>
            </Col>

            {/* Password Field */}
            <Col span={24}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu" 
                  size="large"
                  autoComplete="on"
                  iconRender={(visible) => 
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
            </Col>

            {/* Keep Login & Forgot Password */}
            <Col span={24}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="keepLogin" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>
                    <span style={{ fontWeight: 'bold' }}>Duy trì đăng nhập</span>
                  </Checkbox>
                </Form.Item>
                
                <Link to="/forgot-password" style={{ color: '#50aaff', fontWeight: 'bold' }}>
                  Quên mật khẩu?
                </Link>
              </div>
            </Col>

            {/* Submit Button */}
            <Col span={24}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  style={{ height: '45px', fontSize: '16px' }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Form.Item>
            </Col>

            {/* Register Link */}
            <Col span={24} style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ color: '#666' }}>
                Chưa có tài khoản? 
                <Link to="/register" style={{ marginLeft: '4px', fontWeight: 'bold' }}>
                  Đăng ký ngay
                </Link>
              </span>
            </Col>

            {/* Demo Account */}
            <Col span={24} style={{ textAlign: 'center', marginTop: '8px' }}>
              <span style={{ color: '#999', fontSize: '12px' }}>
                Demo: admin@example.com / admin123
              </span>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}