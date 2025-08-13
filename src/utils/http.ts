import qs, { ParsedUrlQueryInput } from 'querystring'

import chalk from 'chalk'

import { env } from '~/configs/env'
import Storage from '~/utils/Storage'

import { BaseResponse } from '#/api'
import { LINKS } from '~/constants/links'

export type CustomRequestInit = Omit<RequestInit, 'method'> & {
  baseUrl?: string
  params?: ParsedUrlQueryInput
}

const prettyUrl = (url?: string, prefix = false) => (url?.endsWith('/') ? url.slice(0, prefix ? 1 : -1) : (url ?? ''))

const log = console.log
const http = {
  async request<T>(
    url: string,
    method = 'GET',
    { headers, body, baseUrl, params, ...options }: CustomRequestInit = {}
  ) {
    const iBaseUrl = typeof baseUrl !== 'undefined' ? prettyUrl(baseUrl) : prettyUrl(env.BASE_API_URL)
    const href = `${iBaseUrl}${prettyUrl(url, true)}`
    const fullUrl = `${href}${params ? `?${qs.stringify(params)}` : ''}`
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
      const iHeaders: HeadersInit = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      }

      const res = await fetch(fullUrl, {
        method,
        headers: iHeaders,
        body,
        cache: 'no-cache',
        ...options,
      })

      const resJson = (await res.json()) as BaseResponse<T>

      if (env.DEBUG_LOG) {
        log('--------------------------------------------------')
        log(`${chalk.yellow.bold('Method')}: ${method}`)
        log(`${chalk.blue.bold('Url')}: ${fullUrl}`)
        if (body) log(`${chalk.cyan.bold('Body')}: ${JSON.stringify(body, null, 2)}`)
        const { data, ...res } = resJson
        log(`${chalk.magenta.bold('Response')}:`)
        log(JSON.stringify(res))
        if (data) {
          log('data:')
          console.table(data)
        }
        log('--------------------------------------------------')
      }

      if (typeof window !== 'undefined' && resJson?.code === 401 && !url.endsWith(LINKS.login_api)) {
        Storage?.clear()
        if (window.location.pathname === '/') window.location.reload()
        else window.location.href = '/'
      }

      return resJson
    } catch (error) {
      const message = (error as { message: string }).message
      if (env.DEBUG_LOG) {
        log('--------------------------------------------------')
        log(`${chalk.yellow.bold('Method')}: ${method}`)
        log(`${chalk.blue.bold('Url')}: ${fullUrl}`)
        log(`${chalk.red.bold('Error Message')}: ${error}`)
        log('--------------------------------------------------')
      }
      return {
        code: 500,
        message,
      } as BaseResponse<T>
    }
  },

  get<T>(url: string, init?: Omit<CustomRequestInit, 'body'>) {
    return this.request<T>(url, 'GET', init)
  },

  post<T>(url: string, init?: CustomRequestInit) {
    return this.request<T>(url, 'POST', init)
  },

  put<T>(url: string, init?: CustomRequestInit) {
    return this.request<T>(url, 'PUT', init)
  },

  patch<T>(url: string, init?: CustomRequestInit) {
    return this.request<T>(url, 'PATCH', init)
  },

  delete<T>(url: string, init?: CustomRequestInit) {
    return this.request<T>(url, 'DELETE', init)
  },
}

export default http
