import React from 'react';
import { Form, Input } from 'antd';

const InputField = ({ 
  field, 
  form, 
  label, 
  placeholder, 
  size, 
  suffix,
  iconRender,
  autoComplete,
  type = 'text',
  ...props 
}) => {
  const { name } = field;
  const { errors, touched } = form;
  const showError = errors[name] && touched[name];

  return (
    <Form.Item
      label={label}
      validateStatus={showError ? 'error' : ''}
      help={showError ? errors[name] : ''}
    >
      {type === 'password' ? (
        <Input.Password
          {...field}
          {...props}
          placeholder={placeholder}
          size={size}
          suffix={suffix}
          iconRender={iconRender}
          autoComplete={autoComplete}
        />
      ) : (
        <Input
          {...field}
          {...props}
          placeholder={placeholder}
          size={size}
          suffix={suffix}
          type={type}
          autoComplete={autoComplete}
        />
      )}
    </Form.Item>
  );
};

export default InputField;