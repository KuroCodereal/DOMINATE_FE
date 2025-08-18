/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, Select, Switch } from 'antd'

import { FormInstance } from 'antd'
import CustomModalForm from '../../_components/custom-modal-form'

import { useEffect } from 'react'
import { DocResponse } from '#/doc'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CategoryResponse } from '#/category'
import { getValidationRules } from '#/form-antd-type'

interface Props {
  visible: boolean
  onCancel: () => void
  onFinish: (values: DocResponse) => void
  modalType: 'add' | 'edit'
  editRecord: DocResponse | null
  form: FormInstance
  categoryList: CategoryResponse[]
}

export default function DocForm({ visible, onCancel, onFinish, modalType, form, editRecord, categoryList }: Props) {
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
      onFinish={onFinish as any}
      modalTitle={modalType === 'add' ? 'Add Doc' : 'Update Doc'}
      form={form}
      width={800}
      labelCol={4}
      wrapperCol={20}
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
      <Form.Item name='title' label='Title' rules={getValidationRules('title')}>
        <Input
          onChange={e => {
            const titleValue = e.target.value
            const slugValue = titleValue
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
      <Form.Item name='categoryId' label='Category' rules={getValidationRules('categoryId')}>
        <Select
          placeholder='Choose category'
          allowClear
          className='!h-10'
          options={categoryList?.map(item => ({
            label: item.name,
            value: item.id,
          }))}
        />
      </Form.Item>
      <Form.Item
        name='content'
        label='Content'
        valuePropName='data'
        getValueFromEvent={(event, editor) => editor.getData()}
      >
        <CKEditor editor={ClassicEditor as any} data={form.getFieldValue('content') || ''} />
      </Form.Item>

      {modalType === 'edit' && (
        <Form.Item name='isActive' label='Active' valuePropName='checked' className='custom-switch'>
          <Switch className='custom-switch' checkedChildren='Active' unCheckedChildren='Inactive' />
        </Form.Item>
      )}
    </CustomModalForm>
  )
}
