document.addEventListener('DOMContentLoaded', function() {
    // 轮播图功能
    const carousel = document.querySelector('#photo-carousel');
    if (carousel) {
        const slide = carousel.querySelector('.carousel-slide');
        const images = slide.querySelectorAll('img');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        const descriptionElement = document.querySelector('#photo-description p');

        let currentSlide = 0;
        let slideWidth = carousel.clientWidth;
        const descriptions = [
            "这里是照片1的描述...",
            "这里是照片2的描述...",
            // 添加更多照片描述...
        ];

        // 创建点
        images.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.dot');

        function showSlide(n) {
            currentSlide = (n + images.length) % images.length;
            slide.style.transform = `translateX(${-currentSlide * slideWidth}px)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
            if (descriptionElement) {
                descriptionElement.textContent = descriptions[currentSlide] || '';
            }
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        // 自动播放
        let slideInterval = setInterval(nextSlide, 5000); // 每5秒切换一次

        // 鼠标悬停时暂停自动播放
        carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
        carousel.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 5000));

        // 初始化显示第一张照片
        showSlide(0);

        // 窗口大小改变时重新计算滑动宽度
        window.addEventListener('resize', () => {
            slideWidth = carousel.clientWidth;
            showSlide(currentSlide);
        });

        // 添加图片点击放大功能
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const closeBtn = document.querySelector('.close');

        images.forEach(img => {
            img.addEventListener('click', function() {
                modal.style.display = "block";
                modalImg.src = this.src;
            });
        });

        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });

        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    // 获取服务器地址
    const SERVER_URL = 'http://192.168.2.5:3000';

    // 星空背景代码（保持不变）
    function createStars() {
        console.log("Creating stars..."); // 调试信息
        const starsContainer = document.getElementById('stars-container');
        const numberOfStars = 200;

        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            resetStar(star);
            starsContainer.appendChild(star);
        }
        console.log(`Created ${numberOfStars} stars`); // 调试信息
    }

    function resetStar(star) {
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.opacity = Math.random();
    }

    function animateStars() {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            let top = parseFloat(star.style.top);
            top += 0.05; // 调整这个值可以改变星星移动的速度
            if (top > 100) {
                resetStar(star);
            } else {
                star.style.top = `${top}%`;
            }
        });
        requestAnimationFrame(animateStars);
    }

    createStars();
    animateStars();

    async function sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        if (message) {
            appendMessage('user', message);
            messageInput.value = '';

            try {
                const response = await fetch(`${SERVER_URL}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                appendMessage('bot', data.response);
            } catch (error) {
                console.error('Error:', error);
                appendMessage('error', 'An error occurred while sending the message.');
            }
        }
    }
});