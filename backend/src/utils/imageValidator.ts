import axios from 'axios';

/**
 * 驗證圖片 URL 是否為有效的圖片
 * @param url 圖片 URL
 * @returns Promise<boolean> 是否為有效圖片
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    // 1. 基本 URL 格式檢查
    if (!isValidUrl(url)) {
      return false;
    }

    // 2. 檢查 URL 是否為常見的圖片格式
    if (!isImageUrl(url)) {
      return false;
    }

    // 3. 發送 HEAD 請求檢查 Content-Type
    const response = await axios.head(url, {
      timeout: 5000, // 5秒超時
      maxRedirects: 3, // 最多3次重定向
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)'
      }
    });

    const contentType = response.headers['content-type'];
    if (!contentType || !isImageContentType(contentType)) {
      return false;
    }

    // 4. 檢查 Content-Length（可選）
    const contentLength = response.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB 限制
      return false;
    }

    return true;
  } catch (error) {
    console.log(`Image URL validation failed for ${url}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * 檢查 URL 格式是否有效
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 檢查 URL 是否為常見的圖片格式
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const urlLower = url.toLowerCase();
  
  // 檢查文件擴展名
  const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext));
  
  // 檢查常見的圖片服務域名
  const imageDomains = [
    'unsplash.com',
    'imgur.com',
    'flickr.com',
    'pixabay.com',
    'pexels.com',
    'images.unsplash.com',
    'cdn.unsplash.com',
    'i.imgur.com',
    'farm.staticflickr.com'
  ];
  
  const hasImageDomain = imageDomains.some(domain => urlLower.includes(domain));
  
  return hasImageExtension || hasImageDomain;
}

/**
 * 檢查 Content-Type 是否為圖片類型
 */
function isImageContentType(contentType: string): boolean {
  const imageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ];
  
  return imageTypes.some(type => contentType.toLowerCase().includes(type));
}

/**
 * 同步版本的圖片 URL 驗證（僅檢查格式，不發送網路請求）
 * 用於快速驗證，避免網路請求的延遲
 */
export function validateImageUrlSync(url: string): boolean {
  return isValidUrl(url) && isImageUrl(url);
}
