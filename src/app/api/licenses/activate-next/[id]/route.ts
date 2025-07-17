import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH } from '~/constants'
import { LINKS } from '~/constants/links'
import http from '~/utils/http'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url)
  const token = request.cookies.get(AUTH.token)?.value
  const type = searchParams.get('type')
  const { id } = await params

  if (!type) {
    return NextResponse.json({ error: 'Missing parameter(s)' }, { status: 400 })
  }

  const res = await http.post(`${LINKS.licenses_activate_next}/${id}`, {
    params: {
      type,
    },
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  const response = NextResponse.json(res)

  return response
}
