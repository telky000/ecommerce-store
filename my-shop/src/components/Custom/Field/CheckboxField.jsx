import React from 'react';
import { Checkbox, Form } from 'antd';

const CheckboxField = ({ 
  field, 
  form, 
  children,
  ...props 
}) => {
  const { name, value } = field;

  return (
    <Form.Item>
      <Checkbox
        {...field}
        {...props}
        checked={value}
      >
        {children}
      </Checkbox>
    </Form.Item>
  );
};

export default CheckboxField;