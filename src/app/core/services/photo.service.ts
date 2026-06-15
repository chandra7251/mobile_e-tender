import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Service buat ngurusin jeprat-jepret foto sama ambil gambar dari galeri HP.
 * Sekalian ada fungsi buat ubah foto jadi blob.
 */
@Injectable({ providedIn: 'root' })
export class PhotoService {

  // Fungsi buat milih foto dari galeri HP
  // Ntar balikin string base64 fotonya, atau null kalo user nge-cancel
  async pickFromGallery(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        quality: 70,
      });
      return photo.base64String ?? null;
    } catch {
      // User batal milih foto, balikin null aja
      return null;
    }
  }

  // Fungsi buat jepret foto langsung pake kamera HP
  // Sama kayak yang galeri, balikin base64 atau null kalo dicancel
  async takePhoto(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 70,
      });
      return photo.base64String ?? null;
    } catch {
      // User batal jepret foto
      return null;
    }
  }

  // Fungsi ajaib buat ngubah base64 string jadi file asli (Blob) biar bisa dikirim pake FormData pas upload
  base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
    const byteCharacters = atob(base64);
    const byteArrays: BlobPart[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mimeType });
  }
}
