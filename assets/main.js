document.addEventListener('DOMContentLoaded', () => {


    let menuData;

    async function loadMenu() {
        try {
            const response = await fetch("./assets/data/lunch.json");
            const data = await response.json();

            menuData = data['menu_estivo'];

            const startDate = new Date(2026, 3, 6);
            const endDate = new Date(2026, 8, 30);
            const daysWeek = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
            const monthsAbbr = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

            let currentIndex = 0;
            let datesArray = [];
            const container = document.getElementById('cardsContainer');
            const calendar = document.getElementById('calendar');

            function init() {
                let d = new Date(startDate);
                let i = 0;
                const today = new Date();
                let startIndex = 0;

                while (d <= endDate) {
                    const dateObj = new Date(d);
                    datesArray.push(dateObj);

                    const slide = document.createElement('div');
                    slide.className = `slide ${dateObj.getDay() === 0 || dateObj.getDay() === 6 ? 'weekend' : ''}`;
                    slide.innerHTML = `<span>${daysWeek[dateObj.getDay()].substring(0, 3)}</span><strong>${dateObj.getDate()}</strong><span>${monthsAbbr[dateObj.getMonth()]}</span>`;
                    slide.onclick = () => goToIndex(Array.from(calendar.children).indexOf(slide));
                    calendar.appendChild(slide);

                    const card = document.createElement('div');
                    card.className = 'menu-card';
                    card.innerHTML = createCardHTML(dateObj, i);
                    container.appendChild(card);

                    if (dateObj.toDateString() === today.toDateString()) startIndex = i;
                    d.setDate(d.getDate() + 1);
                    i++;

                }
                    document.querySelector('#today').addEventListener('click', () => {
                        setTimeout(() => goToIndex(startIndex), 100);
                    } );

                setTimeout(() => goToIndex(startIndex), 100);
                setupInteraction();
            }

            function createCardHTML(date, i) {
                const diffDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
                const weekNum = (Math.floor(diffDays / 7) % 4) + 1;
                const dayName = daysWeek[date.getDay()];
                const menu = (dayName === "sabato" || dayName === "domenica") ? null : menuData[`settimana_${weekNum}`][dayName];
                const coloriSettimana = [
                    "160, 80, 48",  // Lunedì (Cotto)
                    "112, 64, 32",  // Martedì (Verde)
                    "80, 96, 80",  // Mercoledì (Blu)
                    "170, 160, 100",  // Mercoledì (Blu)
                    // ...continua per gli altri giorni
                ];
                const color = coloriSettimana[i % coloriSettimana.length];
                const primo = `url('images/primo.jpg')`;
                const secondo = `url('images/secondo.jpg')`;
                const contorno = `url('images/contorno.jpg')`;
                const pane = `url('images/pane.jpg')`;
                const frutta = `url('images/frutta.jpg')`;
                if (!menu) return `<div class="card-content"><div class="no-service">Weekend<br>Mensa Chiusa</div></div>`;

                return `
                <div class="card-content">
                    <h3>${dayName}</h3>
                    
                    <div class="menu-item" style="--bg-rgb: ${color}; --bg-image: ${primo}">
                        <span class="label">Primo</span>
                        <div class="content">${menu['primo']}</div>
                    </div>
                
                    ${menu['secondo'] ? `
                    <div class="menu-item" style="--bg-rgb: ${color}; --bg-image: ${secondo}">
                        <span class="label">Secondo</span>
                        <div class="content">${menu['secondo']}</div>
                    </div>` : ''}
                
                    ${menu['contorno'] ? `
                    <div class="menu-item" style="--bg-rgb: ${color}; --bg-image: ${contorno}">
                        <span class="label">Contorno</span>
                        <div class="content">${menu['contorno']}</div>
                    </div>` : ''}
                
                    <div class="menu-item" style="--bg-rgb: ${color}; --bg-image: ${pane}">
                        <span class="label">Pane</span>
                        <div class="content">${menu['pane']}</div>
                    </div>
                
                    <div class="menu-item" style="--bg-rgb: ${color}; --bg-image: ${frutta}">
                        <span class="label">Frutta</span>
                        <div class="content">${menu['frutta']}</div>
                    </div>
                </div>
                `;
            }

            function goToIndex(index) {
                if (index < 0 || index >= datesArray.length) return;
                currentIndex = index;

                // OFFSET LOGIC:
                // Su mobile ogni card è 60% + 5% margine = 65% di spostamento per ogni index.
                // Partiamo da un piccolo padding iniziale (es: 10%) per non appiccicare la card al bordo sinistro.
                const cardStep = window.innerWidth < 768 ? 85 : 42;
                const paddingLeft = 10;
                const move = paddingLeft - (index * cardStep);

                container.style.transform = `translateX(${move}%)`;

                document.querySelectorAll('.menu-card').forEach((c, i) => c.classList.toggle('active', i === index));
                const slides = document.querySelectorAll('.slide');
                slides.forEach((s, i) => s.classList.toggle('active', i === index));

                const activeSlide = slides[index];
                calendar.scrollTo({
                    left: activeSlide.offsetLeft - (calendar.offsetWidth / 2) + (activeSlide.offsetWidth / 2),
                    behavior: 'smooth'
                });
            }

            function setupInteraction() {
                let touchStartX = 0;
                let isDragging = false;
                const slider = document.getElementById('mainSlider');

                // Touch
                slider.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
                slider.addEventListener('touchend', e => handleSwipe(touchStartX, e.changedTouches[0].screenX), {passive: true});

                // Mouse Drag
                slider.addEventListener('mousedown', e => {
                    isDragging = true;
                    touchStartX = e.pageX;
                });
                slider.addEventListener('mouseup', e => {
                    if (isDragging) {
                        isDragging = false;
                        handleSwipe(touchStartX, e.pageX);
                    }
                });

                function handleSwipe(start, end) {
                    const delta = start - end;
                    if (Math.abs(delta) > 35) {
                        if (delta > 0) goToIndex(currentIndex + 1);
                        else goToIndex(currentIndex - 1);
                    }
                }
            }

            init();

            // La logica che dipende dai dati deve stare QUI
            console.log("Dati caricati:", menuData);
        } catch (error) {
            console.error("Errore durante il caricamento:", error);
        }
    }

    loadMenu().then();

})


