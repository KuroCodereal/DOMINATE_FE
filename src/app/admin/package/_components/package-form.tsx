import { Button, Form, Input, Select, Slider, Switch } from 'antd'
import { useEffect } from 'react'
import { PackageResponse } from '#/package'

import { FormInstance } from 'antd'
import CustomModalForm from '../../_components/custom-modal-form'
import TextArea from 'antd/es/input/TextArea'
import { getValidationRules } from '#/form-antd-type'

interface Props {
  visible: boolean
  onCancel: () => void
  onFinish: (values: PackageResponse) => void
  modalType: 'add' | 'edit'
  editRecord: PackageResponse | null
  optionList: { label: string; value: string | number }[]
  form: FormInstance
  isPending: boolean
}

const billingCycleOptions = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Half yearly', value: 'HALF_YEARLY' },
  { label: 'Yearly', value: 'YEARLY' },
]
const typePackage = [
  { label: 'Dev', value: 'DEV' },
  { label: 'Runtime', value: 'RUNTIME' },
]

export default function PackageForm({
  visible,
  onCancel,
  onFinish,
  modalType,
  editRecord,
  optionList,
  form,
  isPending,
}: Props) {
  useEffect(() => {
    if (visible) {
      if (modalType === 'add') {
        form.resetFields()
      } else if (modalType === 'edit' && editRecord) {
        form.setFieldsValue({
          ...editRecord,
          optionsId: editRecord.options?.map(opt => opt.id),
        })
      }
    }
  }, [visible, modalType, editRecord, form])

  return (
    <CustomModalForm
      visible={visible}
      onCancel={onCancel}
      onFinish={onFinish}
      modalTitle={modalType === 'add' ? 'Add Package' : 'Update Package'}
      form={form}
      footer={
        <>
          <Button
            type='primary'
            htmlType='submit'
            className='!bg-primary-system !border-primary-system'
            style={{ paddingInline: '24px' }}
            disabled={isPending}
            onClick={() => form.submit()}
          >
            {modalType === 'add' ? 'Add' : 'Update'}
          </Button>
          <Button
            type='primary'
            onClick={onCancel}
            className='!border-primary-system !bg-red-500'
            disabled={isPending}
            style={{ paddingInline: '24px' }}
          >
            Cancel
          </Button>
        </>
      }
    >
      <Form.Item name='name' label='Name' rules={getValidationRules('name')}>
        <Input />
      </Form.Item>
      <Form.Item name='description' label='Description'>
        <TextArea autoSize={{ minRows: 3 }} />
      </Form.Item>
      <Form.Item name='price' label='Price' rules={getValidationRules('price')}>
        <Input type='number' className='!w-full' />
      </Form.Item>
      <Form.Item name='simulatedCount' label='Simulated' rules={getValidationRules('simulatedCount')}>
        <Input type='number' className='!w-full' />
      </Form.Item>
      <Form.Item name='discount' label='Discount (%)' rules={getValidationRules('discount')}>
        <Slider min={0} max={100} className='!w-full' />
      </Form.Item>
      <Form.Item name='billingCycle' label='Billing Cycle' rules={getValidationRules('billingCycle')}>
        <Select options={billingCycleOptions} placeholder='Choose cycle' />
      </Form.Item>
      <Form.Item name='typePackage' label='Type Package' rules={getValidationRules('typePackage')}>
        <Select options={typePackage} placeholder='Choose type' />
      </Form.Item>
      {modalType === 'edit' && (
        <Form.Item name='isActive' label='Active' valuePropName='checked' className='custom-switch'>
          <Switch className='custom-switch' checkedChildren='Active' unCheckedChildren='Inactive' />
        </Form.Item>
      )}
      <Form.Item name='optionsId' label='Options' rules={getValidationRules('optionsId')}>
        <Select mode='multiple' options={optionList} placeholder='Select options' />
      </Form.Item>
    </CustomModalForm>
  )
}
