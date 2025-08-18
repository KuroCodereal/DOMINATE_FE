import { Button, Form, Input, Switch } from 'antd'

import { FormInstance } from 'antd'
import CustomModalForm from '../../_components/custom-modal-form'
import { useEffect } from 'react'
import { VersionResponse } from '#/version'
import TextArea from 'antd/es/input/TextArea'
import { getValidationRules } from '#/form-antd-type'

interface Props {
  visible: boolean
  onCancel: () => void
  onFinish: (values: VersionResponse) => void
  modalType: 'add' | 'edit'
  editRecord: VersionResponse | null
  form: FormInstance
}

export default function VersionForm({ visible, onCancel, onFinish, modalType, form, editRecord }: Props) {
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
      modalTitle={modalType === 'add' ? 'Add Version' : 'Update Version'}
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
      <Form.Item name='version' label='Version' rules={getValidationRules('version')}>
        <Input />
      </Form.Item>
      <Form.Item name='description' label='Description'>
        <TextArea autoSize={{ minRows: 3 }} />
      </Form.Item>

      {modalType === 'edit' && (
        <Form.Item name='isActive' label='Active' valuePropName='checked' className='custom-switch'>
          <Switch className='custom-switch' checkedChildren='Active' unCheckedChildren='Inactive' />
        </Form.Item>
      )}
    </CustomModalForm>
  )
}
