// Cấu hình khởi tạo QueryClient cho Next.js App Router tương thích cả SSR và Client.
import { QueryClient } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error: unknown) => {
          const status = (error as { response?: { status?: number }; status?: number })?.response?.status || (error as { status?: number })?.status
          if (status === 401 || status === 403) return false
          return failureCount < 1
        },
        refetchOnWindowFocus: true,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
