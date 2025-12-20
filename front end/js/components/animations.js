/* مسار الملف: js/components/animations.js */

// Typewriter Logic
function typeWriter(element, speed = 40) {
    let text = element.textContent.trim();
    element.textContent = "";
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

export function initTypewriter() {
    const title = document.getElementById("typewriter-title");
    const description = document.getElementById("typewriter-description");

    if (title) typeWriter(title, 50);
    if (description) setTimeout(() => typeWriter(description, 25), 700);
}

// Slider Logic
export function initSlider() {
    const track = document.getElementById('cardsTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!track || !dotsContainer) return;

    const cards = Array.from(track.children);

    cards.forEach((card, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
            const scrollAmount = card.offsetLeft - track.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
            track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
    });

    track.addEventListener('scroll', () => {
        const center = track.scrollLeft + (track.clientWidth / 2);
        cards.forEach((card, index) => {
            const cardCenter = card.offsetLeft + (card.clientWidth / 2);
            if (Math.abs(center - cardCenter) < card.clientWidth / 2) {
                const dots = document.querySelectorAll('.dot');
                dots.forEach(d => d.classList.remove('active'));
                if(dots[index]) dots[index].classList.add('active');
            }
        });
    });
}