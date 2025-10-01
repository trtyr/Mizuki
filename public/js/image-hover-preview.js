document.addEventListener('DOMContentLoaded', function() {
    console.log('图片悬停预览功能已初始化');

    const imageHoverElements = document.querySelectorAll('.image-hover-preview');
    console.log('找到图片悬停元素:', imageHoverElements.length);

    imageHoverElements.forEach((element, index) => {
        console.log(`处理元素 ${index + 1}:`, element);
        const imageUrl = element.getAttribute('data-image');
        console.log('图片URL:', imageUrl);

        let previewContainer = null;

        element.addEventListener('mouseenter', function(e) {
            console.log('鼠标进入事件');
            console.log('鼠标位置:', e.clientX, e.clientY);

            // 移除已存在的预览
            const existing = document.querySelector('.image-hover-preview-container');
            if (existing) {
                existing.remove();
            }

            // 创建预览容器
            previewContainer = document.createElement('div');
            previewContainer.className = 'image-hover-preview-container';
            previewContainer.style.cssText = `
                position: fixed;
                z-index: 9999;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: none;
                max-width: 300px;
                max-height: 300px;
            `;

            // 创建图片
            const img = document.createElement('img');
            img.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                display: block;
                border-radius: 4px;
            `;
            img.src = imageUrl;
            img.alt = '预览图片';

            img.onload = function() {
                console.log('图片加载成功');

                // 获取鼠标和元素位置
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const rect = element.getBoundingClientRect();

                console.log('元素位置:', rect);
                console.log('鼠标相对于元素:', mouseX - rect.left, mouseY - rect.top);

                // 获取图片实际尺寸
                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;
                console.log('图片原始尺寸:', imgWidth, imgHeight);

                // 计算预览容器尺寸
                let previewWidth = Math.min(imgWidth, 250);
                let previewHeight = Math.min(imgHeight, 250);

                // 保持宽高比
                if (imgWidth > imgHeight) {
                    previewHeight = (imgHeight / imgWidth) * previewWidth;
                } else {
                    previewWidth = (imgWidth / imgHeight) * previewHeight;
                }

                console.log('预览容器尺寸:', previewWidth, previewHeight);

                // 计算位置 - 优先显示在鼠标右下方
                let left = mouseX + 15;
                let top = mouseY + 15;

                // 获取窗口尺寸
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                console.log('窗口尺寸:', windowWidth, windowHeight);

                // 检查右边界
                if (left + previewWidth > windowWidth - 20) {
                    left = mouseX - previewWidth - 15;
                }

                // 检查底部边界
                if (top + previewHeight > windowHeight - 20) {
                    top = mouseY - previewHeight - 15;
                }

                // 确保不超出左边界和上边界
                left = Math.max(10, left);
                top = Math.max(10, top);

                console.log('最终位置:', left, top);

                // 设置容器样式和位置
                previewContainer.style.width = previewWidth + 'px';
                previewContainer.style.height = previewHeight + 'px';
                previewContainer.style.left = left + 'px';
                previewContainer.style.top = top + 'px';
                previewContainer.style.display = 'block';

                // 添加到页面
                document.body.appendChild(previewContainer);

                // 添加淡入效果
                setTimeout(() => {
                    previewContainer.style.opacity = '1';
                }, 10);
            };

            img.onerror = function() {
                console.error('图片加载失败:', imageUrl);
                previewContainer.innerHTML = '<div style="padding: 20px; color: red; text-align: center;">图片加载失败</div>';
                previewContainer.style.display = 'block';
                document.body.appendChild(previewContainer);
            };

            previewContainer.appendChild(img);
        });

        element.addEventListener('mouseleave', function() {
            console.log('鼠标离开事件');
            if (previewContainer && previewContainer.parentNode) {
                previewContainer.style.opacity = '0';
                setTimeout(() => {
                    if (previewContainer && previewContainer.parentNode) {
                        previewContainer.remove();
                        previewContainer = null;
                    }
                }, 200);
            }
        });
    });

    // 点击其他地方关闭预览
    document.addEventListener('click', function() {
        const containers = document.querySelectorAll('.image-hover-preview-container');
        containers.forEach(container => {
            if (container.parentNode) {
                container.style.opacity = '0';
                setTimeout(() => {
                    if (container.parentNode) {
                        container.remove();
                    }
                }, 200);
            }
        });
    });
});
