import { supabase } from '../lib/supabase';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileUploadResult {
  id: string;
  path: string;
  url: string;
}

export const storageService = {
  async uploadFile(
    bucket: 'designs' | 'references' | 'proofs',
    file: File,
    orderId: string,
    userId: string
  ): Promise<FileUploadResult> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Usa PNG, JPG, SVG o PDF.');
    }
    if (file.size > MAX_SIZE) {
      throw new Error('El archivo excede el tamaño máximo de 10MB.');
    }

    const ext = file.name.split('.').pop();
    const path = `${orderId}/${userId}_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Save file metadata
    const { data: fileRecord, error: dbError } = await supabase
      .from('uploaded_files')
      .insert([{
        order_id: orderId,
        uploaded_by: userId,
        category: bucket === 'designs' ? 'design' : bucket === 'references' ? 'reference' : 'proof',
        filename: file.name,
        storage_path: data.path,
        content_type: file.type,
        file_size: file.size,
      }])
      .select()
      .maybeSingle();

    if (dbError) throw new Error(dbError.message);

    return {
      id: fileRecord?.id || '',
      path: data.path,
      url: urlData.publicUrl,
    };
  },

  async deleteFile(bucket: 'designs' | 'references' | 'proofs', path: string, fileId: string) {
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (storageError) throw new Error(storageError.message);

    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw new Error(dbError.message);
  },

  async getOrderFiles(orderId: string) {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getFileUrl(bucket: 'designs' | 'references' | 'proofs', path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
