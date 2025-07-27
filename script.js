// 模擬數據
const mockData = {
    // 週用電數據
    weekUsage: {
        categories: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
        data: [28.5, 32.1, 25.8, 29.7, 31.2, 35.6, 27.3],
        total: 210.2,
        lastPeriod: 195.8
    },
    
    // 月用電數據
    monthUsage: {
        categories: ['1週', '2週', '3週', '4週'],
        data: [210.2, 195.8, 218.4, 223.1],
        total: 847.5,
        lastPeriod: 789.3
    },
    
    // 24小時用電數據
    hourlyUsage: [
        0.8, 0.6, 0.5, 0.4, 0.5, 0.7, 1.2, 1.8, 2.1, 2.3,
        2.5, 2.7, 2.9, 3.2, 3.0, 2.8, 2.9, 3.1, 2.7, 2.3,
        2.0, 1.7, 1.3, 1.0
    ],
    
    // 設備狀態
    devices: {
        aircon: { name: '冷氣', icon: '❄️', status: true, consumption: 12.4 },
        light: { name: '照明', icon: '💡', status: true, consumption: 3.2 },
        tv: { name: '電視', icon: '📺', status: false, consumption: 1.8 },
        fridge: { name: '冰箱', icon: '🧊', status: true, consumption: 6.8 }
    }
};

class SmartHomeDashboard {
    constructor() {
        this.currentPeriod = 'week';
        this.usageChart = null;
        this.peakHourChart = null;
        this.currentTheme = 'dark';
        this.initTheme();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initCharts();
        this.updateTotalUsage();
        this.updateDeviceConsumption();
    }

    initTheme() {
        // 從 localStorage 讀取主題偏好
        const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
        this.currentTheme = savedTheme;
        this.applyTheme(savedTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // 更新主題切換按鈕圖標
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        
        // 保存到 localStorage
        localStorage.setItem('dashboard-theme', theme);
        
        // 如果圖表已初始化，重新渲染以適應新主題
        if (this.usageChart || this.peakHourChart) {
            setTimeout(() => {
                this.updateChartsTheme();
            }, 100);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    updateChartsTheme() {
        // 重新初始化圖表以適應新主題
        if (this.usageChart) {
            this.usageChart.destroy();
            this.initUsageChart();
        }
        if (this.peakHourChart) {
            this.peakHourChart.destroy();
            this.initPeakHourChart();
        }
    }

    setupEventListeners() {
        // 主題切換按鈕
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 週/月切換按鈕
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPeriod(e.target.dataset.period);
            });
        });

        // 設備開關控制
        document.querySelectorAll('.device-toggle input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.toggleDevice(e.target.id.replace('-toggle', ''));
            });
        });

        // 下拉選單切換
        document.getElementById('periodSelector').addEventListener('change', (e) => {
            this.switchPeriod(e.target.value);
        });

        // 導航點擊效果
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    switchPeriod(period) {
        this.currentPeriod = period;
        
        // 更新按鈕狀態
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        
        // 更新下拉選單
        document.getElementById('periodSelector').value = period;
        
        // 更新圖表和數據
        this.updateUsageChart();
        this.updateTotalUsage();
    }

    initCharts() {
        this.initUsageChart();
        this.initPeakHourChart();
    }

    getChartColors() {
        const isDark = this.currentTheme === 'dark';
        return {
            textColor: isDark ? '#888888' : '#64748b',
            gridColor: isDark ? '#2a2a2a' : '#e2e8f0',
            bgColor: isDark ? '#1a1a1a' : '#f8fafc',
            primaryColor: isDark ? '#4a9eff' : '#3b82f6',
            secondaryColor: isDark ? '#66b3ff' : '#2563eb'
        };
    }

    initUsageChart() {
        const data = this.currentPeriod === 'week' ? mockData.weekUsage : mockData.monthUsage;
        const colors = this.getChartColors();
        
        this.usageChart = Highcharts.chart('usageChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }
            },
            title: {
                text: null
            },
            xAxis: {
                categories: data.categories,
                gridLineWidth: 0,
                lineColor: colors.gridColor,
                tickColor: colors.gridColor,
                labels: {
                    style: {
                        color: colors.textColor,
                        fontSize: '12px'
                    }
                }
            },
            yAxis: {
                title: {
                    text: '用電量 (kWh)',
                    style: {
                        color: colors.textColor,
                        fontSize: '12px'
                    }
                },
                gridLineColor: colors.gridColor,
                labels: {
                    style: {
                        color: colors.textColor,
                        fontSize: '12px'
                    }
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    borderRadius: 4,
                    pointPadding: 0.1,
                    groupPadding: 0.1
                }
            },
            series: [{
                name: '用電量',
                data: data.data,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, colors.primaryColor],
                        [1, colors.secondaryColor]
                    ]
                }
            }],
            tooltip: {
                backgroundColor: colors.bgColor,
                borderColor: colors.gridColor,
                style: {
                    color: colors.textColor
                }
            },
            credits: {
                enabled: false
            }
        });
    }

    initPeakHourChart() {
        const colors = this.getChartColors();
        
        this.peakHourChart = Highcharts.chart('peakHourChart', {
            chart: {
                type: 'areaspline',
                backgroundColor: 'transparent',
                height: 200
            },
            title: {
                text: null
            },
            xAxis: {
                categories: Array.from({length: 24}, (_, i) => `${i}:00`),
                gridLineWidth: 0,
                lineColor: colors.gridColor,
                tickColor: colors.gridColor,
                labels: {
                    step: 4,
                    style: {
                        color: colors.textColor,
                        fontSize: '10px'
                    }
                }
            },
            yAxis: {
                title: {
                    text: null
                },
                gridLineColor: colors.gridColor,
                labels: {
                    style: {
                        color: colors.textColor,
                        fontSize: '10px'
                    }
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                areaspline: {
                    fillOpacity: 0.3,
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                radius: 4
                            }
                        }
                    }
                }
            },
            series: [{
                name: '用電量',
                data: mockData.hourlyUsage,
                color: colors.primaryColor,
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, colors.primaryColor + '4d'], // 30% opacity
                        [1, colors.primaryColor + '0d']  // 5% opacity
                    ]
                }
            }],
            tooltip: {
                backgroundColor: colors.bgColor,
                borderColor: colors.gridColor,
                style: {
                    color: colors.textColor
                },
                formatter: function() {
                    return `<b>${this.x}</b><br/>用電量: ${this.y} kW`;
                }
            },
            credits: {
                enabled: false
            }
        });
    }

    updateUsageChart() {
        if (this.usageChart) {
            const data = this.currentPeriod === 'week' ? mockData.weekUsage : mockData.monthUsage;
            this.usageChart.xAxis[0].setCategories(data.categories);
            this.usageChart.series[0].setData(data.data);
        }
    }

    updateTotalUsage() {
        const data = this.currentPeriod === 'week' ? mockData.weekUsage : mockData.monthUsage;
        
        document.getElementById('totalUsage').textContent = data.total.toLocaleString();
        document.getElementById('lastPeriodUsage').textContent = data.lastPeriod.toLocaleString();
        
        // 計算變化百分比
        const change = ((data.total - data.lastPeriod) / data.lastPeriod * 100).toFixed(1);
        const comparisonIcon = change > 0 ? '📈' : '📉';
        document.querySelector('.comparison-icon').textContent = comparisonIcon;
    }

    toggleDevice(deviceId) {
        const device = mockData.devices[deviceId];
        if (device && deviceId !== 'fridge') { // 冰箱不能關閉
            device.status = !device.status;
            
            // 更新狀態顯示
            const deviceItem = document.querySelector(`[data-device="${deviceId}"]`);
            const statusElement = deviceItem.querySelector('.device-status');
            statusElement.textContent = device.status ? '開啟' : '關閉';
            
            // 更新耗電量顯示
            this.updateDeviceConsumption();
            
            // 添加動畫效果
            deviceItem.style.transform = 'scale(0.98)';
            setTimeout(() => {
                deviceItem.style.transform = 'scale(1)';
            }, 150);
        }
    }

    updateDeviceConsumption() {
        // 重新計算設備耗電量排序
        const devices = Object.entries(mockData.devices)
            .filter(([_, device]) => device.status)
            .sort(([,a], [,b]) => b.consumption - a.consumption);
        
        const consumptionList = document.querySelector('.device-consumption-list');
        consumptionList.innerHTML = '';
        
        const maxConsumption = Math.max(...devices.map(([_, device]) => device.consumption));
        
        devices.forEach(([id, device]) => {
            const percentage = (device.consumption / maxConsumption * 100).toFixed(0);
            
            const item = document.createElement('div');
            item.className = 'consumption-item';
            item.innerHTML = `
                <div class="consumption-device">
                    <span class="device-icon">${device.icon}</span>
                    <span class="device-name">${device.name}</span>
                </div>
                <div class="consumption-bar">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="consumption-value">${device.consumption} kWh</span>
            `;
            
            consumptionList.appendChild(item);
        });
    }

    // 模擬即時數據更新
    startRealTimeUpdates() {
        setInterval(() => {
            // 隨機更新設備耗電量
            Object.keys(mockData.devices).forEach(deviceId => {
                const device = mockData.devices[deviceId];
                if (device.status) {
                    const variation = (Math.random() - 0.5) * 0.2; // ±0.1 的變化
                    device.consumption = Math.max(0.1, device.consumption + variation);
                }
            });
            
            // 更新顯示
            this.updateDeviceConsumption();
            
            // 隨機更新當前時段的最後一個數據點
            if (Math.random() > 0.7) { // 30% 機率更新
                const data = this.currentPeriod === 'week' ? mockData.weekUsage : mockData.monthUsage;
                const lastIndex = data.data.length - 1;
                const variation = (Math.random() - 0.5) * 2;
                data.data[lastIndex] = Math.max(0, data.data[lastIndex] + variation);
                data.total = data.data.reduce((sum, val) => sum + val, 0);
                
                if (this.usageChart) {
                    this.usageChart.series[0].setData(data.data, true);
                }
                this.updateTotalUsage();
            }
        }, 5000); // 每5秒更新一次
    }
}

// 當頁面載入完成後初始化儀表板
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new SmartHomeDashboard();
    
    // 啟動即時更新（可選）
    dashboard.startRealTimeUpdates();
    
    // 添加一些視覺效果
    setTimeout(() => {
        document.querySelectorAll('.card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}); 