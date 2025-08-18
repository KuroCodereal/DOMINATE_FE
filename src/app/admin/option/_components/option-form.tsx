import { Button, Form, Input, Switch } from 'antd'

import { FormInstance } from 'antd'
import CustomModalForm from '../../_components/custom-modal-form'
import { OptionResponse } from '#/option'
import { useEffect } from 'react'
import { getValidationRules } from '#/form-antd-type'

interface Props {
  visible: boolean
  onCancel: () => void
  onFinish: (values: OptionResponse) => void
  modalType: 'add' | 'edit'
  editRecord: OptionResponse | null
  form: FormInstance
}

export default function OptionForm({ visible, onCancel, onFinish, modalType, form, editRecord }: Props) {
  useEffect(() => {
    if (visible) {
      if (modalType === 'add') {
        form.resetFields()
      } else if (modalType === 'edit' && editRecord) {
        form.setFieldsValue({
          ...editRecord,
        })
      }
    }
  }, [visible, modalType, editRecord, form])

  return (
    <CustomModalForm
      visible={visible}
      onCancel={onCancel}
      onFinish={onFinish}
      modalTitle={modalType === 'add' ? 'Add Option' : 'Update Option'}
      form={form}
      footer={
        <>
          <Button
            type='primary'
            htmlType='submit'
            className='!bg-primary-system !border-primary-system'
            onClick={() => form.submit()}
          >
            {modalType === 'add' ? 'Add' : 'Update'}
          </Button>
          <Button type='primary' onClick={onCancel} className='!border-primary-system !bg-red-500'>
            Close
          </Button>
        </>
      }
    >
      <Form.Item name='name' label='Name' rules={getValidationRules('name')}>
        <Input />
      </Form.Item>

      {modalType === 'edit' && (
        <Form.Item name='isActive' label='Active' valuePropName='checked' className='custom-switch'>
          <Switch className='custom-switch' checkedChildren='Active' unCheckedChildren='Inactive' />
        </Form.Item>
      )}
    </CustomModalForm>
  )
}
