// 1. Simulación de la Base de Datos (Detalle de Ventas)
const database = [
    { id: 1, ciudad: "Bogotá", vendedor: "Carlos Mendoza", categoria: "Tecnología", ingresos: 9400000 },
    { id: 2, ciudad: "Medellín", vendedor: "Ana Silva", categoria: "Electrodomésticos", ingresos: 2800000 },
    { id: 3, ciudad: "Medellín", vendedor: "Ana Silva", categoria: "Tecnología", ingresos: 2400000 },
    { id: 4, ciudad: "Cali", vendedor: "Luis Gómez", categoria: "Electrodomésticos", ingresos: 3800000 },
    { id: 5, ciudad: "Cali", vendedor: "Luis Gómez", categoria: "Oficina", ingresos: 330000 },
    { id: 6, ciudad: "Barranquilla", vendedor: "Marta Ruiz", categoria: "Electrodomésticos", ingresos: 3800000 },
    { id: 7, ciudad: "Bucaramanga", vendedor: "Diego López", categoria: "Tecnología", ingresos: 1100000 },
    { id: 8, ciudad: "Bogotá", vendedor: "Carlos Mendoza", categoria: "Tecnología", ingresos: 3500000 },
    { id: 9, ciudad: "Cali", vendedor: "Luis Gómez", categoria: "Oficina", ingresos: 450000 },
    { id: 10, ciudad: "Bogotá", vendedor: "Carlos Mendoza", categoria: "Tecnología", ingresos: 2200000 },
    { id: 11, ciudad: "Medellín", vendedor: "Ana Silva", categoria: "Tecnología", ingresos: 7000000 },
    { id: 12, ciudad: "Medellín", vendedor: "Ana Silva", categoria: "Oficina", ingresos: 1030000 }
];

// Variables Globales para los Gráficos
let barChartInstance = null;
let doughnutChartInstance = null;

// Formateador de moneda colombiana
const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// 2. Función Principal: Actualizar Dashboard
function updateDashboard() {
    const selectedCity = document.getElementById('filter-city').value;
    const selectedCategory = document.getElementById('filter-category').value;

    // Filtrar los datos según las selecciones
    let filteredData = database.filter(item => {
        const matchCity = selectedCity === "Todas" || item.ciudad === selectedCity;
        const matchCategory = selectedCategory === "Todas" || item.categoria === selectedCategory;
        return matchCity && matchCategory;
    });

    // Actualizar Tarjetas KPI
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.ingresos, 0);
    const totalTransactions = filteredData.length;
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    document.getElementById('kpi-revenue').innerText = formatter.format(totalRevenue);
    document.getElementById('kpi-transactions').innerText = totalTransactions;
    document.getElementById('kpi-average').innerText = formatter.format(averageTicket);

    // Preparar datos para Gráfico de Barras (Vendedores)
    const salesByVendor = {};
    filteredData.forEach(item => {
        salesByVendor[item.vendedor] = (salesByVendor[item.vendedor] || 0) + item.ingresos;
    });

    // Preparar datos para Gráfico de Anillo (Categorías)
    const salesByCategory = {};
    filteredData.forEach(item => {
        salesByCategory[item.categoria] = (salesByCategory[item.categoria] || 0) + item.ingresos;
    });

    renderCharts(salesByVendor, salesByCategory);
}

// 3. Función para dibujar los gráficos con Chart.js
function renderCharts(vendorData, categoryData) {
    // Destruir gráficos previos si existen para redibujarlos limpios
    if (barChartInstance) barChartInstance.destroy();
    if (doughnutChartInstance) doughnutChartInstance.destroy();

    // Detectar color de texto según el tema actual
    const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-main').trim();
    const mutedColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-muted').trim();

    // Configuración Gráfico de Barras
    const ctxBar = document.getElementById('barChart').getContext('2d');
    barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: Object.keys(vendorData),
            datasets: [{
                label: 'Ingresos (COP)',
                data: Object.values(vendorData),
                backgroundColor: '#3b82f6',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: mutedColor },
                    grid: { color: mutedColor + '22' }
                },
                x: {
                    ticks: { color: mutedColor },
                    grid: { color: mutedColor + '22' }
                }
            }
        }
    });

    // Configuración Gráfico de Anillo
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    doughnutChartInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#1e3a8a', '#3b82f6', '#93c5fd', '#dbeafe'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor }
                }
            }
        }
    });
}

// 4. Escuchadores de Eventos (Filtros)
document.getElementById('filter-city').addEventListener('change', updateDashboard);
document.getElementById('filter-category').addEventListener('change', updateDashboard);

// =========================================
// 5. Modo Oscuro (Dark Mode Toggle)
// =========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('.icon');
const themeLabelText = themeToggleBtn.querySelector('.label-text');

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.textContent = '🌙';
        themeLabelText.textContent = 'Modo Claro';
    } else {
        themeIcon.textContent = '☀️';
        themeLabelText.textContent = 'Modo Oscuro';
    }
    // Re-renderizar gráficos para que Chart.js adapte los colores de texto
    updateDashboard();
}

// Cargar preferencia guardada o respetar la del sistema
const savedTheme = localStorage.getItem('dashboard-theme');
if (savedTheme) {
    applyTheme(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dashboard-theme', newTheme);
    applyTheme(newTheme);
});

// =========================================
// 6. Sidebar Responsive (Hamburguesa)
// =========================================
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    sidebarToggleBtn.textContent = '✕';
    sidebarToggleBtn.setAttribute('aria-label', 'Cerrar filtros');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    sidebarToggleBtn.textContent = '☰';
    sidebarToggleBtn.setAttribute('aria-label', 'Abrir filtros');
}

sidebarToggleBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
});

sidebarOverlay.addEventListener('click', closeSidebar);

// Cerrar sidebar al cambiar un filtro en móvil
document.getElementById('filter-city').addEventListener('change', closeSidebar);
document.getElementById('filter-category').addEventListener('change', closeSidebar);

// Inicializar el dashboard al cargar la página
updateDashboard();
