import { Button, Form, Input, Select, Switch } from 'antd'

import { FormInstance } from 'antd'
import CustomModalForm from '../../_components/custom-modal-form'
import { useEffect } from 'react'
import { CategoryResponse } from '#/category'
import { VersionResponse } from '#/version'
import { getValidationRules } from '#/form-antd-type'

interface Props {
  visible: boolean
  onCancel: () => void
  onFinish: (values: CategoryResponse) => void
  modalType: 'add' | 'edit'
  editRecord: CategoryResponse | null
  form: FormInstance
  versionList: VersionResponse[]
}

export default function CategoryForm({ visible, onCancel, onFinish, modalType, form, editRecord, versionList }: Props) {
  useEffect(() => {
    if (visible) {
      if (modalType === 'add') {
        form.resetFields()
        form.setFieldsValue({ order: 0 })
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
      modalTitle={modalType === 'add' ? 'Add Category' : 'Update Category'}
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
        <Input
          onChange={e => {
            const nameValue = e.target.value
            const slugValue = nameValue
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '')
            form.setFieldsValue({ slug: slugValue })
          }}
        />
      </Form.Item>
      <Form.Item name='slug' label='Slug' rules={getValidationRules('slug')}>
        <Input />
      </Form.Item>
      <Form.Item name='order' label='Order' rules={getValidationRules('order')}>
        <Input type='number' className='!w-full' />
      </Form.Item>
      <Form.Item name='versionId' label='Version' rules={getValidationRules('versionId')}>
        <Select
          placeholder='Choose version'
          allowClear
          className='!h-10'
          options={versionList?.map(item => ({
            label: item.version,
            value: item.id,
          }))}
        />
      </Form.Item>

      {modalType === 'edit' && (
        <Form.Item name='isActive' label='Active' valuePropName='checked' className='custom-switch'>
          <Switch className='custom-switch' checkedChildren='Active' unCheckedChildren='Inactive' />
        </Form.Item>
      )}
    </CustomModalForm>
  )
}
