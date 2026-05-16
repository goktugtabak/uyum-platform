export const RED_FLAGS = [
  'göğüs ağrısı',
  'göğsüm sıkışıyor',
  'kalbim sıkışıyor',
  'nefes alamıyorum',
  'nefesim daralıyor',
  'baş dönüyor',
  'bayılacak',
  'hissizlik',
  'uyuşma',
  'çok şiddetli ağrı',
  'hareket edemiyorum',
]

export function containsRedFlag(text: string): boolean {
  const normalized = text.toLowerCase().trim()
  return RED_FLAGS.some(flag => normalized.includes(flag))
}
