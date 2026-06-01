import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * PhotoService — wrapper @capacitor/camera untuk pick/take foto dan konversi base64.
 */
@Injectable({ providedIn: 'root' })
export class PhotoService {

  /**
   * Pilih foto dari galeri perangkat.
   * @returns base64 string atau null jika dibatalkan
   */
  async pickFromGallery(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        quality: 70,
      });
      return photo.base64String ?? null;
    } catch {
      // User membatalkan pemilihan foto
      return null;
    }
  }

  /**
   * Ambil foto langsung dari kamera.
   * @returns base64 string atau null jika dibatalkan
   */
  async takePhoto(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 70,
      });
      return photo.base64String ?? null;
    } catch {
      // User membatalkan kamera
      return null;
    }
  }

  /**
   * Konversi base64 string ke Blob untuk keperluan FormData upload.
   * @param base64 string base64 (tanpa prefix data:image/...)
   * @param mimeType MIME type gambar, default 'image/jpeg'
   */
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
