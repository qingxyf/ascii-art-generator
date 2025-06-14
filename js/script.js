document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素（保持不变）
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const generateBtn = document.getElementById('generate-btn');
    const asciiResult = document.getElementById('ascii-result');
    const copyBtn = document.getElementById('copy-btn');
    const widthInput = document.getElementById('width-input');
    const charSetSelect = document.getElementById('char-set');
    const contrastInput = document.getElementById('contrast-input');
    const contrastValue = document.getElementById('contrast-value');
    const brightnessInput = document.getElementById('brightness-input');
    const brightnessValue = document.getElementById('brightness-value');
    const reverseInput = document.getElementById('reverse-input');
    // 删除以下两行
    // const zoomRange = document.getElementById('zoom-range');
    // const zoomValue = document.getElementById('zoom-value');
    
    let uploadedImage = null;
    let imageElement = null;
    
    // 更新显示值的事件监听器（保持不变）
    contrastInput.addEventListener('input', function() {
        contrastValue.textContent = this.value;
    });
    
    brightnessInput.addEventListener('input', function() {
        brightnessValue.textContent = this.value;
    });
    
    // 删除以下缩放事件监听器
    // zoomRange.addEventListener('input', function() {
    //     const zoomPercent = this.value + '%';
    //     zoomValue.textContent = zoomPercent;
    //     asciiResult.style.transform = `scale(${this.value / 100})`;
    // });
    
    // 图片上传处理（基本保持不变）
    imageUpload.addEventListener('change', handleFileSelect);
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            // 验证文件类型
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('不支持的文件格式！请上传JPEG, PNG, GIF, BMP或WEBP格式的图片。');
                imageUpload.value = '';
                return;
            }
            
            // 显示预览
            uploadedImage = file;
            const reader = new FileReader();
            reader.onload = function(event) {
                imageElement = new Image();
                imageElement.onload = function() {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="预览图片">`;
                    generateBtn.disabled = false;
                    copyBtn.disabled = false;
                };
                imageElement.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // 拖放功能（保持不变）
    // ...
    
    // 删除以下初始化结果显示区域大小的代码
    // const resultDisplay = document.getElementById('result-display');
    // const initialZoom = zoomRange.value;
    // const baseSize = 400;
    // const initialSize = baseSize * (initialZoom / 100);
    // 
    // resultDisplay.style.width = `${initialSize}px`;
    // resultDisplay.style.height = `${initialSize}px`;
    
    // 生成ASCII艺术 - 这部分需要完全重写，在前端处理
    generateBtn.addEventListener('click', function() {
        if (!uploadedImage || !imageElement) {
            alert('请先上传图片！');
            return;
        }
        
        // 获取参数
        const width = parseInt(widthInput.value);
        const chars = charSetSelect.value;
        const contrast = parseFloat(contrastInput.value);
        const brightness = parseFloat(brightnessInput.value);
        const reverse = reverseInput.checked;
        
        // 显示加载状态
        asciiResult.textContent = '正在生成ASCII艺术...';
        generateBtn.disabled = true;
        
        // 使用setTimeout让UI有时间更新
        setTimeout(() => {
            try {
                // 在前端生成ASCII艺术
                const ascii = generateAsciiArt(imageElement, width, chars, contrast, brightness, reverse);
                asciiResult.textContent = ascii;
            } catch (error) {
                console.error('Error:', error);
                alert('生成失败: ' + error.message);
                asciiResult.textContent = '生成失败，请重试...';
            } finally {
                generateBtn.disabled = false;
            }
        }, 100);
    });
    
    // 前端ASCII艺术生成函数
    function generateAsciiArt(image, width, chars, contrast, brightness, reverse) {
        // 创建canvas元素
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算高度，保持宽高比
        const ratio = image.height / image.width;
        const height = Math.floor(width * ratio * 0.5); // 0.5因为字符高宽比
        
        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 绘制并调整图像
        ctx.drawImage(image, 0, 0, width, height);
        
        // 应用对比度和亮度（简化版）
        if (contrast !== 1.0 || brightness !== 1.0) {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                // 对RGB通道应用对比度和亮度
                for (let j = 0; j < 3; j++) {
                    let value = data[i + j];
                    // 应用对比度
                    value = ((value / 255 - 0.5) * contrast + 0.5) * 255;
                    // 应用亮度
                    value = value * brightness;
                    // 限制在0-255范围内
                    data[i + j] = Math.max(0, Math.min(255, value));
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
        }
        
        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // 创建ASCII艺术
        let asciiArt = '';
        const charArray = chars.split('');
        const charLength = charArray.length - 1;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const offset = (y * width + x) * 4;
                // 计算灰度值 (简单平均法)
                const r = data[offset];
                const g = data[offset + 1];
                const b = data[offset + 2];
                let gray = (r + g + b) / 3;
                
                // 归一化到0-1
                gray = gray / 255;
                
                // 可选反转
                if (reverse) {
                    gray = 1 - gray;
                }
                
                // 映射到字符
                const charIndex = Math.round(gray * charLength);
                asciiArt += charArray[charIndex];
            }
            asciiArt += '\n';
        }
        
        return asciiArt;
    }
    
    // 复制结果功能（保持不变）
    copyBtn.addEventListener('click', function() {
        const text = asciiResult.textContent;
        if (text && text !== '请上传图片生成ASCII艺术...' && 
            text !== '正在生成ASCII艺术...' && 
            text !== '生成失败，请重试...' && 
            text !== '发生错误，请重试...') {
            
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '已复制！';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动选择并复制。');
            });
        } else {
            alert('没有可复制的内容！');
        }
    });
});