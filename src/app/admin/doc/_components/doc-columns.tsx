import { Space, Tag, Button, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

import { SortOrder } from 'antd/es/table/interface'
import { DocResponse } from '#/doc'

interface GetColumnsProps {
  sort: string
  handleEdit: (record: DocResponse) => void
  handleDeleteOne: (id: string | number) => void
}

export default function getDocColumns({ sort, handleEdit, handleDeleteOne }: GetColumnsProps) {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      sorter: true,
      sortOrder: (sort === 'id,asc' ? 'ascend' : sort === 'id,desc' ? 'descend' : undefined) as SortOrder | undefined,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 80,
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 80,
    },
    {
      title: 'Version',
      dataIndex: ['category', 'version', 'version'],
      key: 'version',
      width: 80,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 50,
      ellipsis: true,
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} bordered={false}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: unknown, record: DocResponse) => (
        <Space>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title='Are you sure want to delete this doc ?'
            onConfirm={() => handleDeleteOne(record.id as number)}
            okText='Xóa'
            cancelText='Hủy'
            placement='bottom'
          >
            <Button type='link' danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]
}
