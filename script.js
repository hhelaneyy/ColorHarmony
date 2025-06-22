document.addEventListener('DOMContentLoaded', function() {
    const colorBoxes = document.querySelectorAll('.color-box');
    const generateBtn = document.getElementById('generate-btn');
    const randomBtn = document.getElementById('random-btn');
    const clearBtn = document.getElementById('clear-btn');
    const imageUpload = document.getElementById('image-upload');
    const copyCssBtn = document.getElementById('copy-css');
    const copyJsonBtn = document.getElementById('copy-json');
    const copySvgBtn = document.getElementById('copy-svg');
    const notification = document.getElementById('notification');
    
    // Инициализация с рандом цветами
    generateRandomPalette();
    
    // Кнопка генерации цветов
    generateBtn.addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 300);
        generatePalette();
    });
    
    // Кнопка рандомной генерации цветов
    randomBtn.addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 300);
        generateRandomPalette();
    });
    
    // Кнопка сброса заблокированных цветов
    clearBtn.addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 300);
        document.querySelectorAll('.lock-btn').forEach(btn => {
            btn.classList.remove('locked');
            btn.innerHTML = '<i class="fas fa-lock-open"></i>';
        });
        showNotification('All colors unlocked');
    });
    
    // Залочить/не лочить цвет
    colorBoxes.forEach(box => {
        const lockBtn = box.querySelector('.lock-btn');
        lockBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('locked');
            this.innerHTML = this.classList.contains('locked') 
                ? '<i class="fas fa-lock"></i>' 
                : '<i class="fas fa-lock-open"></i>';
            
            const color = box.querySelector('.color-value').value;
            showNotification(this.classList.contains('locked') 
                ? `Color ${color} locked` 
                : `Color ${color} unlocked`);
        });
        
        // Копировать цвет
        const copyBtn = box.querySelector('.copy-btn');
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const colorValue = box.querySelector('.color-value');
            colorValue.select();
            document.execCommand('copy');
            showNotification(`Copied ${colorValue.value} to clipboard`);
        });
        
        // Копировать цвет при нажатии на значение
        const colorValue = box.querySelector('.color-value');
        colorValue.addEventListener('click', function() {
            this.select();
            document.execCommand('copy');
            showNotification(`Copied ${this.value} to clipboard`);
        });
    });
    
    // Сохранить в CSS
    copyCssBtn.addEventListener('click', function() {
        const colors = getCurrentColors();
        const cssCode = `:root {
    --color-primary: ${colors[0]};
    --color-secondary: ${colors[1]};
    --color-accent: ${colors[2]};
    --color-dark: ${colors[3]};
    --color-light: ${colors[4]};
}`;
        copyToClipboard(cssCode, 'CSS variables copied to clipboard!');
    });
    
    // Сохранить в JSON
    copyJsonBtn.addEventListener('click', function() {
        const colors = getCurrentColors();
        const jsonCode = JSON.stringify({
            primary: colors[0],
            secondary: colors[1],
            accent: colors[2],
            dark: colors[3],
            light: colors[4]
        }, null, 2);
        copyToClipboard(jsonCode, 'JSON palette copied to clipboard!');
    });
    
    // Сохранить в SVG
    copySvgBtn.addEventListener('click', function() {
        const colors = getCurrentColors();
        const svgCode = `<svg width="500" height="100" viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" width="100" height="100" fill="${colors[0]}"/>
    <rect x="100" width="100" height="100" fill="${colors[1]}"/>
    <rect x="200" width="100" height="100" fill="${colors[2]}"/>
    <rect x="300" width="100" height="100" fill="${colors[3]}"/>
    <rect x="400" width="100" height="100" fill="${colors[4]}"/>
</svg>`;
        copyToClipboard(svgCode, 'SVG palette copied to clipboard!');
    });
    
    // Загрузка изображения
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                extractColorsFromImage(event.target.result);
                showNotification('Colors extracted from image');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Сгенерировать цвета на основе заблокированных
    function generatePalette() {
        const lockedColors = [];
        const lockedIndices = [];
        
        colorBoxes.forEach((box, index) => {
            const lockBtn = box.querySelector('.lock-btn');
            if (lockBtn.classList.contains('locked')) {
                const color = box.querySelector('.color-value').value;
                lockedColors.push(hexToRgb(color));
                lockedIndices.push(index);
            }
        });
        
        // Если ни один цвет не заблокирован, генерируем случайную палитру
        if (lockedColors.length === 0) {
            generateRandomPalette();
            showNotification('New palette generated');
            return;
        }
        
        // Генерация гармоничных цветов на основе заблокированных цветов
        const palette = generateHarmoniousPalette(lockedColors, lockedIndices);
        updatePalette(palette);
        showNotification('New palette generated based on locked colors');
    }
    
    // Генерирурем рандом палитру
    function generateRandomPalette() {
        const palette = [];
        for (let i = 0; i < 5; i++) {
            palette.push(generateRandomColor());
        }
        updatePalette(palette);
    }
    
    // Обновляем палитру на дисплее
    function updatePalette(colors) {
        colorBoxes.forEach((box, index) => {
            const lockBtn = box.querySelector('.lock-btn');
            if (!lockBtn.classList.contains('locked')) {
                const colorPreview = box.querySelector('.color-preview');
                const colorValue = box.querySelector('.color-value');
                
                colorPreview.style.backgroundColor = colors[index];
                colorValue.value = colors[index];
                
                // Обновляем цвет текста на основе яркости
                const luminance = getLuminance(colors[index]);
                colorValue.style.color = luminance > 0.5 ? '#000' : '#fff';
                colorValue.style.backgroundColor = colors[index];
            }
        });
    }
    
    // Получаем действительный цвет
    function getCurrentColors() {
        const colors = [];
        colorBoxes.forEach(box => {
            colors.push(box.querySelector('.color-value').value);
        });
        return colors;
    }
    
    // Генерация случайного цвета в шестнадцатеричном формате
    function generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30);
        const lightness = 40 + Math.floor(Math.random() * 40);
        
        return hslToHex([hue, saturation, lightness]);
    }
    
    // Генерация гармоничной палитры на основе входных цветов
    function generateHarmoniousPalette(baseColors, lockedIndices) {
        const palette = Array(5).fill(null);
        
        // Размещаем заблокированные цвета
        lockedIndices.forEach((index, i) => {
            palette[index] = rgbToHex(baseColors[i]);
        });
        
        // Создаём гармоничные цвета для пустых слотов
        for (let i = 0; i < 5; i++) {
            if (palette[i] === null) {
                // Ищем ближайший заблокированный цвет
                let nearestLockedIndex = 0;
                let minDistance = 5;
                
                for (let j = 0; j < lockedIndices.length; j++) {
                    const distance = Math.abs(lockedIndices[j] - i);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestLockedIndex = lockedIndices[j];
                    }
                }
                
                const baseColor = hexToRgb(palette[nearestLockedIndex]);
                palette[i] = generateRelatedColor(baseColor, i);
            }
        }
        
        return palette;
    }
    
    function generateRelatedColor(baseColor, position) {
        const hsl = rgbToHsl(baseColor);
        
        hsl[0] = (hsl[0] + (position * 30)) % 360;
        
        hsl[1] = Math.min(100, Math.max(30, hsl[1] + (Math.random() * 20 - 10)));
        hsl[2] = Math.min(80, Math.max(20, hsl[2] + (Math.random() * 20 - 10)));
        
        return hslToHex(hsl);
    }
    
    function extractColorsFromImage(imageData) {
        const img = new Image();
        img.src = imageData;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxSize = 200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            const imageData = ctx.getImageData(0, 0, width, height).data;
            
            const colorMap = {};
            const step = 10;
            
            for (let i = 0; i < imageData.length; i += step * 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const key = `${r},${g},${b}`;
                
                colorMap[key] = (colorMap[key] || 0) + 1;
            }
            
            const sortedColors = Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(entry => {
                    const [r, g, b] = entry[0].split(',').map(Number);
                    return rgbToHex([r, g, b]);
                });
            
            updatePalette(sortedColors);
        };
    }
    
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }
    
    function rgbToHex(rgb) {
        return '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
    }
    
    function rgbToHsl(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return [h * 360, s * 100, l * 100];
    }
    
    function hslToHex(hsl) {
        const h = hsl[0] / 360;
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return rgbToHex([
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ]);
    }
    
    function getLuminance(hex) {
        const rgb = hexToRgb(hex);
        return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    }

    function copyToClipboard(text, message) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(message);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Failed to copy to clipboard');
        });
    }
    
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});