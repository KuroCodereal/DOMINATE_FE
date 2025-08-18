import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH } from '~/constants'
import { LINKS } from '~/constants/links'
import http from '~/utils/http'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get(AUTH.token)?.value

  const { id } = await params

  const res = await http.post(`${LINKS.payment_cancel_pro}/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  const response = NextResponse.json(res)

  return response
}
