export const compressImage = async (imageUrl: string, maxWidth?: number, maxHeight?: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while resizing

      if (maxWidth && maxHeight) {
        // Resize with both dimensions defined (preserves aspect ratio)

        if (width <= maxWidth && height <= maxHeight) {
          resolve(imageUrl);
          return;
        }

        if (width / height > maxWidth / maxHeight) {
          height = Math.round((maxWidth * height) / width);
          width = maxWidth;
        } else {
          width = Math.round((maxHeight * width) / height);
          height = maxHeight;
        }
      } else if (maxWidth) {
        // Only maxWidth defined

        if (width <= maxWidth) {
          resolve(imageUrl);
          return;
        }

        height = Math.round((maxWidth * height) / width);
        width = maxWidth;
      } else if (maxHeight) {
        // Only maxHeight defined

        if (height <= maxHeight) {
          resolve(imageUrl);
          return;
        }

        width = Math.round((maxHeight * width) / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context?.drawImage(img, 0, 0, width, height);

      // Get compressed image URL
      const compressedUrl = canvas.toDataURL();
      resolve(compressedUrl);
    };
    img.onerror = (error) => reject(error);
    img.src = imageUrl;
  });
};
