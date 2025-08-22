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
            <p>
              <div className="">
  <h1 className="text-primary-system mb-4 text-center text-2xl font-semibold">
    Document Dominate System
  </h1>
  <div className="text-left leading-relaxed">
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Installation</h2>
    <p>
      To install <strong>DOMinate Desktop Application</strong>, please choose
      the package that fits your needs:
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li>
        <a href="#" className="text-blue-600 hover:underline">
          Download Runtime Package
        </a>
        <br />
        <small>
          (For executing workflows with a valid license key. This package is
          lightweight and optimized for runtime execution.)
        </small>
      </li>
      <li className="mt-2">
        <a href="#" className="text-blue-600 hover:underline">
          Download Developer Package
        </a>
        <br />
        <small>
          (For building, editing, and debugging workflows. This package includes
          all runtime features plus development tools.)
        </small>
      </li>
    </ul>
    <p>
      After downloading, follow the setup wizard to complete the installation.
      Once installed, launch the application from the desktop shortcut or start
      menu.
    </p>

    <h2 className="text-xl font-semibold mt-6 mb-2">2. User Guide</h2>

    <h3 className="text-lg font-semibold mt-4 mb-2">
      2.1 Launching the Application
    </h3>
    <ul className="list-disc pl-6 mb-4">
      <li>Open <strong>DOMinate Desktop Application</strong>.</li>
      <li>Enter your License Key when prompted.</li>
      <li>
        The system will validate your license and log you into the correct mode:
        <ul className="list-disc pl-6 mt-1">
          <li>
            <strong>Runtime</strong> → Workflow execution only.
          </li>
          <li>
            <strong>Developer</strong> → Workflow creation, editing, and
            execution.
          </li>
        </ul>
      </li>
    </ul>

    <h3 className="text-lg font-semibold mt-4 mb-2">
      2.2 Home Screen Overview
    </h3>
    <p>The Home Screen contains the following options:</p>
    <ul className="list-disc pl-6 mb-4">
      <li>
        <strong>Create New Project</strong> – Start a new workflow project.
      </li>
      <li>
        <strong>Open Project</strong> – Load an existing workflow.
      </li>
      <li>
        <strong>Recent Projects</strong> – Quick access to recently opened
        workflows.
      </li>
      <li>
        <strong>Settings</strong> – Manage license and environment preferences.
      </li>
    </ul>

    <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Demo Actions</h3>

    <h4 className="text-base font-semibold mt-3 mb-1">
      2.3.1. Navigate to URL
    </h4>
    <p>
      Opens a browser window and loads the specified website.
      <br />
      <em>
        Example: Navigate to{" "}
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          https://facebook.com
        </a>
      </em>
    </p>

    <h4 className="text-base font-semibold mt-3 mb-1">2.3.2. Scroll Page</h4>
    <p>
      Scrolls the webpage vertically or horizontally.
      <br />
      <em>Example: Scroll down to the bottom of the page.</em>
    </p>
  </div>
</div>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
