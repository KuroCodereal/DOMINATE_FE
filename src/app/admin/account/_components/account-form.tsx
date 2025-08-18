import { Button, Form, Input, Switch } from 'antd'

import { FormInstance } from 'antd'
import CustomModalForm from '../../_components/custom-modal-form'

import { useEffect } from 'react'
import { User } from '#/user'
import { getValidationRules } from '#/form-antd-type'

interface Props {
  visible: boolean
  onCancel: () => void
  onFinish: (values: User) => void
  modalType: 'add' | 'edit' | 'change password'
  editRecord: User | null
  form: FormInstance
}

export default function AccountForm({ visible, onCancel, onFinish, modalType, form, editRecord }: Props) {
  useEffect(() => {
    if (visible) {
      if (modalType === 'add') {
        form.resetFields()
      } else if (modalType === 'edit' && editRecord) {
        form.setFieldsValue({
          ...editRecord,
          status: editRecord.status === 'ACTIVE' ? true : false,
        })
      }
    }
  }, [visible, modalType, editRecord, form])

  const handleFinish = (values: User) => {
    const processedValues: User = {
      ...values,
      status: values.status ? 1 : 0,
    }
    onFinish(processedValues)
  }

  return (
    <CustomModalForm
      visible={visible}
      onCancel={onCancel}
      onFinish={handleFinish}
      modalTitle={modalType === 'add' ? 'Add Account' : modalType === 'edit' ? 'Update Account' : 'Change Password'}
      form={form}
      footer={
        <>
          <Button
            type='primary'
            htmlType='submit'
            className='!bg-primary-system !border-primary-system'
            onClick={() => form.submit()}
          >
            {modalType === 'add' ? 'Add' : modalType === 'edit' ? 'Update' : 'Change Password'}
          </Button>
          <Button type='primary' onClick={onCancel} className='!border-primary-system !bg-red-500'>
            Close
          </Button>
        </>
      }
    >
      {modalType !== 'change password' && (
        <>
          {modalType === 'add' ? (
            <Form.Item name='userName' label='User name' rules={getValidationRules('userName')}>
              <Input />
            </Form.Item>
          ) : (
            <Form.Item label='User name'>
              <Input value={editRecord?.userName} disabled />
            </Form.Item>
          )}
          <Form.Item name='firstName' label='First Name' rules={getValidationRules('firstName')}>
            <Input />
          </Form.Item>
          <Form.Item name='lastName' label='Last Name' rules={getValidationRules('lastName')}>
            <Input />
          </Form.Item>
          <Form.Item name='email' label='Email' rules={getValidationRules('email')}>
            <Input />
          </Form.Item>
          <Form.Item name='phoneNumber' label='Phone Number' rules={getValidationRules('phoneNumber')}>
            <Input />
          </Form.Item>
          {modalType === 'add' && (
            <>
              <Form.Item name='password' label='Password' rules={getValidationRules('password')}>
                <Input type='password' />
              </Form.Item>
              <Form.Item
                name='password_confirmation'
                label='Password Confirm'
                dependencies={['password']}
                hasFeedback
                rules={getValidationRules('password_confirmation')}
              >
                <Input type='password' />
              </Form.Item>
            </>
          )}
          {modalType === 'edit' && (
            <>
              <Form.Item name='status' label='Active' valuePropName='checked' className='custom-switch'>
                <Switch className='custom-switch' checkedChildren='Active' unCheckedChildren='Inactive' />
              </Form.Item>
              <Form.Item name='isActive' label='Permission' valuePropName='checked' className='custom-switch'>
                <Switch className='custom-switch' checkedChildren='Permission' unCheckedChildren='Banned' />
              </Form.Item>
            </>
          )}
        </>
      )}
      {modalType === 'change password' && (
        <Form.Item name='newPassword' label='New Password' rules={getValidationRules('newPassword')}>
          <Input type='password' />
        </Form.Item>
      )}
    </CustomModalForm>
  )
}
