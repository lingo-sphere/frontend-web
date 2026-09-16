// Định nghĩa query keys cho các truy vấn AI và hạn ngạch AI.
export const aiKeys = {
  all: ['ai'] as const,
  quota: () => [...aiKeys.all, 'quota'] as const,
}
