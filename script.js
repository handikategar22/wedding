
        // Configuration
        const CONFIG = {
            weddingDate: new Date("2025-12-28T09:00:00"),
            animationDuration: 800
        };

        // DOM Elements
        const elements = {
            openButton: document.getElementById('open-invitation'),
            coverSection: document.getElementById('cover'),
            mainContent: document.getElementById('main-content'),
            countdownElements: {
                days: document.getElementById('days'),
                hours: document.getElementById('hours'),
                minutes: document.getElementById('minutes'),
                seconds: document.getElementById('seconds'),
                timer: document.getElementById('timer')
            },
            rsvpForm: document.getElementById('rsvp-form'),
            commentsList: document.getElementById('comments-list')
        };

        // Open Invitation Handler
        function openInvitation() {
            // Hide cover with animation
            elements.coverSection.classList.add('hidden');
            
            // Show main content after animation
            setTimeout(() => {
                elements.coverSection.style.display = 'none';
                elements.mainContent.classList.add('visible');
                document.body.style.overflow = 'auto';
                
                // Optional: Play background music
                // playBackgroundMusic();
            }, CONFIG.animationDuration);
        }

        // Countdown Timer
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = CONFIG.weddingDate.getTime() - now;

            if (distance < 0) {
                elements.countdownElements.timer.innerHTML = '<div style="grid-column: 1/-1; font-size: 1.5rem; padding: 20px;">🎉 Acara Sedang Berlangsung! 🎉</div>';
                return;
            }

            const timeUnits = {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            };

            // Update DOM
            Object.keys(timeUnits).forEach(unit => {
                if (elements.countdownElements[unit]) {
                    elements.countdownElements[unit].textContent = 
                        timeUnits[unit].toString().padStart(2, '0');
                }
            });
        }

        // Copy to Clipboard
        function copyToClipboard(text, bankName) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        showNotification(`✓ Nomor ${bankName} berhasil disalin!`);
                    })
                    .catch(err => {
                        console.error('Failed to copy:', err);
                        fallbackCopy(text, bankName);
                    });
            } else {
                fallbackCopy(text, bankName);
            }
        }

        // Fallback copy method for older browsers
        function fallbackCopy(text, bankName) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification(`✓ Nomor ${bankName} berhasil disalin!`);
            } catch (err) {
                showNotification('✗ Gagal menyalin. Silakan salin manual.');
            }
            
            document.body.removeChild(textArea);
        }

        // Show Notification
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-color);
                color: white;
                padding: 15px 25px;
                border-radius: 50px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                font-size: 0.95rem;
                font-weight: 600;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // RSVP Form Handler
        function handleRSVPSubmit(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                nama: formData.get('nama'),
                ucapan: formData.get('ucapan'),
                kehadiran: formData.get('kehadiran')
            };

            // Validate
            if (!data.nama || !data.ucapan || !data.kehadiran) {
                showNotification('⚠ Mohon lengkapi semua field');
                return;
            }

            // Add comment to list
            const commentHTML = `
                <p style="animation: fadeIn 0.5s ease-out;">
                    <strong>${escapeHtml(data.nama)}</strong> 
                    <em style="color: var(--text-light); font-size: 0.9rem;">(${data.kehadiran})</em>
                    <br>${escapeHtml(data.ucapan)}
                </p>
            `;
            
            elements.commentsList.insertAdjacentHTML('afterbegin', commentHTML);
            
            // Reset form
            e.target.reset();
            
            // Show success message
            showNotification('✓ Terima kasih atas ucapan dan konfirmasinya!');
            
            // In production, send to server:
            // sendToServer(data);
        }

        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Optional: Send data to server
        function sendToServer(data) {
            fetch('submit_rsvp.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log('Success:', result);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        // Optional: Background Music
        function playBackgroundMusic() {
            const audio = new Audio('music.mp3');
            audio.loop = true;
            audio.volume = 0.3;
            
            audio.play().catch(e => {
                console.log('Audio autoplay prevented:', e);
                // Show play button if autoplay fails
                showMusicControl(audio);
            });
        }

        function showMusicControl(audio) {
            const musicBtn = document.createElement('button');
            musicBtn.innerHTML = '🎵';
            musicBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                font-size: 1.5rem;
                z-index: 9999;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;
            
            let isPlaying = false;
            musicBtn.onclick = () => {
                if (isPlaying) {
                    audio.pause();
                    musicBtn.innerHTML = '🎵';
                } else {
                    audio.play();
                    musicBtn.innerHTML = '⏸';
                }
                isPlaying = !isPlaying;
            };
            
            document.body.appendChild(musicBtn);
        }

        // Smooth Scroll for anchor links
        function initSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }

        // Lazy Loading Images
        function initLazyLoading() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    });
                });

                document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        }

        // Initialize Application
        function init() {
            // Event Listeners
            elements.openButton.addEventListener('click', openInvitation);
            elements.rsvpForm.addEventListener('submit', handleRSVPSubmit);
            
            // Start countdown
            updateCountdown();
            setInterval(updateCountdown, 1000);
            
            // Initialize features
            initSmoothScroll();
            initLazyLoading();
            
            // Prevent body scroll when cover is active
            document.body.style.overflow = 'hidden';
        }

        // Start when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

        // Make functions globally accessible
        window.copyToClipboard = copyToClipboard;
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

/* ==== AUTOPLAY SAFE AUDIO WITH FADE-IN ==== */
document.addEventListener("DOMContentLoaded", () => {
  const audioEl = document.getElementById("bg-audio");
  if (!audioEl) return;

  let targetVolume = 0.35;
  let currentVolume = 0.0;
  let fadeSpeed = 0.02;
  audioEl.volume = 0;
  audioEl.muted = true;
  audioEl.play().then(() => {
    audioEl.muted = false;
    const fadeIn = setInterval(() => {
      if (currentVolume < targetVolume) {
        currentVolume += fadeSpeed;
        audioEl.volume = Math.min(currentVolume, targetVolume);
      } else {
        clearInterval(fadeIn);
      }
    }, 300);
  }).catch((err) => {
    console.warn("Autoplay diblokir, menunggu interaksi pengguna.", err);
    document.addEventListener("click", () => {
      audioEl.muted = false;
      audioEl.play();
      const fadeIn = setInterval(() => {
        if (currentVolume < targetVolume) {
          currentVolume += fadeSpeed;
          audioEl.volume = Math.min(currentVolume, targetVolume);
        } else {
          clearInterval(fadeIn);
        }
      }, 300);
    }, { once: true });
  });
});
