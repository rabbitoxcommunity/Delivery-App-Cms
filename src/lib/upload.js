import { api } from './api'

/** §16 of the design doc — presigned direct-to-storage upload. Bytes never pass through our own API. */
export async function uploadImage(file, purpose) {
  const { url, fileUrl } = await api.post('/admin/uploads/sign', { contentType: file.type, purpose })
  const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
  if (!put.ok) throw new Error('Image upload failed. Try a smaller file.')
  return fileUrl
}
