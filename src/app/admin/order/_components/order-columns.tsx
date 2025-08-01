import { Space, Button, Tag } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { SortOrder } from 'antd/es/table/interface'
import { OrderResponse } from '#/order'
import { paymentStatusMap, statusColorMap } from '~/constants/payment-type'
import { typePackageMap } from '~/constants/package-type'

interface GetColumnsProps {
  sort: string
  handleEdit: (record: OrderResponse) => void
}

export default function getOrderColumns({ sort, handleEdit }: GetColumnsProps) {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
      sortOrder: (sort === 'id,asc' ? 'ascend' : sort === 'id,desc' ? 'descend' : undefined) as SortOrder,
      ellipsis: true,
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      ellipsis: true,
      render: (status: string) => (
        <Tag color={statusColorMap[status] || 'default'}>{paymentStatusMap[status] || status}</Tag>
      ),
    },
    {
      title: 'Name Package',
      dataIndex: ['subscription', 'name'],
      key: 'packageName',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'Type Package',
      dataIndex: ['subscription', 'typePackage'],
      key: 'typePackage',
      width: 130,
      ellipsis: true,
      render: (type: string) => typePackageMap[type] || type,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      ellipsis: true,
      render: (price?: number) => (price != null ? price.toLocaleString('vi-VN') + ' đ' : '--'),
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right' as const,
      width: 100,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: OrderResponse) => (
        <Space>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        </Space>
      ),
    },
  ]
}
