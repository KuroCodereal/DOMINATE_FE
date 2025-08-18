'use client'

import { DocResponse, DocsCustomerResponse } from '#/doc'
import * as Accordion from '@radix-ui/react-accordion'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select'
import { LINKS } from '~/constants/links'
import DOMPurify from 'dompurify'
import http from '~/utils/http'

export default function DocPage({ listDoc }: { listDoc: DocsCustomerResponse[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ready, setReady] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<null | { docId: number; docName: string }>(null)
  const [openCategoryId, setOpenCategoryId] = useState<string | undefined>(undefined)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dataDoc, setDataDoc] = useState<DocResponse>()

  // Setup on mount
  useEffect(() => {
    document.body.classList.add('doc-page')
    setReady(true)

    const docIdParam = searchParams.get('docId')
    if (docIdParam && selectedVersionId === null) {
      const docId = Number(docIdParam)
      const foundVersion = listDoc.find(version =>
        version.categories.some(cat => cat.docs.some(doc => doc.docId === docId))
      )

      if (foundVersion) {
        const foundDoc = foundVersion.categories.flatMap(cat => cat.docs).find(doc => doc.docId === docId)

        if (foundDoc) {
          setSelectedVersionId(foundVersion.versionId)
          setSelectedDoc(foundDoc)

          const foundCategory = foundVersion.categories.find(cat => cat.docs.some(doc => doc.docId === foundDoc.docId))
          if (foundCategory) {
            setOpenCategoryId(String(foundCategory.categoryId))
          }
        }
      }
    } else if (selectedVersionId === null && listDoc.length > 0) {
      setSelectedVersionId(listDoc[0].versionId)
    }

    return () => {
      document.body.classList.remove('doc-page')
    }
  }, [listDoc, searchParams, selectedVersionId])

  // Fetch doc content
  useEffect(() => {
    async function fetchDoc() {
      if (!selectedDoc?.docId) return

      try {
        const res = await http.get<DocResponse>(`${LINKS.docs}/${selectedDoc.docId}`, {
          baseUrl: '/api',
        })
        if (res) {
          setDataDoc(res.data)
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error('Failed to load document data')
      }
    }

    fetchDoc()
  }, [selectedDoc?.docId])

  const handleDocSelect = (doc: { docId: number; docName: string }) => {
    setSelectedDoc(doc)
    setIsMobileMenuOpen(false)

    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('docId', String(doc.docId))
    router.replace(newUrl.toString(), { scroll: false })
  }
  if (listDoc.length === 0) {
    return <div className='p-6 text-center text-lg'>No document data available.</div>
  }
  if (!ready || selectedVersionId === null) return null

  const selectedVersion = listDoc.find(v => v.versionId === selectedVersionId)!
  const SidebarContent = (
    <>
      {/* Version Select */}
      <div className='mb-5'>
        <Select
          value={String(selectedVersionId)}
          onValueChange={val => {
            setSelectedVersionId(Number(val))
            setSelectedDoc(null)
            setOpenCategoryId(undefined)
            router.replace(window.location.pathname)
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select version' />
          </SelectTrigger>
          <SelectContent>
            {listDoc.map(v => (
              <SelectItem key={v.versionId} value={String(v.versionId)}>
                {v.versionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accordion */}
      <Accordion.Root
        type='single'
        collapsible
        className='space-y-3'
        value={openCategoryId}
        onValueChange={setOpenCategoryId}
      >
        {selectedVersion.categories.map(cat => (
          <Accordion.Item key={cat.categoryId} value={String(cat.categoryId)}>
            <Accordion.Header>
              <Accordion.Trigger className='h-4 w-full cursor-pointer px-2 py-2 text-left font-semibold'>
                {cat.categoryName}
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className='space-y-1 px-2 py-2'>
              {cat.docs.map(doc => (
                <div
                  key={doc.docId}
                  onClick={() => handleDocSelect(doc)}
                  className={`line-clamp-2 cursor-pointer px-2 py-1 text-sm font-semibold ${selectedDoc?.docId === doc.docId ? 'text-primary-system' : ''}`}
                >
                  {doc.docName}
                </div>
              ))}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </>
  )

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className='border-primary-system fixed top-21 left-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-x px-4 pt-6 pb-6 md:block'>
        {SidebarContent}
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 z-40 bg-black/50' />
          <Dialog.Content className='dark:bg-background-primary fixed top-0 left-0 z-50 h-full w-4/5 max-w-xs overflow-y-auto bg-white p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-bold'>Tài liệu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className='h-6 w-6' />
              </button>
            </div>
            {SidebarContent}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Main content */}
      <div className='px-4 py-6 md:ml-72'>
        {/* Nút mở menu mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className='text-primary-system fixed top-5 left-42 z-30 mb-4 block cursor-pointer rounded bg-white px-4 py-2 md:hidden'
        >
          doc
        </button>

        {selectedDoc ? (
          <article className='prose max-w-full'>
            <h1 className='after:bg-primary relative mb-4 inline-block text-2xl font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full'>
              {dataDoc?.title}
            </h1>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(dataDoc?.content || ''),
              }}
            />
          </article>
        ) : (
          <div className=''>
            <h1 className='text-primary-system mb-4 text-center text-2xl font-semibold'>Document Dominate System</h1>
            <p>Welcome to visit website, document to help you more understand about my system</p>
          </div>
        )}
      </div>
    </>
  )
}
